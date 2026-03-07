import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
    MapIcon,
    MessageCircleIcon,
    type LucideIcon,
} from "lucide-react-native";
import { useNavigationOptions } from "../../hooks/use-navigation-options";
import { NavOption } from "../../types";

export function EmptyData() {
    const { tab } = useNavigationOptions();

    let title = "";
    let description = "";
    let icon: LucideIcon;

    switch (tab as NavOption) {
        case "invites":
            title = "No invites yet";
            description =
                "When someone invites you to a trip, it will appear here";
            icon = MessageCircleIcon;
            break;
        case "public_trips":
            title = "No public trips";
            description =
                "Check back later to discover community-shared adventures";
            icon = MapIcon;
            break;
        case "trips":
        default:
            title = "No trips yet";
            description = "Create a new trip to start planning with your group";
            icon = MapIcon;
            break;
    }

    return (
        <View className="flex-1 items-center justify-center px-8 gap-2">
            <Icon as={icon} className="size-10 text-muted-foreground mb-4" />
            <Text className="text-lg font-semibold text-foreground text-center">
                {title}
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
                {description}
            </Text>
        </View>
    );
}
