import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/lib/theme";
import { getInitials, stringToHex } from "@/lib/utils";
import { Id } from "@backend/dataModel";
import { formatDistanceToNow } from "date-fns";
import { Image } from "expo-image";
import { useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";
import type { TripOrg } from "../../../types";

export function TripListItemSkeleton() {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3">
            <Skeleton className="w-14 h-14 rounded-full" />
            <View className="flex-1 gap-2">
                <View className="flex-row items-center justify-between">
                    <Skeleton className="h-4 w-32 rounded-md" />
                    <Skeleton className="h-3 w-10 rounded-md" />
                </View>
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
            </View>
        </View>
    );
}

function TripListSkeletons() {
    return (
        <>
            {Array.from({ length: 8 }).map((_, i) => (
                <TripListItemSkeleton key={i} />
            ))}
        </>
    );
}

interface TripListItemProps {
    trip: TripOrg;
    onPress: (data: {
        tripId: Id<"trip">;
        name: string;
        logo?: string;
    }) => void;
}

function TripListItem({ trip, onPress }: TripListItemProps) {
    const colors = useThemeColors();
    const initials = getInitials(trip.name);
    const bgColor = stringToHex(trip.name);
    const timeLabel = formatDistanceToNow(new Date(trip.updatedAt), {
        addSuffix: true,
    });

    const lastMessagePreview = trip.lastMessage
        ? trip.lastMessageSender
            ? `${trip.lastMessageSender}: ${trip.lastMessage}`
            : trip.lastMessage
        : (trip.destination ?? "No messages yet");

    return (
        <Pressable
            onPress={() =>
                onPress({
                    tripId: trip.tripId,
                    name: trip.name,
                    logo: trip.logo,
                })
            }
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
                <View className="flex-row items-center justify-between gap-2">
                    <Text
                        className="text-base font-semibold text-foreground flex-1"
                        numberOfLines={1}
                    >
                        {trip.name}
                    </Text>
                    <Text
                        className="text-xs shrink-0"
                        style={{
                            color:
                                trip.unreadCount > 0
                                    ? colors.primary
                                    : colors.mutedForeground,
                            fontWeight: trip.unreadCount > 0 ? "600" : "normal",
                        }}
                    >
                        {timeLabel}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between gap-2">
                    <Text
                        className="text-sm flex-1"
                        numberOfLines={1}
                        style={{
                            color:
                                trip.unreadCount > 0
                                    ? colors.foreground
                                    : colors.mutedForeground,
                        }}
                    >
                        {lastMessagePreview}
                    </Text>

                    {trip.unreadCount > 0 ? (
                        <View
                            className="rounded-full items-center justify-center shrink-0"
                            style={{
                                backgroundColor: colors.primary,
                                minWidth: 22,
                                height: 22,
                                paddingHorizontal: 6,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.primaryForeground,
                                    fontSize: 12,
                                    fontWeight: "700",
                                }}
                            >
                                {trip.unreadCount >= 100
                                    ? "99+"
                                    : trip.unreadCount}
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}

function Separator() {
    return <View className="h-px bg-border mx-4" />;
}

interface TripsListProps {
    trips: TripOrg[];
    isLoading: boolean;
    isDone: boolean;
    loadMore: () => void;
    onPress: (data: {
        tripId: Id<"trip">;
        name: string;
        logo?: string;
    }) => void;
}

export function TripsList({
    trips,
    isLoading,
    isDone,
    loadMore,
    onPress,
}: TripsListProps) {
    const renderItem = useCallback(
        ({ item }: { item: TripOrg }) => (
            <TripListItem trip={item} onPress={onPress} />
        ),
        [onPress]
    );

    const keyExtractor = useCallback((item: TripOrg) => item.orgId, []);

    const onEndReached = useCallback(() => {
        if (!isDone && !isLoading) loadMore();
    }, [isDone, isLoading, loadMore]);

    const ListFooter = useCallback(() => {
        if (isDone || trips.length === 0) return null;
        return (
            <View>
                <TripListItemSkeleton />
                <TripListItemSkeleton />
            </View>
        );
    }, [isDone, trips.length]);

    if (isLoading) {
        return (
            <View className="flex-1">
                <TripListSkeletons />
            </View>
        );
    }

    if (!isLoading && trips.length === 0) {
        return (
            <View className="flex-1 items-center justify-center gap-2 py-20">
                <Text className="text-muted-foreground text-base">
                    No trips found
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
