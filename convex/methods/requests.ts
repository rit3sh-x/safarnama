import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireTripAdmin, requireUserAccess, getTrip } from "../lib/utils";
import { components } from "../_generated/api";
import { Doc } from "../betterAuth/_generated/dataModel";

export const request = mutation({
    args: {
        tripId: v.id("trip"),
        message: v.optional(v.string()),
    },
    handler: async (ctx, { tripId, message }) => {
        const user = await requireUserAccess(ctx);
        const trip = await getTrip(ctx, tripId);

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

        const existing = await ctx.db
            .query("joinRequest")
            .withIndex("userId_tripId", (q) =>
                q.eq("userId", user._id).eq("tripId", tripId)
            )
            .unique();
        if (existing?.status === "pending")
            throw new Error("Request already pending");

        return ctx.db.insert("joinRequest", {
            tripId,
            orgId: trip.orgId,
            userId: user._id,
            message,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

export const listPending = query({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        await requireTripAdmin(ctx, tripId);
        return ctx.db
            .query("joinRequest")
            .withIndex("tripId_status", (q) =>
                q.eq("tripId", tripId).eq("status", "pending")
            )
            .collect();
    },
});

export const review = mutation({
    args: {
        requestId: v.id("joinRequest"),
        action: v.union(v.literal("accept"), v.literal("reject")),
    },
    handler: async (ctx, { requestId, action }) => {
        const req = await ctx.db.get(requestId);

        if (!req) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Request not found",
            });
        }

        if (req.status !== "pending") {
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Request already reviewed",
            });
        }

        const { user } = await requireTripAdmin(ctx, req.tripId);
        const now = Date.now();

        await ctx.db.patch(requestId, {
            status: action === "accept" ? "accepted" : "rejected",
            reviewedBy: user._id,
            reviewedAt: now,
        });

        if (action === "accept") {
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
        }
    },
});
