import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { useEffect, useCallback } from "react";
import { View } from "react-native";
import {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { SignUpScreen } from "../components/signup-form";
import { useRouter } from "expo-router";
import { scheduleOnRN } from 'react-native-worklets';
import BookingSvg from "@/assets/auth/booking.svg";

export function SignUpView() {
    const translateY = useSharedValue(1000);
    const router = useRouter();

    const navigateToLogin = useCallback(() => {
        router.push("/(auth)/signin");
    }, [router]);

    const onNavigateLogin = useCallback(() => {
        translateY.value = withTiming(
            1000,
            {
                duration: 400,
                easing: Easing.in(Easing.exp),
            },
            (finished) => {
                if (finished) {
                    scheduleOnRN(navigateToLogin);
                }
            }
        );
    }, [translateY, navigateToLogin]);

    useEffect(() => {
        translateY.value = withTiming(0, {
            duration: 500,
            easing: Easing.out(Easing.exp),
        });
    }, [translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <View className="flex-1 bg-blue-600">
            <View className="absolute inset-0 z-0 h-1/2 w-full p-8 pointer-events-none">
                <BookingSvg width="100%" height="100%" />
            </View>

            <NativeOnlyAnimatedView
                className="absolute bottom-0 left-0 right-0 bg-background rounded-t-4xl overflow-hidden shadow-lg shadow-black/10"
                style={animatedStyle}
            >
                <SignUpScreen onNavigateLogin={onNavigateLogin} />
            </NativeOnlyAnimatedView>
        </View>
    );
}
