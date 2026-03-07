import { useNavigationOptions } from "@/modules/trips/hooks/use-navigation-options";

export const Navigations = () => {
    const { tab } = useNavigationOptions();

    switch (tab) {
        case "trips":
            return null;
        case "invites":
            return null;
        case "public_trips":
            return null;
    }
};
