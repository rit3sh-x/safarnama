import { useMMKVBoolean } from "react-native-mmkv";
import { USER_ONBOARDING_KEY } from "../constants";

export const useOnboarding = () => {
    const [isCompleted, setIsCompleted] = useMMKVBoolean(USER_ONBOARDING_KEY);

    return {
        isFirstTime: !isCompleted,
        completeOnboarding: () => setIsCompleted(true),
        resetOnboarding: () => setIsCompleted(false),
    };
};