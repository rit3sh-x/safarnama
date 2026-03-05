import { Redirect } from "expo-router";
import { useConvexAuth } from "convex/react";

import { useOnboarding } from "@/modules/auth/hooks/use-onboarding";

const Page = () => {
    const { isAuthenticated } = useConvexAuth();
    const { isFirstTime } = useOnboarding();

    if (isFirstTime) {
        return <Redirect href="/onboarding" />;
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/signin" />;
    }

    return <Redirect href="/(home)/dashboard" />;
};

export default Page;
