import { useState, useCallback } from "react";
import { View, Pressable, Text, StatusBar } from "react-native";
import { router } from "expo-router";

import { useClumsyWalk } from "../components/clumsy-walk";
import { useOnboarding } from "../../hooks/use-onboarding";
import { ONBOARDING_SCREENS } from "../../constants";
import { TextSlide } from "../components/text-slide";
import { ProgressDots } from "../components/progress-dots";
import { NextButton } from "../components/next-button";

export default function OnboardingView() {
    const [index, setIndex] = useState(0);
    const { completeOnboarding } = useOnboarding();
    const { Animation, invokeTrigger } = useClumsyWalk();

    const screen = ONBOARDING_SCREENS[index];
    const isLast = index === ONBOARDING_SCREENS.length - 1;

    const handleNext = useCallback(() => {
        invokeTrigger();

        if (isLast) {
            await completeOnboarding();
            router.replace("/sign-up/create-account");
            return;
        }

        setIndex((prev) => prev + 1);
    }, [isLast, invokeTrigger, completeOnboarding]);

    const handleSkip = useCallback(() => {
        completeOnboarding();
        router.replace("/sign-up/create-account");
    }, [completeOnboarding]);

    return (
        <View className="flex-1">
            <StatusBar
                barStyle="light-content"
                translucent
                backgroundColor="transparent"
            />
            {!isLast && (
                <Pressable
                    onPress={handleSkip}
                    className="absolute top-14 right-6 z-10"
                    hitSlop={12}
                >
                    <Text className="text-white/50 text-sm font-medium tracking-wide">
                        Skip
                    </Text>
                </Pressable>
            )}

            <View className="absolute inset-0 z-0" pointerEvents="none">
                {Animation}
            </View>

            <View className="absolute bottom-0 left-0 right-0 px-7 pb-14 gap-8 z-10">
                <TextSlide screen={screen} index={index} />

                <View className="flex-row items-center justify-between">
                    <ProgressDots
                        total={ONBOARDING_SCREENS.length}
                        current={index}
                        accentColor={screen.accentColor}
                    />
                    <NextButton
                        onPress={handleNext}
                        isLast={isLast}
                        accentColor={screen.accentColor}
                    />
                </View>
            </View>
        </View>
    );
}
