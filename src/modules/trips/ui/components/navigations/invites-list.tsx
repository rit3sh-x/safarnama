import { Skeleton } from "@/components/ui/skeleton";
import { Text } from "@/components/ui/text";
import { getInitials, stringToHex } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useCallback } from "react";
import { FlatList, Pressable, View } from "react-native";
import type { InviteItem, ReviewType } from "../../../types";

function InviteItemSkeleton() {
    return (
        <View className="flex-row items-center px-4 py-3 gap-3">
            <Skeleton className="w-14 h-14 rounded-full" />
            <View className="flex-1 gap-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
                <View className="flex-row gap-2 mt-1">
                    <Skeleton className="h-8 w-20 rounded-md" />
                    <Skeleton className="h-8 w-20 rounded-md" />
                </View>
            </View>
        </View>
    );
}

function InviteSkeletons() {
    return (
        <>
            {Array.from({ length: 6 }).map((_, i) => (
                <InviteItemSkeleton key={i} />
            ))}
        </>
    );
}

interface InviteListItemProps {
    invite: InviteItem;
    onReview: (requestId: InviteItem["_id"], action: ReviewType) => void;
    isReviewing: boolean;
}

function InviteListItem({
    invite,
    onReview,
    isReviewing,
}: InviteListItemProps) {
    const tripName = invite.trip?.title ?? "Unknown Trip";
    const initials = getInitials(tripName);
    const bgColor = stringToHex(tripName);
    const timeLabel = formatDistanceToNow(new Date(invite._creationTime), {
        addSuffix: true,
    });

    return (
        <View className="px-4 py-3 gap-2">
            <View className="flex-row items-center gap-3">
                <View className="w-14 h-14 rounded-full overflow-hidden">
                    <View
                        className="w-full h-full items-center justify-center"
                        style={{ backgroundColor: bgColor }}
                    >
                        <Text className="text-lg font-bold text-white">
                            {initials}
                        </Text>
                    </View>
                </View>

                <View className="flex-1 gap-0.5">
                    <View className="flex-row items-center justify-between gap-2">
                        <Text
                            className="text-base font-semibold text-foreground flex-1"
                            numberOfLines={1}
                        >
                            {tripName}
                        </Text>
                        <Text className="text-xs text-muted-foreground shrink-0">
                            {timeLabel}
                        </Text>
                    </View>
                    {invite.message && (
                        <Text
                            className="text-sm text-muted-foreground"
                            numberOfLines={2}
                        >
                            {invite.message}
                        </Text>
                    )}
                </View>
            </View>

            <View className="flex-row gap-2 ml-17">
                <Pressable
                    onPress={() => onReview(invite._id, "accept")}
                    disabled={isReviewing}
                    className="px-4 py-1.5 rounded-full bg-primary active:opacity-80"
                >
                    <Text className="text-sm font-medium text-primary-foreground">
                        Accept
                    </Text>
                </Pressable>
                <Pressable
                    onPress={() => onReview(invite._id, "reject")}
                    disabled={isReviewing}
                    className="px-4 py-1.5 rounded-full bg-muted active:opacity-80"
                >
                    <Text className="text-sm font-medium text-foreground">
                        Decline
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

function Separator() {
    return <View className="h-px bg-border mx-4" />;
}

interface InvitesListProps {
    invites: InviteItem[];
    isLoading: boolean;
    isDone: boolean;
    loadMore: () => void;
    onReview: (requestId: InviteItem["_id"], action: ReviewType) => void;
    isReviewing: boolean;
}

export function InvitesList({
    invites,
    isLoading,
    isDone,
    loadMore,
    onReview,
    isReviewing,
}: InvitesListProps) {
    const renderItem = useCallback(
        ({ item }: { item: InviteItem }) => (
            <InviteListItem
                invite={item}
                onReview={onReview}
                isReviewing={isReviewing}
            />
        ),
        [onReview, isReviewing]
    );

    const keyExtractor = useCallback((item: InviteItem) => item._id, []);

    const onEndReached = useCallback(() => {
        if (!isDone && !isLoading) loadMore();
    }, [isDone, isLoading, loadMore]);

    const ListFooter = useCallback(() => {
        if (isDone || invites.length === 0) return null;
        return (
            <View>
                <InviteItemSkeleton />
                <InviteItemSkeleton />
            </View>
        );
    }, [isDone, invites.length]);

    if (isLoading) {
        return (
            <View className="flex-1">
                <InviteSkeletons />
            </View>
        );
    }

    if (!isLoading && invites.length === 0) {
        return (
            <View className="flex-1 items-center justify-center gap-2 py-20">
                <Text className="text-muted-foreground text-base">
                    No invites found
                </Text>
            </View>
        );
    }

    return (
        <FlatList
            data={invites}
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
