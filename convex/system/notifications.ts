import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { pushNotifications } from "../lib/notifications";

export const sendPushNotificationToOne = internalMutation({
    args: {
        to: v.id("user"),
        title: v.string(),
        body: v.optional(v.string()),
    },
    handler: async (ctx, { title, to, body }) => {
        await pushNotifications.sendPushNotification(ctx, {
            userId: to,
            notification: {
                title,
                body,
            },
        });
    },
});

export const sendPushNotificationToMany = internalMutation({
    args: {
        notifications: v.array(
            v.object({
                userId: v.id("user"),
                title: v.string(),
                body: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, { notifications }) => {
        await Promise.allSettled(
            notifications.map(({ userId, title, body }) =>
                pushNotifications.sendPushNotification(ctx, {
                    userId,
                    notification: { title, body },
                })
            )
        );
    },
});
