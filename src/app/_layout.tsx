import { useColorScheme, View } from "react-native";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PortalHost } from "@rn-primitives/portal";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import type { AuthClient } from "@convex-dev/better-auth/react";
import "react-native-reanimated";

import { authClient } from "@/lib/auth-client";
import { NetworkModal } from "@/components/network-modal";
import {
    useAuthentication,
    AuthenticationProvider,
} from "@/modules/auth/context/auth-context";
import { OnboardingProvider } from "@/modules/onboarding/context/onboarding-context";
import "./globals.css";
import { useEffect } from "react";

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
    const { isLoading, showOnboarding, showAuth, showUsername, showHome } =
        useAuthentication();

    const router = useRouter();
    const segments = useSegments();
    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === "(auth)";
        const inHomeGroup = segments[0] === "(home)";
        const inOnboarding = segments[0] === "onboarding";

        if (showOnboarding && !inOnboarding) {
            router.replace("/onboarding");
        } else if (showAuth && !inAuthGroup) {
            router.replace("/(auth)/signin");
        } else if (showUsername) {
            const onUsernameScreen = inAuthGroup && segments.join("/").includes("create-username");
            if (!onUsernameScreen) {
                router.replace("/(auth)/sign-up/create-username");
            }
        } else if (showHome && !inHomeGroup) {
            router.replace("/(home)/dashboard");
        }
    }, [isLoading, showOnboarding, showAuth, showUsername, showHome, segments, router]);

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
                    <Stack.Screen name="index" />
                    <Stack.Screen name="onboarding" />
                    <Stack.Screen name="(auth)" />
                    <Stack.Screen name="(home)" />
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
        <GestureHandlerRootView className="flex-1">
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
        </GestureHandlerRootView>
    );
}
