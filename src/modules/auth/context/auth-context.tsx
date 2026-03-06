import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { useOnboarding } from "@/modules/onboarding/context/onboarding-context";
import type { Session } from "@backend/types";

interface AuthenticationContextValue {
    isLoading: boolean;
    isAuthenticated: boolean;
    session: Session | null;
    hasSession: boolean;
    hasUsername: boolean;
    showOnboarding: boolean;
    showAuth: boolean;
    showUsername: boolean;
    showHome: boolean;
}

const AuthenticationContext = createContext<AuthenticationContextValue | null>(null);

export function AuthenticationProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: isConvexLoading } = useConvexAuth();
    const { isFirstTime, isOnboardingLoading } = useOnboarding();
    const { data: session, isPending: isSessionLoading } = authClient.useSession();

    const isLoading = isOnboardingLoading || isConvexLoading || isSessionLoading;

    const hasSession = !isLoading && !!session?.user;
    const hasUsername = hasSession && !!session?.user?.username;

    const showOnboarding = !isLoading && isFirstTime;
    const showAuth = !isLoading && !isFirstTime && !isAuthenticated;
    const showUsername = !isLoading && !isFirstTime && isAuthenticated && hasSession && !hasUsername;
    const showHome = !isLoading && !isFirstTime && isAuthenticated && hasUsername;

    return (
        <AuthenticationContext.Provider
            value={{
                isLoading,
                isAuthenticated,
                session,
                hasSession,
                hasUsername,
                showOnboarding,
                showAuth,
                showUsername,
                showHome,
            }}
        >
            {children}
        </AuthenticationContext.Provider>
    );
}

export const useAuthentication = () => {
    const ctx = useContext(AuthenticationContext);
    if (!ctx) throw new Error("useAuthentication must be used within AuthenticationProvider");
    return ctx;
};
