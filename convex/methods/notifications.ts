import { query, mutation } from "../_generated/server";
import { v } from "convex/values";
import { pushNotifications } from "../lib/notifications";
import { authComponent } from "convex/betterAuth/auth";

export const getNotificationsForUser = query({
    args: { userId: v.id("user") },
    handler: async (ctx, { userId }) => {
        return pushNotifications.getNotificationsForUser(ctx, {
            userId,
        });
    },
});

export const recordToken = mutation({
    args: { token: v.string() },
    handler: async (ctx, { token }) => {
        const { _id } = await authComponent.getAuthUser(ctx);
        await pushNotifications.recordToken(ctx, {
            userId: _id,
            pushToken: token,
        });
    },
});
