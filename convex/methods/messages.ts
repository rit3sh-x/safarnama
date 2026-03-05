import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { PAGINATION } from "../lib/constants";
import { requireTripMember } from "../lib/utils";

export const list = query({
    args: {
        tripId: v.id("trip"),
        cursor: v.optional(v.string()),
    },
    handler: async (ctx, { tripId, cursor }) => {
        await requireTripMember(ctx, tripId);
        return ctx.db
            .query("message")
            .withIndex("tripId_createdAt", (q) => q.eq("tripId", tripId))
            .order("desc")
            .paginate({
                numItems: PAGINATION.MESSAGES_PAGE_SIZE,
                cursor: cursor ?? null,
            });
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
            createdAt: Date.now(),
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
            throw new Error("Message not found");
        if (msg.deletedAt) throw new Error("Message deleted");

        const { user } = await requireTripMember(ctx, msg.tripId);
        if (msg.senderId !== user._id) throw new Error("Not your message");

        await ctx.db.patch(messageId, { content, editedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { messageId: v.id("message") },
    handler: async (ctx, { messageId }) => {
        const msg = await ctx.db.get(messageId);
        if (!msg) throw new Error("Message not found");

        const { user, member } = await requireTripMember(ctx, msg.tripId);
        if (msg.senderId !== user._id && member.role !== "owner")
            throw new Error("Unauthorized");

        await ctx.db.patch(messageId, {
            deletedAt: Date.now(),
            content: "[deleted]",
        });
    },
});
