import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
    requireTripPermission,
    requireUserAccess,
    getTripFromOrgId,
} from "../lib/utils";
import { components } from "../_generated/api";
import { Doc } from "../betterAuth/_generated/dataModel";
import { LIMITS } from "../lib/constants";
import { paginationOptsValidator } from "convex/server";

export const userSendRequest = mutation({
    args: {
        orgId: v.id("organization"),
        message: v.optional(v.string()),
    },
    handler: async (ctx, { orgId, message }) => {
        const user = await requireUserAccess(ctx);
        const trip = await getTripFromOrgId(ctx, orgId);

        if (!trip.isPublic) {
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Trip is not public",
            });
        }

        const member: Doc<"member"> | null = await ctx.runQuery(
            components.betterAuth.adapter.findOne,
            {
                model: "member",
                where: [
                    { field: "userId", value: user._id, operator: "eq" },
                    {
                        field: "organizationId",
                        value: trip.orgId,
                        operator: "eq",
                    },
                ],
            }
        );

        if (member) {
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Already a member",
            });
        }

        const existingForTrip = await ctx.db
            .query("joinRequest")
            .withIndex("userId_tripId", (q) =>
                q.eq("userId", user._id).eq("tripId", trip._id)
            )
            .collect();

        if (existingForTrip.some((r) => r.status === "pending"))
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Request already pending",
            });

        for (const old of existingForTrip) {
            await ctx.db.delete(old._id);
        }

        const tripCount: number = await ctx.runQuery(
            components.betterAuth.methods.orgs.countUserMemberships,
            { userId: user._id }
        );

        const pendingRequests = await ctx.db
            .query("joinRequest")
            .withIndex("userId_tripId", (q) => q.eq("userId", user._id))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        if (pendingRequests.length >= LIMITS.MAX_REQUESTS_PER_USER) {
            throw new ConvexError({
                code: "FORBIDDEN",
                message: `You have too many pending requests. Cancel some before sending more.`,
            });
        }

        if (tripCount + pendingRequests.length >= LIMITS.MAX_TRIPS_PER_USER) {
            throw new ConvexError({
                code: "FORBIDDEN",
                message: `You can be part of at most ${LIMITS.MAX_TRIPS_PER_USER} trips. Your current trips plus pending requests have reached the limit.`,
            });
        }

        return ctx.db.insert("joinRequest", {
            tripId: trip._id,
            orgId: trip.orgId,
            userId: user._id,
            message,
            status: "pending",
            type: "user_request",
        });
    },
});

export const userListRequests = query({
    args: {
        search: v.optional(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { search, paginationOpts }) => {
        const user = await requireUserAccess(ctx);
        const searchTerm = search?.trim().toLowerCase();
        const pageSize = paginationOpts.numItems;

        const baseQuery = () =>
            ctx.db
                .query("joinRequest")
                .withIndex("userId_tripId", (qb) => qb.eq("userId", user._id))
                .filter((qb) => qb.eq(qb.field("status"), "pending"));

        if (!searchTerm) {
            const results = await baseQuery().paginate(paginationOpts);
            const enriched = await Promise.all(
                results.page.map(async (req) => {
                    const trip = await ctx.db.get(req.tripId);
                    return { ...req, trip };
                })
            );
            return { ...results, page: enriched };
        }

        const collected: any[] = [];
        let cursor = paginationOpts.cursor;
        let isDone = false;

        while (collected.length < pageSize && !isDone) {
            const batch = await baseQuery().paginate({
                numItems: pageSize,
                cursor,
            });

            const enriched = await Promise.all(
                batch.page.map(async (req) => {
                    const trip = await ctx.db.get(req.tripId);
                    return { ...req, trip };
                })
            );

            for (const r of enriched) {
                if (collected.length >= pageSize) break;
                const title = r.trip?.title?.toLowerCase() ?? "";
                const dest = r.trip?.destination?.toLowerCase() ?? "";
                if (title.includes(searchTerm) || dest.includes(searchTerm)) {
                    collected.push(r);
                }
            }

            cursor = batch.continueCursor;
            isDone = batch.isDone;
        }

        return {
            page: collected,
            isDone,
            continueCursor: cursor ?? "",
        };
    },
});

export const userCancelRequest = mutation({
    args: { requestId: v.id("joinRequest") },
    handler: async (ctx, { requestId }) => {
        const user = await requireUserAccess(ctx);
        const req = await ctx.db.get(requestId);

        if (!req)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Request not found",
            });
        if (req.userId !== user._id)
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Not your request",
            });
        if (req.type !== "user_request")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Not a user request",
            });
        if (req.status !== "pending")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Request already reviewed",
            });

        await ctx.db.delete(requestId);
    },
});

export const userReviewInvite = mutation({
    args: {
        requestId: v.id("joinRequest"),
        action: v.union(v.literal("accept"), v.literal("reject")),
    },
    handler: async (ctx, { requestId, action }) => {
        const user = await requireUserAccess(ctx);
        const req = await ctx.db.get(requestId);

        if (!req)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Invite not found",
            });
        if (req.type !== "admin_invite")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Not an invite",
            });
        if (req.userId !== user._id)
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Not your invite",
            });
        if (req.status !== "pending")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Invite already reviewed",
            });

        await ctx.db.patch(requestId, {
            status: action === "accept" ? "accepted" : "rejected",
        });

        if (action === "accept") {
            const tripCount: number = await ctx.runQuery(
                components.betterAuth.methods.orgs.countUserMemberships,
                { userId: user._id }
            );
            if (tripCount >= LIMITS.MAX_TRIPS_PER_USER) {
                throw new ConvexError({
                    code: "FORBIDDEN",
                    message: `You can be part of at most ${LIMITS.MAX_TRIPS_PER_USER} trips.`,
                });
            }

            const now = Date.now();
            await ctx.runMutation(components.betterAuth.adapter.create, {
                input: {
                    model: "member",
                    data: {
                        organizationId: req.orgId,
                        userId: req.userId,
                        role: "member",
                        createdAt: now,
                    },
                },
            });

            await ctx.db.insert("tripMember", {
                tripId: req.tripId,
                userId: req.userId,
            });
        }
    },
});

export const adminSendInvite = mutation({
    args: {
        orgId: v.id("organization"),
        userId: v.string(),
        message: v.optional(v.string()),
    },
    handler: async (ctx, { orgId, userId, message }) => {
        const trip = await getTripFromOrgId(ctx, orgId);
        await requireTripPermission(ctx, trip._id, "member:invite");

        const member: Doc<"member"> | null = await ctx.runQuery(
            components.betterAuth.adapter.findOne,
            {
                model: "member",
                where: [
                    { field: "userId", value: userId, operator: "eq" },
                    {
                        field: "organizationId",
                        value: trip.orgId,
                        operator: "eq",
                    },
                ],
            }
        );

        if (member)
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Already a member",
            });

        const existingForTrip = await ctx.db
            .query("joinRequest")
            .withIndex("userId_tripId", (q) =>
                q.eq("userId", userId).eq("tripId", trip._id)
            )
            .collect();

        if (existingForTrip.some((r) => r.status === "pending")) {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Invite already pending",
            });
        }

        for (const old of existingForTrip) {
            await ctx.db.delete(old._id);
        }

        const targetTripCount: number = await ctx.runQuery(
            components.betterAuth.methods.orgs.countUserMemberships,
            { userId }
        );

        const targetPending = await ctx.db
            .query("joinRequest")
            .withIndex("userId_tripId", (q) => q.eq("userId", userId))
            .filter((q) => q.eq(q.field("status"), "pending"))
            .collect();

        if (
            targetTripCount + targetPending.length >=
            LIMITS.MAX_TRIPS_PER_USER
        ) {
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "This user has reached the maximum number of trips.",
            });
        }

        return ctx.db.insert("joinRequest", {
            tripId: trip._id,
            orgId: trip.orgId,
            userId,
            message,
            status: "pending",
            type: "admin_invite",
        });
    },
});

export const adminListRequests = query({
    args: {
        orgId: v.id("organization"),
        search: v.optional(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { orgId, search, paginationOpts }) => {
        const trip = await getTripFromOrgId(ctx, orgId);
        await requireTripPermission(ctx, trip._id, "member:invite");
        const searchTerm = search?.trim().toLowerCase();
        const pageSize = paginationOpts.numItems;

        const baseQuery = () =>
            ctx.db
                .query("joinRequest")
                .withIndex("tripId_status", (qb) =>
                    qb.eq("tripId", trip._id).eq("status", "pending")
                )
                .filter((qb) => qb.eq(qb.field("type"), "user_request"));

        const enrichUser = async (req: any) => {
            const user: Doc<"user"> | null = await ctx.runQuery(
                components.betterAuth.adapter.findOne,
                {
                    model: "user",
                    where: [
                        { field: "_id", value: req.userId, operator: "eq" },
                    ],
                }
            );
            return { ...req, user };
        };

        if (!searchTerm) {
            const results = await baseQuery().paginate(paginationOpts);
            const enriched = await Promise.all(results.page.map(enrichUser));
            return { ...results, page: enriched };
        }

        const collected: any[] = [];
        let cursor = paginationOpts.cursor;
        let isDone = false;

        while (collected.length < pageSize && !isDone) {
            const batch = await baseQuery().paginate({
                numItems: pageSize,
                cursor,
            });

            const enriched = await Promise.all(batch.page.map(enrichUser));

            for (const r of enriched) {
                if (collected.length >= pageSize) break;
                const name = r.user?.name?.toLowerCase() ?? "";
                const username = r.user?.username?.toLowerCase() ?? "";
                if (
                    name.includes(searchTerm) ||
                    username.includes(searchTerm)
                ) {
                    collected.push(r);
                }
            }

            cursor = batch.continueCursor;
            isDone = batch.isDone;
        }

        return {
            page: collected,
            isDone,
            continueCursor: cursor ?? "",
        };
    },
});

export const adminCancelInvite = mutation({
    args: { requestId: v.id("joinRequest") },
    handler: async (ctx, { requestId }) => {
        const req = await ctx.db.get(requestId);

        if (!req)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Invite not found",
            });
        if (req.type !== "admin_invite")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Not an invite",
            });
        if (req.status !== "pending")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Invite already reviewed",
            });

        await requireTripPermission(ctx, req.tripId, "member:invite");
        await ctx.db.delete(requestId);
    },
});

export const adminReviewRequest = mutation({
    args: {
        requestId: v.id("joinRequest"),
        action: v.union(v.literal("accept"), v.literal("reject")),
    },
    handler: async (ctx, { requestId, action }) => {
        const req = await ctx.db.get(requestId);

        if (!req)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Request not found",
            });
        if (req.type !== "user_request")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Not a user request",
            });
        if (req.status !== "pending")
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Request already reviewed",
            });

        await requireTripPermission(ctx, req.tripId, "member:add");

        await ctx.db.patch(requestId, {
            status: action === "accept" ? "accepted" : "rejected",
        });

        if (action === "accept") {
            const tripCount: number = await ctx.runQuery(
                components.betterAuth.methods.orgs.countUserMemberships,
                { userId: req.userId }
            );
            if (tripCount >= LIMITS.MAX_TRIPS_PER_USER) {
                throw new ConvexError({
                    code: "FORBIDDEN",
                    message:
                        "This user has reached the maximum number of trips.",
                });
            }

            const now = Date.now();
            await ctx.runMutation(components.betterAuth.adapter.create, {
                input: {
                    model: "member",
                    data: {
                        organizationId: req.orgId,
                        userId: req.userId,
                        role: "member",
                        createdAt: now,
                    },
                },
            });

            await ctx.db.insert("tripMember", {
                tripId: req.tripId,
                userId: req.userId,
            });
        }
    },
});
