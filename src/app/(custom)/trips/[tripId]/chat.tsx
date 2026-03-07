import { View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft, Users, MoreVertical } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TripChatView } from "@/modules/trips/ui/views/trip-chat-view";
// import { useTrip } from "@/modules/trips/hooks";
import type { TripId } from "@/modules/trips/types";

export default function ChatPage() {
    // const { tripId } = useLocalSearchParams<{ tripId: string }>();
    // const { trip, isLoading } = useTrip(tripId as TripId);
    // const router = useRouter();
    // const { top } = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-background">
            {/* <View
                className="flex-row items-center px-2 pb-2 gap-2 border-b border-border"
                style={{ paddingTop: top }}
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Icon as={ArrowLeft} className="size-6 text-foreground" />
                </TouchableOpacity>

                <View className="flex-1 gap-0">
                    <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                        {trip?.title ?? "Loading..."}
                    </Text>
                    {trip?.destination ? (
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                            {trip.destination}
                        </Text>
                    ) : null}
                </View>

                <TouchableOpacity
                    activeOpacity={0.7}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Icon as={Users} className="size-5 text-foreground" />
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Icon as={MoreVertical} className="size-5 text-foreground" />
                </TouchableOpacity>
            </View>

            {tripId ? (
                <TripChatView tripId={tripId as TripId} />
            ) : null} */}
        </View>
    );
}
