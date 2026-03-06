import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import type { ReactNode } from "react";
import { USER_ONBOARDING_KEY } from "../constants";

interface OnboardingContextValue {
    isOnboardingLoading: boolean;
    isFirstTime: boolean;
    completeOnboarding: () => Promise<void>;
    resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem(USER_ONBOARDING_KEY).then((val) => {
            setIsCompleted(val === "true");
            setIsLoading(false);
        });
    }, []);

    const completeOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(USER_ONBOARDING_KEY, "true");
        setIsCompleted(true);
    }, []);

    const resetOnboarding = useCallback(async () => {
        await AsyncStorage.setItem(USER_ONBOARDING_KEY, "false");
        setIsCompleted(false);
    }, []);

    return (
        <OnboardingContext.Provider
            value={{
                isOnboardingLoading: isLoading,
                isFirstTime: !isCompleted,
                completeOnboarding,
                resetOnboarding,
            }}
        >
            {children}
        </OnboardingContext.Provider>
    );
}

export const useOnboarding = () => {
    const ctx = useContext(OnboardingContext);
    if (!ctx)
        throw new Error("useOnboarding must be used within OnboardingProvider");
    return ctx;
};
