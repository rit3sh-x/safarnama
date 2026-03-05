import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
    requireTripAdmin,
    getTrip,
    requireOrgAccess,
    requireTripMember,
} from "../lib/utils";
import { PAGINATION } from "../lib/constants";
import { TableNames } from "../_generated/dataModel";

export const create = mutation({
    args: {
        orgId: v.string(),
        title: v.string(),
        destination: v.string(),
        defaultCurrency: v.string(),
        isPublic: v.boolean(),
        description: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, { orgId, ...fields }) => {
        const { user } = await requireOrgAccess(ctx, orgId);
        const now = Date.now();
        return ctx.db.insert("trip", {
            orgId,
            ...fields,
            createdBy: user._id,
            updatedAt: now,
        });
    },
});

export const get = query({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        const trip = await getTrip(ctx, tripId);
        if (trip.isPublic) return trip;
        await requireTripMember(ctx, tripId);
        return trip;
    },
});

export const listByOrg = query({
    args: { orgId: v.string() },
    handler: async (ctx, { orgId }) => {
        await requireOrgAccess(ctx, orgId);
        const trips = await ctx.db
            .query("trip")
            .withIndex("orgId", (q) => q.eq("orgId", orgId))
            .collect();

        return trips;
    },
});

export const listPublic = query({
    args: {
        cursor: v.optional(v.string()),
    },
    handler: async (ctx, { cursor }) =>
        ctx.db
            .query("trip")
            .withIndex("isPublic", (q) => q.eq("isPublic", true))
            .order("desc")
            .paginate({
                numItems: PAGINATION.MEMBERS_PAGE_SIZE,
                cursor: cursor ?? null,
            }),
});

export const update = mutation({
    args: {
        tripId: v.id("trip"),
        title: v.optional(v.string()),
        destination: v.optional(v.string()),
        description: v.optional(v.string()),
        coverImage: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        defaultCurrency: v.optional(v.string()),
        isPublic: v.optional(v.boolean()),
    },
    handler: async (ctx, { tripId, ...fields }) => {
        await requireTripAdmin(ctx, tripId);
        await ctx.db.patch(tripId, { ...fields, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        await requireTripAdmin(ctx, tripId);

        const relatedTables: { name: TableNames; index: string }[] = [
            { name: "message", index: "tripId_createdAt" },
            { name: "expense", index: "tripId" },
            { name: "expenseSplit", index: "tripId" },
            { name: "settlement", index: "tripId" },
            { name: "joinRequest", index: "tripId" },
        ];

        for (const table of relatedTables) {
            const docs = await ctx.db
                .query(table.name)
                .withIndex(table.index as any, (q) =>
                    q.eq("tripId", tripId as any)
                )
                .collect();

            await Promise.all(docs.map((doc) => ctx.db.delete(doc._id)));
        }

        await ctx.db.delete(tripId);
    },
});
