import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view";
import { useEffect } from "react";
import { View } from "react-native";
import {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing,
} from "react-native-reanimated";
import { UsernameForm } from "../components/username-form";
import TravellerSvg from "@/assets/auth/traveller.svg";

export function UsernameView() {
    const translateY = useSharedValue(1000);

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
                <TravellerSvg width="100%" height="100%" />
            </View>

            <NativeOnlyAnimatedView
                className="absolute bottom-0 left-0 right-0 bg-background rounded-t-4xl overflow-hidden shadow-lg shadow-black/10"
                style={animatedStyle}
            >
                <UsernameForm />
            </NativeOnlyAnimatedView>
        </View>
    );
}
