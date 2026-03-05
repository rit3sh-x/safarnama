import { useEffect } from "react";
import { useColorScheme, View } from "react-native";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
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

SplashScreen.preventAutoHideAsync();

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

    useEffect(() => {
        if (!isLoading) {
            SplashScreen.hideAsync();
        }
    }, [isLoading]);

    if (isLoading) {
        return null;
    }

    return (
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <View className={`flex-1 bg-background ${isDark ? "dark" : ""}`}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="onboarding" redirect={!isFirstTime} />
                    <Stack.Screen
                        name="(auth)"
                        redirect={isAuthenticated || isFirstTime}
                    />
                    <Stack.Screen name="(home)" redirect={!isAuthenticated} />
                </Stack>
                <StatusBar style={isDark ? "light" : "dark"} />
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
