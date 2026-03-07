import { usePaginatedQuery } from "convex/react";
import { api } from "@backend/api";
import type { TripId } from "../types";

const PAGE_SIZE = 25;

export function useMessages(tripId: TripId | undefined) {
    const { results, status, loadMore } = usePaginatedQuery(
        api.methods.messages.list,
        tripId ? { tripId } : "skip",
        { initialNumItems: PAGE_SIZE }
    );

    return {
        messages: results ?? [],
        isLoading: status === "LoadingFirstPage",
        canLoadMore: status === "CanLoadMore",
        loadMore: () => loadMore(PAGE_SIZE),
    };
}
