import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";
import pushNotifications from "@convex-dev/expo-push-notifications/convex.config";

const app: ReturnType<typeof defineApp> = defineApp();
app.use(betterAuth);
app.use(pushNotifications);

export default app;
