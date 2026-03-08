import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { getInitials, stringToHex } from "@/lib/utils";
import { Image } from "expo-image";
import { useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";
import type { PublicTrip } from "../../../types";

function PublicTripItemSkeleton() {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3">
            <Skeleton className="w-14 h-14 rounded-full" />
            <View className="flex-1 gap-2">
                <View className="flex-row items-center justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-10 rounded-md" />
                </View>
                <Skeleton className="h-3 w-24 rounded-md" />
            </View>
        </View>
    );
}

function PublicTripSkeletons() {
    return (
        <>
            {Array.from({ length: 8 }).map((_, i) => (
                <PublicTripItemSkeleton key={i} />
            ))}
        </>
    );
}

interface PublicTripItemProps {
    trip: PublicTrip;
    onPress: (tripId: string) => void;
}

function PublicTripItem({ trip, onPress }: PublicTripItemProps) {
    const initials = getInitials(trip.name);
    const bgColor = stringToHex(trip.name);

    return (
        <Pressable
            onPress={() => onPress(trip.tripId)}
            className="flex-row items-center rounded-lg overflow-hidden px-4 py-3 gap-3 active:bg-muted/50"
        >
            <View className="w-14 h-14 rounded-full overflow-hidden">
                {trip.logo ? (
                    <Image
                        source={{ uri: trip.logo }}
                        style={{ width: 56, height: 56, borderRadius: 28 }}
                        contentFit="cover"
                    />
                ) : (
                    <View
                        className="w-full h-full items-center justify-center"
                        style={{ backgroundColor: bgColor }}
                    >
                        <Text className="text-lg font-bold text-white">
                            {initials}
                        </Text>
                    </View>
                )}
            </View>

            <View className="flex-1 gap-0.5">
                <Text
                    className="text-base font-semibold text-foreground"
                    numberOfLines={1}
                >
                    {trip.name}
                </Text>
                {trip.destination && (
                    <Text
                        className="text-sm text-muted-foreground"
                        numberOfLines={1}
                    >
                        {trip.destination}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

function Separator() {
    return <View className="h-px bg-border mx-4" />;
}

interface PublicTripsListProps {
    trips: PublicTrip[];
    isLoading: boolean;
    isDone: boolean;
    loadMore: () => void;
    onPress: (tripId: string) => void;
}

export function PublicTripsList({
    trips,
    isLoading,
    isDone,
    loadMore,
    onPress,
}: PublicTripsListProps) {
    const renderItem = useCallback(
        ({ item }: { item: PublicTrip }) => (
            <PublicTripItem trip={item} onPress={onPress} />
        ),
        [onPress]
    );

    const keyExtractor = useCallback((item: PublicTrip) => item.tripId, []);

    const onEndReached = useCallback(() => {
        if (!isDone && !isLoading) loadMore();
    }, [isDone, isLoading, loadMore]);

    const ListFooter = useCallback(() => {
        if (isDone || trips.length === 0) return null;
        return (
            <View>
                <PublicTripItemSkeleton />
                <PublicTripItemSkeleton />
            </View>
        );
    }, [isDone, trips.length]);

    if (isLoading) {
        return (
            <View className="flex-1">
                <PublicTripSkeletons />
            </View>
        );
    }

    if (!isLoading && trips.length === 0) {
        return (
            <View className="flex-1 items-center justify-center gap-2 py-20">
                <Text className="text-muted-foreground text-base">
                    No public trips found
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={trips}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={Separator}
            ListFooterComponent={ListFooter}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
        />
    );
}
