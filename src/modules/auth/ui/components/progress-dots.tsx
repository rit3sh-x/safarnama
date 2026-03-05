import React from "react";
import { View } from "react-native";
import Animated, {
    useAnimatedStyle,
    withSpring,
} from "react-native-reanimated";

interface ProgressDotsProps {
    total: number;
    current: number;
    accentColor: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
    total,
    current,
    accentColor,
}) => (
    <View className="flex-row items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
            <Dot key={i} isActive={i === current} accentColor={accentColor} />
        ))}
    </View>
);

const Dot: React.FC<{ isActive: boolean; accentColor: string }> = ({
    isActive,
    accentColor,
}) => {
    const style = useAnimatedStyle(() => ({
        width: withSpring(isActive ? 24 : 7, { damping: 15 }),
        backgroundColor: withSpring(
            isActive ? accentColor : "rgba(255,255,255,0.3)",
            { damping: 15 }
        ) as any,
    }));

    return <Animated.View style={[style, { height: 7, borderRadius: 4 }]} />;
};
