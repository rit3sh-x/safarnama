import { Badge } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { Pressable, View } from "react-native";
import { useNavigationOptions } from "../../hooks/use-navigation-options";
import type { NavOption } from "../../types";

const OPTIONS: { value: NavOption; label: string }[] = [
    { value: "trips", label: "My Trips" },
    { value: "invites", label: "Invites" },
    { value: "public_trips", label: "Public Trips" },
];

export const NavOptions = () => {
    const { tab, setTab } = useNavigationOptions();

    return (
        <View className="flex flex-row items-center gap-2">
            {OPTIONS.map(({ value, label }) => {
                const isActive = tab === value;
                return (
                    <Pressable key={value} onPress={() => setTab(value)}>
                        <Badge
                            variant={isActive ? "default" : "outline"}
                            className="px-4 py-2"
                        >
                            <Text>{label}</Text>
                        </Badge>
                    </Pressable>
                );
            })}
        </View>
    );
};
