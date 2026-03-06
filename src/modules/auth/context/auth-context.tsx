import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { useOnboarding } from "@/modules/onboarding/context/onboarding-context";
import { api } from "@backend/api";
import type { User } from "@backend/types";

interface AuthenticationContextValue {
    isLoading: boolean;
    isAuthenticated: boolean;
    hasUsername: boolean;
    showOnboarding: boolean;
    showAuth: boolean;
    showUsername: boolean;
    showHome: boolean;
    user: User | null;
}

const AuthenticationContext = createContext<AuthenticationContextValue | null>(
    null
);

export function AuthenticationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const { isFirstTime, isOnboardingLoading } = useOnboarding();

    const user = useQuery(
        api.methods.users.currentUser,
        isAuthenticated ? {} : "skip"
    );
    const isUserLoading = isAuthenticated && user === undefined;

    const isLoading = isOnboardingLoading || isConvexLoading || isUserLoading;

    const hasUsername = !!user?.username;

    const showOnboarding = !isLoading && isFirstTime;
    const showAuth = !isLoading && !isFirstTime && !isAuthenticated;
    const showUsername =
        !isLoading && !isFirstTime && isAuthenticated && !hasUsername;
    const showHome =
        !isLoading && !isFirstTime && isAuthenticated && hasUsername;

    return (
        <AuthenticationContext.Provider
            value={{
                isLoading,
                isAuthenticated,
                hasUsername,
                showOnboarding,
                showAuth,
                showUsername,
                showHome,
                user: user ?? null,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
}

export const useAuthentication = () => {
    const ctx = useContext(AuthenticationContext);
    if (!ctx)
        throw new Error(
            "useAuthentication must be used within AuthenticationProvider"
        );
    return ctx;
};
