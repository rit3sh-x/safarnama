import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireTripMember } from "../lib/utils";
import { paginationOptsValidator } from "convex/server";

export const list = query({
    args: {
        tripId: v.id("trip"),
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { tripId, paginationOpts }) => {
        await requireTripMember(ctx, tripId);
        const result = await ctx.db
            .query("message")
            .withIndex("tripId", (q) => q.eq("tripId", tripId))
            .order("desc")
            .paginate(paginationOpts);

        const page = await Promise.all(
            result.page.map(async (msg) => {
                const reactions = await ctx.db
                    .query("reaction")
                    .withIndex("messageId", (q) => q.eq("messageId", msg._id))
                    .collect();

                const grouped: Record<
                    string,
                    { emoji: string; userIds: string[]; count: number }
                > = {};
                for (const r of reactions) {
                    if (!grouped[r.emoji]) {
                        grouped[r.emoji] = {
                            emoji: r.emoji,
                            userIds: [],
                            count: 0,
                        };
                    }
                    grouped[r.emoji].userIds.push(r.userId);
                    grouped[r.emoji].count++;
                }

                return {
                    ...msg,
                    reactions: Object.values(grouped),
                };
            })
        );

        return { ...result, page };
    },
});

export const send = mutation({
    args: {
        tripId: v.id("trip"),
        content: v.string(),
        replyToId: v.optional(v.id("message")),
        attachmentUrl: v.optional(v.string()),
        attachmentType: v.optional(
            v.union(v.literal("image"), v.literal("file"))
        ),
    },
    handler: async (ctx, { tripId, ...rest }) => {
        const { user } = await requireTripMember(ctx, tripId);
        return ctx.db.insert("message", {
            tripId,
            senderId: user._id,
            type: "message",
            ...rest,
        });
    },
});

export const edit = mutation({
    args: {
        messageId: v.id("message"),
        content: v.string(),
    },
    handler: async (ctx, { messageId, content }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg || msg.type !== "message")
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Message not found",
            });
        if (msg.deletedAt)
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Message deleted",
            });

        const { user } = await requireTripMember(ctx, msg.tripId);
        if (msg.senderId !== user._id)
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Not your message",
            });

        await ctx.db.patch(messageId, { content, editedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { messageId: v.id("message") },
    handler: async (ctx, { messageId }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Message not found",
            });

        const { user, member } = await requireTripMember(ctx, msg.tripId);
        if (msg.senderId !== user._id && member.role !== "owner")
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Unauthorized",
            });

        await ctx.db.patch(messageId, {
            deletedAt: Date.now(),
            content: "[deleted]",
        });
    },
});

export const addReaction = mutation({
    args: {
        messageId: v.id("message"),
        emoji: v.string(),
    },
    handler: async (ctx, { messageId, emoji }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Message not found",
            });
        if (msg.deletedAt)
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Message deleted",
            });

        const { user } = await requireTripMember(ctx, msg.tripId);

        const existing = await ctx.db
            .query("reaction")
            .withIndex("messageId_userId_emoji", (q) =>
                q
                    .eq("messageId", messageId)
                    .eq("userId", user._id)
                    .eq("emoji", emoji)
            )
            .unique();

        if (existing) return existing._id;

        return ctx.db.insert("reaction", {
            messageId,
            tripId: msg.tripId,
            userId: user._id,
            emoji,
        });
    },
});

export const removeReaction = mutation({
    args: {
        messageId: v.id("message"),
        emoji: v.string(),
    },
    handler: async (ctx, { messageId, emoji }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Message not found",
            });

        const { user } = await requireTripMember(ctx, msg.tripId);

        const existing = await ctx.db
            .query("reaction")
            .withIndex("messageId_userId_emoji", (q) =>
                q
                    .eq("messageId", messageId)
                    .eq("userId", user._id)
                    .eq("emoji", emoji)
            )
            .unique();

        if (!existing)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Reaction not found",
            });
        await ctx.db.delete(existing._id);
    },
});

export const getReactions = query({
    args: { messageId: v.id("message") },
    handler: async (ctx, { messageId }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Message not found",
            });
        await requireTripMember(ctx, msg.tripId);

        const reactions = await ctx.db
            .query("reaction")
            .withIndex("messageId", (q) => q.eq("messageId", messageId))
            .collect();

        const grouped: Record<
            string,
            { emoji: string; userIds: string[]; count: number }
        > = {};
        for (const r of reactions) {
            if (!grouped[r.emoji]) {
                grouped[r.emoji] = { emoji: r.emoji, userIds: [], count: 0 };
            }
            grouped[r.emoji].userIds.push(r.userId);
            grouped[r.emoji].count++;
        }

        return Object.values(grouped);
    },
});

export const pin = mutation({
    args: { messageId: v.id("message") },
    handler: async (ctx, { messageId }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Message not found",
            });
        if (msg.deletedAt)
            throw new ConvexError({
                code: "BAD_REQUEST",
                message: "Message deleted",
            });

        const { user, member } = await requireTripMember(ctx, msg.tripId);
        if (member.role !== "owner")
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Only admins can pin messages",
            });

        await ctx.db.patch(messageId, {
            pinnedAt: Date.now(),
            pinnedBy: user._id,
        });
    },
});

export const unpin = mutation({
    args: { messageId: v.id("message") },
    handler: async (ctx, { messageId }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg)
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Message not found",
            });

        const { member } = await requireTripMember(ctx, msg.tripId);
        if (member.role !== "owner")
            throw new ConvexError({
                code: "FORBIDDEN",
                message: "Only admins can unpin messages",
            });

        await ctx.db.patch(messageId, {
            pinnedAt: undefined,
            pinnedBy: undefined,
        });
    },
});

export const listPinned = query({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        await requireTripMember(ctx, tripId);

        const messages = await ctx.db
            .query("message")
            .withIndex("tripId", (q) => q.eq("tripId", tripId))
            .collect();

        return messages.filter((m) => m.pinnedAt && !m.deletedAt);
    },
});
