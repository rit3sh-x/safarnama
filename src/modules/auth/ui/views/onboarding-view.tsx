import { useState, useCallback } from "react";
import { View, Pressable } from "react-native";
import { router } from "expo-router";

import { useAnimation } from "../components/animation";
import { useOnboarding } from "../../hooks/use-onboarding";
import { ONBOARDING_SCREENS } from "../../constants";
import { TextSlide } from "../components/text-slide";
import { ProgressDots } from "../components/progress-dots";

export default function OnboardingView() {
    const [index, setIndex] = useState(0);
    const { completeOnboarding } = useOnboarding();
    const { Animation, invokeTrigger } = useAnimation();

    const screen = ONBOARDING_SCREENS[index];
    const isLast = index === ONBOARDING_SCREENS.length - 1;

    const handleNext = useCallback(async () => {
        invokeTrigger();

        if (isLast) {
            await completeOnboarding();
            router.replace("/sign-up/create-account");
            return;
        }

        setIndex((prev) => prev + 1);
    }, [isLast, invokeTrigger, completeOnboarding]);

    return (
        <Pressable onPress={handleNext} className="flex-1 bg-[#C8A532]">
            <View className="absolute inset-0 z-0 h-full w-full pointer-events-none">
                {Animation}
            </View>

            <View className="absolute bottom-0 left-0 right-0 px-7 pb-14 gap-8 z-10">
                <TextSlide screen={screen} index={index} />

                <View className="flex-row items-center justify-center">
                    <ProgressDots
                        total={ONBOARDING_SCREENS.length}
                        current={index}
                        accentColor={screen.headlineColor}
                        defaultColor={screen.subtextColor}
                    />
                </View>
            </View>
        </Pressable>
    );
}
