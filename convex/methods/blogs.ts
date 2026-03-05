import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireTripAdmin, requireTripMember, getTrip } from "../lib/utils";
import { PAGINATION } from "../lib/constants";

export const browse = query({
    args: { cursor: v.optional(v.string()) },
    handler: async (ctx, { cursor }) =>
        ctx.db
            .query("trip")
            .withIndex("isPublic", (q) => q.eq("isPublic", true))
            .filter((q) =>
                q.and(
                    q.neq(q.field("blog"), undefined),
                    q.eq(q.field("blog.published"), true)
                )
            )
            .order("desc")
            .paginate({
                numItems: PAGINATION.TRIPS_PAGE_SIZE,
                cursor: cursor ?? null,
            }),
});

export const get = query({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        const trip = await getTrip(ctx, tripId);

        if (trip.isPublic && trip.blog?.published) return trip.blog;

        await requireTripMember(ctx, tripId);
        return trip.blog ?? null;
    },
});

export const upsert = mutation({
    args: {
        tripId: v.id("trip"),
        title: v.string(),
        content: v.string(),
        coverImage: v.optional(v.string()),
        published: v.boolean(),
    },
    handler: async (ctx, { tripId, ...fields }) => {
        await requireTripAdmin(ctx, tripId);
        const trip = await getTrip(ctx, tripId);
        const now = Date.now();
        await ctx.db.patch(tripId, {
            blog: {
                ...fields,
                publishedAt:
                    fields.published && !trip.blog?.published
                        ? now
                        : trip.blog?.publishedAt,
                updatedAt: now,
            },
            updatedAt: now,
        });
    },
});

export const remove = mutation({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        await requireTripAdmin(ctx, tripId);
        await ctx.db.patch(tripId, { blog: undefined, updatedAt: Date.now() });
    },
});
