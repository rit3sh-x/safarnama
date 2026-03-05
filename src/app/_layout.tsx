import { useColorScheme, View } from "react-native";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { AuthClient } from "@convex-dev/better-auth/react";
import "react-native-reanimated";

import { authClient } from "@/lib/auth-client";
import { useOnboarding } from "@/modules/auth/hooks/use-onboarding";
import "./globals.css";

const convex = new ConvexReactClient(
    process.env.EXPO_PUBLIC_CONVEX_URL as string,
    {
        expectAuth: true,
        unsavedChangesWarning: false,
    }
);

function AuthGate() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";
    const { isAuthenticated, isLoading } = useConvexAuth();
    const { isFirstTime } = useOnboarding();

    // TODO: Do later
    if (isLoading) {
        return (
            <View
                style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
            />
        );
    }

    const showOnboarding = isFirstTime;
    const showAuth = !isFirstTime && !isAuthenticated;
    const showHome = !isFirstTime && isAuthenticated;

    return (
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <View
                style={{ flex: 1, backgroundColor: isDark ? "#000" : "#fff" }}
            >
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                        name="index"
                        redirect={showOnboarding || showAuth || showHome}
                    />
                    <Stack.Screen
                        name="onboarding"
                        redirect={!showOnboarding}
                    />
                    <Stack.Screen name="(auth)" redirect={!showAuth} />
                    <Stack.Screen name="(home)" redirect={!showHome} />
                </Stack>
                <StatusBar
                    style={isDark ? "light" : "dark"}
                    hidden={true}
                    translucent
                    backgroundColor="transparent"
                />
                <PortalHost />
            </View>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <ConvexBetterAuthProvider
                client={convex}
                authClient={authClient as unknown as AuthClient}
            >
                <AuthGate />
            </ConvexBetterAuthProvider>
        </SafeAreaProvider>
    );
}
