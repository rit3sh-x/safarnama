import { useColorScheme, View } from "react-native";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import type { AuthClient } from "@convex-dev/better-auth/react";
import "react-native-reanimated";

import { authClient } from "@/lib/auth-client";
import { NetworkModal } from "@/components/network-modal";
import { useAuthentication, AuthenticationProvider } from "@/modules/auth/context/auth-context";
import { OnboardingProvider } from "@/modules/onboarding/context/onboarding-context";
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
    const {
        isLoading,
        showOnboarding,
        showAuth,
        showUsername,
        showHome,
    } = useAuthentication();

    // TODO: Do later
    if (isLoading) {
        return (
            <View className="flex-1 bg-background">
                <NetworkModal />
            </View>
        );
    }

    return (
        <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
            <View className="flex-1 bg-background">
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen
                        name="index"
                        redirect
                    />
                    <Stack.Screen
                        name="onboarding"
                        redirect={!showOnboarding}
                    />
                    <Stack.Screen
                        name="(auth)"
                        redirect={!showAuth && !showUsername}
                    />
                    <Stack.Screen
                        name="(home)"
                        redirect={!showHome}
                    />
                </Stack>
                <NetworkModal />
                <StatusBar
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
            <OnboardingProvider>
                <ConvexBetterAuthProvider
                    client={convex}
                    authClient={authClient as unknown as AuthClient}
                >
                    <AuthenticationProvider>
                        <AuthGate />
                    </AuthenticationProvider>
                </ConvexBetterAuthProvider>
            </OnboardingProvider>
        </SafeAreaProvider>
    );
}
