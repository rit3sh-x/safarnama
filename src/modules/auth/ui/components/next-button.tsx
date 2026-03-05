import React, { useEffect } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface NextButtonProps {
    onPress: () => void;
    isLast: boolean;
    accentColor: string;
}

export const NextButton: React.FC<NextButtonProps> = ({ onPress, isLast, accentColor }) => {
    const scale = useSharedValue(1);
    const bgOpacity = useSharedValue(0);

    useEffect(() => {
        bgOpacity.value = withTiming(1, { duration: 400 });
    }, [bgOpacity]);

    const animStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        backgroundColor: accentColor,
        opacity: bgOpacity.value,
    }));

    const onPressIn = () => { scale.value = withSpring(0.94, { damping: 15 }); };
    const onPressOut = () => { scale.value = withSpring(1, { damping: 15 }); };

    return (
        <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
            <Animated.View
                style={animStyle}
                className="px-8 py-4 rounded-2xl items-center justify-center"
            >
                <Text className="text-black font-bold text-base tracking-wide">
                    {isLast ? "Get Started" : "Continue"}
                </Text>
            </Animated.View>
        </Pressable>
    );
};