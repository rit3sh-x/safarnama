import { api } from "@backend/api";
import { useMutation, usePaginatedQuery } from "convex/react";
import { Id as IdAuth } from "@backend/authDataModel";
import { Id } from "@backend/dataModel";
import { useState } from "react";
import { useSearchParams } from "./use-search-params";
import { PAGINATION } from "@/lib/constants";
import { ReviewType } from "../types";

export const useSendRequest = ({
    orgId,
    message,
}: {
    orgId: IdAuth<"organization">;
    message?: string;
}) => {
    const [isPending, setIsPending] = useState(false);
    const sendRequest = useMutation(api.methods.requests.userSendRequest);

    const mutate = async () => {
        setIsPending(true);
        try {
            await sendRequest({
                orgId,
                message,
            });
        } catch {
            console.error("Failed to update recording state");
        } finally {
            setIsPending(false);
        }
    };

    return { mutate, isPending };
};

export const useListRequests = () => {
    const { search } = useSearchParams();
    const { results, status, loadMore } = usePaginatedQuery(
        api.methods.requests.userListRequests,
        { search: search?.trim() },
        { initialNumItems: PAGINATION.INVITES_PAGE_SIZE }
    );

    return {
        trips: results,
        isLoading: status === "LoadingFirstPage",
        isDone: status === "Exhausted",
        loadMore: () => loadMore(PAGINATION.INVITES_PAGE_SIZE),
    };
};

export const useCancelRequest = ({
    requestId,
}: {
    requestId: Id<"joinRequest">;
}) => {
    const [isPending, setIsPending] = useState(false);
    const cancelRequest = useMutation(api.methods.requests.userCancelRequest);

    const mutate = async () => {
        setIsPending(true);
        try {
            await cancelRequest({
                requestId,
            });
        } catch {
            console.error("Failed to cancel request");
        } finally {
            setIsPending(false);
        }
    };

    return { mutate, isPending };
};

export const useReviewInvite = ({
    requestId,
    review,
}: {
    requestId: Id<"joinRequest">;
    review: ReviewType;
}) => {
    const [isPending, setIsPending] = useState(false);
    const reviewInvite = useMutation(api.methods.requests.userReviewInvite);

    const mutate = async () => {
        setIsPending(true);
        try {
            await reviewInvite({
                requestId,
                action: review,
            });
        } catch {
            console.error("Failed to respond to request");
        } finally {
            setIsPending(false);
        }
    };

    return { mutate, isPending };
};
