import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useCallback, useState } from "react";
import { View } from "react-native";
import { useTrips } from "../../hooks/use-trips";
import type { Trip } from "../../types";
import { CreateTripDialog } from "../components/create-trip-dialog";
import { NavOptions } from "../components/nav-options";
import { TripListItem } from "../components/navigations/trips-list";
import { SearchBar } from "../components/search-bar";

export function TripListView() {
    const { trips } = useTrips();
    const [showCreate, setShowCreate] = useState(false);
    const router = useRouter();

    const sortedTrips = [...trips].sort((a, b) => b.updatedAt - a.updatedAt);

    const handleTripPress = useCallback(
        (trip: Trip) => {
            router.push(`/(custom)/trips/${trip._id}/chat` as any);
        },
        [router]
    );

    const handleTripCreated = useCallback(
        (tripId: string) => {
            router.push(`/(custom)/trips/${tripId}/chat` as any);
        },
        [router]
    );

    const renderItem = useCallback(
        ({ item }: { item: Trip }) => (
            <TripListItem trip={item} onPress={() => handleTripPress(item)} />
        ),
        [handleTripPress]
    );

    return (
        <View className="flex-1 gap-4 bg-background px-4">
            <SearchBar />
            <NavOptions />

            {/* {sortedTrips.length === 0 ? (
                <EmptyTrips />
            ) : (
                <FlatList
                    data={sortedTrips}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    ItemSeparatorComponent={() => (
                        <View className="pl-20 pr-4">
                            <Separator />
                        </View>
                    )}
                    contentContainerStyle={{ flexGrow: 1 }}
                />
            )} */}

            <Button
                onPress={() => setShowCreate(true)}
                className="absolute bottom-4 right-4 w-14 h-14 rounded-full items-center justify-center shadow-lg bg-primary"
            >
                <Icon as={Plus} className="size-6 text-primary-foreground" />
            </Button>

            <CreateTripDialog
                open={showCreate}
                onOpenChange={setShowCreate}
                onCreated={handleTripCreated}
            />
        </View>
    );
}
