import { OnboardingView } from "@/modules/onboarding/ui/views/onboarding-view";
import { Unauthenticated } from "convex/react";

const Page = () => {
    return (
        <Unauthenticated>
            <OnboardingView />
        </Unauthenticated>
    );
};

export default Page;
