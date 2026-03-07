import { View, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useTrip } from "@/modules/trips/hooks/use-trips";
import type { TripId } from "@/modules/trips/types";

export default function ExpensesPage() {
    // const { tripId } = useLocalSearchParams<{ tripId: string }>();
    // const { trip } = useTrip(tripId as TripId);
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

                <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                    {trip?.title ?? "Expenses"}
                </Text>
            </View> */}

            <View className="flex-1 items-center justify-center">
                <Text className="text-muted-foreground">
                    Trip expenses coming soon
                </Text>
            </View>
        </View>
    );
}
