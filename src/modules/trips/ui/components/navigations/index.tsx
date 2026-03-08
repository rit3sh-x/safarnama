import { useNavigationOptions } from "@/modules/trips/hooks/use-navigation-options";
import { useTrips, usePublicTrips } from "@/modules/trips/hooks/use-trips";
import {
    useListRequests,
    useReviewInvite,
} from "@/modules/trips/hooks/use-invites";
import { TripsList } from "./trips-list";
import { InvitesList } from "./invites-list";
import { PublicTripsList } from "./public-trips-list";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import type { InviteItem, ReviewType } from "../../../types";

function TripsTab() {
    const { trips, isLoading, isDone, loadMore } = useTrips();
    const router = useRouter();

    const handlePress = useCallback(
        (id: string) => {
            router.push(`/(custom)/trips/${id}/chat`);
        },
        [router]
    );

    return (
        <TripsList
            trips={trips}
            isLoading={isLoading}
            isDone={isDone}
            loadMore={loadMore}
            onPress={handlePress}
        />
    );
}

function InvitesTab() {
    const { invites, isLoading, isDone, loadMore } = useListRequests();
    const { mutate: reviewInvite, isPending } = useReviewInvite();

    const handleReview = useCallback(
        (requestId: InviteItem["_id"], action: ReviewType) => {
            reviewInvite({ requestId, action });
        },
        [reviewInvite]
    );

    return (
        <InvitesList
            invites={invites}
            isLoading={isLoading}
            isDone={isDone}
            loadMore={loadMore}
            onReview={handleReview}
            isReviewing={isPending}
        />
    );
}

function PublicTripsTab() {
    const { trips, isLoading, isDone, loadMore } = usePublicTrips();
    const router = useRouter();

    const handlePress = useCallback(
        (tripId: string) => {
            router.push(`/(custom)/trips/${tripId}/info`);
        },
        [router]
    );

    return (
        <PublicTripsList
            trips={trips}
            isLoading={isLoading}
            isDone={isDone}
            loadMore={loadMore}
            onPress={handlePress}
        />
    );
}

export const Navigations = () => {
    const { tab } = useNavigationOptions();

    switch (tab) {
        case "trips":
            return <TripsTab />;
        case "invites":
            return <InvitesTab />;
        case "public_trips":
            return <PublicTripsTab />;
    }
};
