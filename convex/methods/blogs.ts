import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import {
    requireTripAdmin,
    requireTripMember,
    getTripFromTripId,
} from "../lib/utils";
import { paginationOptsValidator } from "convex/server";

export const browse = query({
    args: {
        search: v.optional(v.string()),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { search, paginationOpts }) => {
        const searchTerm = search?.trim().toLowerCase();
        const pageSize = paginationOpts.numItems;

        const baseQuery = () =>
            ctx.db
                .query("blog")
                .filter((q) => q.eq(q.field("published"), true))
                .order("desc");

        if (!searchTerm) {
            const results = await baseQuery().paginate(paginationOpts);
            const enriched = await Promise.all(
                results.page.map(async (blog) => {
                    const trip = await ctx.db.get(blog.tripId);
                    return { ...blog, trip };
                })
            );
            const publicOnly = enriched.filter((b) => b.trip?.isPublic);
            return { ...results, page: publicOnly };
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
                batch.page.map(async (blog) => {
                    const trip = await ctx.db.get(blog.tripId);
                    return { ...blog, trip };
                })
            );

            for (const b of enriched) {
                if (collected.length >= pageSize) break;
                if (!b.trip?.isPublic) continue;
                const title = b.title.toLowerCase();
                const tripTitle = b.trip?.title?.toLowerCase() ?? "";
                const dest = b.trip?.destination?.toLowerCase() ?? "";
                if (
                    title.includes(searchTerm) ||
                    tripTitle.includes(searchTerm) ||
                    dest.includes(searchTerm)
                ) {
                    collected.push(b);
                }
            }

            cursor = batch.continueCursor;
            isDone = batch.isDone;
        }

        return { page: collected, isDone, continueCursor: cursor };
    },
});

export const get = query({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        const trip = await getTripFromTripId(ctx, tripId);
        const blog = await ctx.db
            .query("blog")
            .withIndex("tripId", (q) => q.eq("tripId", tripId))
            .unique();

        if (trip.isPublic && blog?.published) return blog;

        await requireTripMember(ctx, tripId);
        return blog ?? null;
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
        const now = Date.now();

        const existing = await ctx.db
            .query("blog")
            .withIndex("tripId", (q) => q.eq("tripId", tripId))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...fields,
                publishedAt:
                    fields.published && !existing.published
                        ? now
                        : existing.publishedAt,
                updatedAt: now,
            });
        } else {
            await ctx.db.insert("blog", {
                tripId,
                ...fields,
                publishedAt: fields.published ? now : undefined,
                updatedAt: now,
            });
        }

        await ctx.db.patch(tripId, { updatedAt: now });
    },
});

export const remove = mutation({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        await requireTripAdmin(ctx, tripId);

        const blog = await ctx.db
            .query("blog")
            .withIndex("tripId", (q) => q.eq("tripId", tripId))
            .unique();

        if (blog) {
            const comments = await ctx.db
                .query("blogComment")
                .withIndex("tripId", (q) => q.eq("tripId", tripId))
                .collect();
            await Promise.all(comments.map((c) => ctx.db.delete(c._id)));

            await ctx.db.delete(blog._id);
        }

        await ctx.db.patch(tripId, { updatedAt: Date.now() });
    },
});
