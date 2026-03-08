import { useColorScheme, View } from "react-native";
import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { PortalHost } from "@rn-primitives/portal";
import { ConvexReactClient } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import type { AuthClient } from "@convex-dev/better-auth/react";
import { SystemBars } from "react-native-edge-to-edge";
import { Provider } from "jotai";
import "react-native-reanimated";

import { authClient } from "@/lib/auth-client";
import { NetworkModal } from "@/components/network-modal";
import {
    useAuthentication,
    AuthenticationProvider,
} from "@/modules/auth/context/auth-context";
import { OnboardingProvider } from "@/modules/onboarding/context/onboarding-context";
import { usePushNotifications } from "@/hooks/use-notifications";
import "./globals.css";
import { useEffect, useRef } from "react";

type AuthState = "onboarding" | "auth" | "username" | "home" | "unknown";
type RouteGroup = "(auth)" | "(home)" | "(custom)" | "onboarding";

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

    usePushNotifications(showHome);

    const router = useRouter();
    const segments = useSegments();

    const prevAuthStateRef = useRef<AuthState | null>(null);

    useEffect(() => {
        if (isLoading) return;

        const authState: AuthState = showOnboarding
            ? "onboarding"
            : showAuth
              ? "auth"
              : showUsername
                ? "username"
                : showHome
                  ? "home"
                  : "unknown";

        const currentGroup = segments[0] as RouteGroup | undefined;
        const inAuthGroup = currentGroup === "(auth)";
        const inHomeGroup = currentGroup === "(home)";
        const inCustomGroup = currentGroup === "(custom)";
        const inOnboarding = currentGroup === "onboarding";

        const isInCorrectGroup =
            (authState === "onboarding" && inOnboarding) ||
            (authState === "auth" && inAuthGroup) ||
            (authState === "username" &&
                inAuthGroup &&
                segments.join("/").includes("create-username")) ||
            (authState === "home" && (inHomeGroup || inCustomGroup));

        if (isInCorrectGroup && prevAuthStateRef.current === authState) {
            return;
        }

        prevAuthStateRef.current = authState;

        if (showOnboarding && !inOnboarding) {
            router.replace("/onboarding");
        } else if (showAuth && !inAuthGroup) {
            router.replace("/(auth)/signin");
        } else if (showUsername) {
            const onUsernameScreen =
                inAuthGroup && segments.join("/").includes("create-username");
            if (!onUsernameScreen) {
                router.replace("/(auth)/sign-up/create-username");
            }
        } else if (showHome && !inHomeGroup && !inCustomGroup) {
            router.replace("/(home)/dashboard");
        }
    }, [
        isLoading,
        showOnboarding,
        showAuth,
        showUsername,
        showHome,
        segments,
        router,
    ]);

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
                    <Stack.Screen name="(custom)" />
                </Stack>
                <NetworkModal />
                <SystemBars hidden style="auto" />
                <PortalHost />
            </View>
        </ThemeProvider>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView className="flex-1">
            <KeyboardProvider>
                <Provider>
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
                </Provider>
            </KeyboardProvider>
        </GestureHandlerRootView>
    );
}
