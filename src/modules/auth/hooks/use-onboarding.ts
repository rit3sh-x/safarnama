import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";
import { USER_ONBOARDING_KEY } from "../constants";

export const useOnboarding = () => {
    const [isCompleted, setIsCompleted] = useState<boolean>(false);

    useEffect(() => {
        AsyncStorage.getItem(USER_ONBOARDING_KEY).then(val => setIsCompleted(val === "true"));
    }, []);

    const set = async (val: boolean) => {
        await AsyncStorage.setItem(USER_ONBOARDING_KEY, String(val));
        setIsCompleted(val);
    };

    return {
        isFirstTime: !isCompleted,
        completeOnboarding: () => set(true),
        resetOnboarding: () => set(false),
    };
};