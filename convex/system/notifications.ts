import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { pushNotifications } from "../lib/notifications";

export const sendPushNotificationToOne = internalMutation({
    args: {
        to: v.id("user"),
        title: v.string(),
        body: v.optional(v.string()),
        data: v.any(),
    },
    handler: async (ctx, { title, to, body, data }) => {
        await pushNotifications.sendPushNotification(ctx, {
            userId: to,
            notification: {
                title,
                body,
                data,
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
                data: v.any(),
            })
        ),
    },
    handler: async (ctx, { notifications }) => {
        await Promise.allSettled(
            notifications.map(({ userId, title, body, data }) =>
                pushNotifications.sendPushNotification(ctx, {
                    userId,
                    notification: { title, body, data },
                })
            )
        );
    },
});
