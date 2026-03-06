import { Redirect } from "expo-router";
import { useAuthentication } from "@/modules/auth/context/auth-context";

const Page = () => {
    const { showOnboarding, showAuth, showUsername, showHome } = useAuthentication();

    if (showOnboarding) return <Redirect href="/onboarding" />;
    if (showAuth) return <Redirect href="/(auth)/signin" />;
    if (showUsername) return <Redirect href="/(auth)/sign-up/create-username" />;
    if (showHome) return <Redirect href="/(home)/dashboard" />;

    return null;
};

export default Page;