import { api } from "@backend/api";
import { FunctionReturnType, FunctionArgs } from "convex/server";

export type NavOption = "trips" | "invites" | "public_trips";

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
