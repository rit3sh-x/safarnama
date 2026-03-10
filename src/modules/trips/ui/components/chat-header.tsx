import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { getInitials, stringToHex } from "@/lib/utils";
import { ArrowLeft, MoreVertical } from "lucide-react-native";
import { Image } from "expo-image";
import { Pressable, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Id } from "@backend/dataModel";

interface ChatHeaderProps {
    name: string;
    tripId: Id<"trip">;
    logo?: string;
    onBack: () => void;
    onGroupPress: () => void;
    onMenuPress?: () => void;
}

export function ChatHeader({
    onBack,
    onGroupPress,
    onMenuPress,
    name,
    tripId,
    logo,
}: ChatHeaderProps) {
    const { top } = useSafeAreaInsets();

    const initials = getInitials(name);
    const bgColor = stringToHex(tripId);

    return (
        <View
            className="bg-card border-b border-border"
            style={{ paddingTop: top }}
        >
            <View className="flex-row items-center h-14 px-1">
                <TouchableOpacity
                    onPress={onBack}
                    activeOpacity={0.7}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Icon as={ArrowLeft} className="size-6 text-foreground" />
                </TouchableOpacity>

                <Pressable
                    onPress={onGroupPress}
                    className="flex-1 flex-row items-center gap-3 pr-2"
                >
                    <View className="w-10 h-10 rounded-full overflow-hidden">
                        {logo ? (
                            <Image
                                source={{ uri: logo }}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                }}
                                contentFit="cover"
                            />
                        ) : (
                            <View
                                className="w-full h-full items-center justify-center"
                                style={{ backgroundColor: bgColor }}
                            >
                                <Text className="text-sm font-bold text-white">
                                    {initials}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-1">
                        <Text
                            className="text-base font-semibold text-foreground"
                            numberOfLines={1}
                        >
                            {name}
                        </Text>
                    </View>
                </Pressable>

                {onMenuPress ? (
                    <TouchableOpacity
                        onPress={onMenuPress}
                        activeOpacity={0.7}
                        className="w-10 h-10 items-center justify-center"
                    >
                        <Icon
                            as={MoreVertical}
                            className="size-5 text-foreground"
                        />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}
