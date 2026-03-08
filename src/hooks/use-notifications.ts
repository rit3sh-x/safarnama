import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useMutation } from "convex/react";
import { api } from "@backend/api";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

async function registerForPushNotifications() {
    if (!Device.isDevice) return null;

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
        });
    }

    const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    });
    return token.data;
}

export function usePushNotifications(enabled: boolean) {
    const recordToken = useMutation(api.methods.notifications.recordToken);

    useEffect(() => {
        if (!enabled) return;

        registerForPushNotifications()
            .then((token) => {
                if (token) recordToken({ token });
            })
            .catch((error) => {
                console.warn("Push notification registration failed:", error);
            });

        const sub = Notifications.addNotificationResponseReceivedListener(
            (response) => {
                // TODO: Handle later
                const data = response.notification.request.content.data;
            }
        );

        return () => sub.remove();
    }, [enabled, recordToken]);
}
