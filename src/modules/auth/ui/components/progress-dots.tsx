import React from "react";
import { View } from "react-native";
import Animated, {
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";

interface ProgressDotsProps {
    total: number;
    current: number;
    accentColor: string;
    defaultColor: string;
}

interface DotProps {
    index: number;
    current: number;
    accentColor: string;
    defaultColor: string;
}

export const ProgressDots: React.FC<ProgressDotsProps> = ({
    total,
    current,
    accentColor,
    defaultColor,
}) => (
    <View className="flex-row items-center gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
            <Dot
                key={i}
                index={i}
                current={current}
                accentColor={accentColor}
                defaultColor={defaultColor}
            />
        ))}
    </View>
);

const Dot: React.FC<DotProps> = ({
    index,
    current,
    accentColor,
    defaultColor,
}) => {
    const isActive = index === current;

    const style = useAnimatedStyle(() => ({
        width: withTiming(isActive ? 24 : 7, { duration: 180 }),
        backgroundColor: isActive ? accentColor : defaultColor,
    }));

    return <Animated.View style={[style, { height: 7, borderRadius: 4 }]} />;
};
