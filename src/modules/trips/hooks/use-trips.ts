import { PAGINATION } from "@/lib/constants";
import { api } from "@backend/api";
import { usePaginatedQuery, useMutation } from "convex/react";
import { useSearchParams } from "./use-search-params";

export function useTrips() {
    const { search } = useSearchParams();
    const { results, status, loadMore } = usePaginatedQuery(
        api.methods.trips.list,
        { search: search?.trim() || undefined },
        { initialNumItems: PAGINATION.TRIPS_PAGE_SIZE }
    );

    return {
        trips: results,
        isLoading: status === "LoadingFirstPage",
        isDone: status === "Exhausted",
        loadMore: () => loadMore(PAGINATION.TRIPS_PAGE_SIZE),
    };
}

export function usePublicTrips() {
    const { search } = useSearchParams();
    const { results, status, loadMore } = usePaginatedQuery(
        api.methods.trips.listPublic,
        { search: search?.trim() || undefined },
        { initialNumItems: PAGINATION.TRIPS_PAGE_SIZE }
    );

    return {
        trips: results,
        isLoading: status === "LoadingFirstPage",
        isDone: status === "Exhausted",
        loadMore: () => loadMore(PAGINATION.TRIPS_PAGE_SIZE),
    };
}

export function useCreateTrip() {
    return useMutation(api.methods.trips.create);
}

export function useUpdateTrip() {
    return useMutation(api.methods.trips.update);
}

export function useRemoveTrip() {
    return useMutation(api.methods.trips.remove);
}
