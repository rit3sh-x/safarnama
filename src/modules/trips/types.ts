import { api } from "@backend/api";
import { Id } from "@backend/dataModel";
import { FunctionReturnType, FunctionArgs } from "convex/server";

export type NavOption = "trips" | "invites" | "public_trips";

export type TripId = Id<"trip">;

type TripsListResult = FunctionReturnType<typeof api.methods.trips.list>;
export type TripOrg = TripsListResult["page"][number];

type PublicTripsResult = FunctionReturnType<
    typeof api.methods.trips.listPublic
>;
export type PublicTrip = PublicTripsResult["page"][number];

type InvitesListResult = FunctionReturnType<
    typeof api.methods.requests.userListRequests
>;
export type InviteItem = InvitesListResult["page"][number];

export type ReviewType = FunctionArgs<
    typeof api.methods.requests.userReviewInvite
>["action"];

type MessagesListResult = FunctionReturnType<typeof api.methods.messages.list>;
export type Message = MessagesListResult["page"][number];

export type TripDetails = FunctionReturnType<typeof api.methods.trips.get>;
