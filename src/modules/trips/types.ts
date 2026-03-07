import { api } from "@backend/api";
import { FunctionReturnType, FunctionArgs } from "convex/server";

export type NavOption = "trips" | "invites" | "public_trips";

type TripsListResult = FunctionReturnType<typeof api.methods.trips.list>;
export type TripOrg = TripsListResult["page"][number];

export type ReviewType = FunctionArgs<
    typeof api.methods.requests.userReviewInvite
>["action"];
