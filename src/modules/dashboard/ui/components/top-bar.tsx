import { Text } from "@/components/ui/text";
import { useRouter } from "expo-router";
import { TouchableOpacity, View } from "react-native";
import { useAuthentication } from "@/modules/auth/context/auth-context";
import { Image } from "expo-image";
import { UserCircle2 } from "lucide-react-native";
import { Icon } from "@/components/ui/icon";
import { stringToHex } from "@/lib/utils";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TopBarProps {
    title: string;
}

export function TopBar({ title }: TopBarProps) {
    const router = useRouter();
    const { user } = useAuthentication();
    const avatarBgColor = stringToHex(user?.username ?? "system");
    const { top } = useSafeAreaInsets();

    return (
        <View
            className="flex-row items-center justify-between px-4 pb-3"
            style={{ paddingTop: top }}
        >
            <Text className="text-xl font-semibold text-foreground">
                {title}
            </Text>

            <TouchableOpacity
                onPress={() => router.push("/(home)/settings")}
                activeOpacity={0.7}
                style={{
                    backgroundColor: avatarBgColor,
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                }}
            >
                {user?.image ? (
                    <Image
                        source={{ uri: user.image }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="cover"
                    />
                ) : (
                    <Icon as={UserCircle2} className="text-white/90 size-7" />
                )}
            </TouchableOpacity>
        </View>
    );
}
