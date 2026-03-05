import React, { useEffect, useRef } from "react";
import { Text } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    Easing,
} from "react-native-reanimated";
import type { OnboardingScreen } from "../../types";

interface TextSlideProps {
    screen: OnboardingScreen;
    index: number;
}

export const TextSlide: React.FC<TextSlideProps> = ({ screen, index }) => {
    const translateY = useSharedValue(40);
    const opacity = useSharedValue(0);
    const prevIndex = useRef(index);

    useEffect(() => {
        if (prevIndex.current !== index) {
            translateY.value = withSequence(
                withTiming(-30, {
                    duration: 200,
                    easing: Easing.in(Easing.cubic),
                }),
                withTiming(40, { duration: 0 }),
                withTiming(0, {
                    duration: 350,
                    easing: Easing.out(Easing.cubic),
                })
            );
            opacity.value = withSequence(
                withTiming(0, { duration: 200 }),
                withTiming(0, { duration: 0 }),
                withTiming(1, { duration: 350 })
            );
            prevIndex.current = index;
        } else {
            translateY.value = withTiming(0, {
                duration: 500,
                easing: Easing.out(Easing.cubic),
            });
            opacity.value = withTiming(1, { duration: 500 });
        }
    }, [index, opacity, translateY]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View style={animStyle} className="gap-3">
            <Text
                className="text-4xl font-extrabold leading-tight tracking-tight"
                style={{ color: screen.accentColor }}
            >
                {screen.headline}
            </Text>
            <Text className="text-base text-white/70 leading-relaxed max-w-xs font-normal">
                {screen.subtext}
            </Text>
        </Animated.View>
    );
};
