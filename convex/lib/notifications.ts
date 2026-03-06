import { PushNotifications } from "@convex-dev/expo-push-notifications";
import { components } from "../_generated/api";
import { Id } from "../betterAuth/_generated/dataModel";

export const pushNotifications = new PushNotifications<Id<"user">>(
    components.pushNotifications
);
