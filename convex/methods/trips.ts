import { components } from "@backend/api";
import { ConvexError, v } from "convex/values";
import { nanoid } from "nanoid";
import { TableNames } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";
import { requireTripAdmin, requireUserAccess } from "../lib/utils";
import { LIMITS } from "../lib/constants";
import { paginationOptsValidator, PaginationResult } from "convex/server";
import { Doc } from "../betterAuth/_generated/dataModel";
import { Org } from "../betterAuth/methods/types";

export const create = mutation({
    args: {
        title: v.string(),
        destination: v.string(),
        logoUrl: v.optional(v.string()),
        isPublic: v.boolean(),
        description: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, { title, logoUrl, ...fields }) => {
        const user = await requireUserAccess(ctx);

        const tripCount: number = await ctx.runQuery(
            components.betterAuth.methods.orgs.countUserMemberships,
            { userId: user._id }
        );
        if (tripCount >= LIMITS.MAX_TRIPS_PER_USER) {
            throw new ConvexError({
                code: "FORBIDDEN",
                message: `You can be part of at most ${LIMITS.MAX_TRIPS_PER_USER} trips. Leave or delete a trip first.`,
            });
        }

        const now = Date.now();

        const baseSlug = title
            .toLowerCase()
            .replace(/[^\w ]+/g, "")
            .replace(/ +/g, "-");

        const slug = `${baseSlug}-${nanoid(10)}`;

        const org = await ctx.runMutation(
            components.betterAuth.adapter.create,
            {
                input: {
                    model: "organization",
                    data: {
                        name: title,
                        slug,
                        logo: logoUrl,
                        createdAt: now,
                        updatedAt: now,
                        metadata: null,
                    },
                },
            }
        );

        await ctx.runMutation(components.betterAuth.adapter.create, {
            input: {
                model: "member",
                data: {
                    organizationId: org._id,
                    userId: user._id,
                    role: "owner",
                    createdAt: now,
                },
            },
        });

        const tripId = await ctx.db.insert("trip", {
            orgId: org._id,
            title,
            ...fields,
            createdBy: user._id,
            updatedAt: now,
        });

        await ctx.db.insert("tripMember", {
            tripId,
            userId: user._id,
        });

        return tripId;
    },
});

export const list = query({
    args: {
        search: v.optional(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { search, paginationOpts }) => {
        const user = await requireUserAccess(ctx);

        const memberships = await ctx.runQuery(
            components.betterAuth.methods.orgs.listUserMemberships,
            { userId: user._id }
        );

        const orgIds = memberships.page.map((m: any) => m.organizationId);

        const orgs: PaginationResult<Doc<"organization">> = await ctx.runQuery(
            components.betterAuth.adapter.findMany,
            {
                model: "organization",
                where: [
                    {
                        field: "_id",
                        value: orgIds,
                        operator: "in" as const,
                        connector: "AND" as const,
                    },
                    ...(search
                        ? [
                              {
                                  field: "name",
                                  value: search,
                                  operator: "contains" as const,
                              },
                          ]
                        : []),
                ],
                paginationOpts,
            }
        );

        return {
            ...memberships,
            page: orgs.page.map((o) => ({
                name: o.name,
                id: o._id,
                logo: o.logo,
                updatedAt: o.updatedAt,
            })),
        };
    },
});

export const listPublic = query({
    args: {
        search: v.optional(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { search, paginationOpts }) => {
        const s = search?.trim().toLowerCase();

        const trips = await ctx.db
            .query("trip")
            .withIndex("isPublic", (q) => q.eq("isPublic", true))
            .filter((q2) =>
                s
                    ? q2.or(
                          q2.gte(q2.field("title"), s),
                          q2.gte(q2.field("destination"), s)
                      )
                    : q2.eq(q2.field("isPublic"), true)
            )
            .order("desc")
            .paginate(paginationOpts);

        const orgIds = trips.page.map((t) => t.orgId);

        const orgs: Org[] = await ctx.runQuery(
            components.betterAuth.methods.orgs.getOrgsByIds,
            { orgIds }
        );

        return {
            ...trips,
            page: orgs,
        };
    },
});

export const update = mutation({
    args: {
        tripId: v.id("trip"),
        title: v.optional(v.string()),
        destination: v.optional(v.string()),
        description: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        isPublic: v.optional(v.boolean()),
    },
    handler: async (ctx, { tripId, title, ...fields }) => {
        const { trip } = await requireTripAdmin(ctx, tripId);

        if (title && title !== trip.title) {
            await ctx.runMutation(components.betterAuth.adapter.updateOne, {
                input: {
                    model: "organization",
                    where: [
                        { field: "_id", value: trip.orgId, operator: "eq" },
                    ],
                    update: { name: title },
                },
            });
        }

        await ctx.db.patch(tripId, {
            ...(title !== undefined && { title }),
            ...fields,
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        const { trip } = await requireTripAdmin(ctx, tripId);

        const indexedTables: { name: TableNames; index: string }[] = [
            { name: "message", index: "tripId" },
            { name: "expense", index: "tripId" },
            { name: "expenseSplit", index: "tripId" },
            { name: "settlement", index: "tripId" },
            { name: "joinRequest", index: "tripId" },
            { name: "blog", index: "tripId" },
            { name: "blogComment", index: "tripId" },
        ];

        for (const table of indexedTables) {
            const docs = await ctx.db
                .query(table.name)
                .withIndex(table.index as any, (q) =>
                    q.eq("tripId", tripId as any)
                )
                .collect();

            await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
        }

        const tripMembers = await ctx.db
            .query("tripMember")
            .filter((q) => q.eq(q.field("tripId"), tripId))
            .collect();
        await Promise.all(tripMembers.map((doc) => ctx.db.delete(doc._id)));

        await ctx.runMutation(
            components.betterAuth.methods.orgs.deleteOrgAndRelated,
            { organizationId: trip.orgId }
        );

        await ctx.db.delete(tripId);
    },
});
