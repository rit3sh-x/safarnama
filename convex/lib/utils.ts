import { APIError } from "better-auth/api";
import { GenericCtx } from "@convex-dev/better-auth";
import { DataModel, Id } from "../_generated/dataModel";
import { components } from "../_generated/api";
import { Doc } from "../betterAuth/_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";

export async function requireUserAccess(ctx: GenericCtx<DataModel>) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity)
        throw new APIError("UNAUTHORIZED", {
            message: "Please sign in to continue.",
        });

    const user: Doc<"user"> = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
            model: "user",
            where: [{ field: "_id", value: identity.subject, operator: "eq" }],
        }
    );

    return user;
}

export async function requireOrgAccess(
    ctx: GenericCtx<DataModel>,
    orgId: string
) {
    const user = await requireUserAccess(ctx);

    const member: Doc<"member"> | null = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
            model: "member",
            where: [
                { field: "userId", value: user._id, operator: "eq" },
                { field: "organizationId", value: orgId, operator: "eq" },
            ],
        }
    );

    if (!member)
        throw new APIError("FORBIDDEN", {
            message: "You do not have access to this organization.",
        });

    return { user, member };
}

export async function getTrip(ctx: QueryCtx | MutationCtx, tripId: Id<"trip">) {
    const trip = await ctx.db.get(tripId);
    if (!trip) throw new Error("Trip not found");
    return trip;
}

export async function requireTripMember(
    ctx: QueryCtx | MutationCtx,
    tripId: Id<"trip">
) {
    const trip = await ctx.db.get(tripId);
    if (!trip) throw new Error("Trip not found");

    const user = await requireUserAccess(ctx);

    const member: Doc<"member"> | null = await ctx.runQuery(
        components.betterAuth.adapter.findOne,
        {
            model: "member",
            where: [
                { field: "userId", value: user._id, operator: "eq" },
                { field: "organizationId", value: trip.orgId, operator: "eq" },
            ],
        }
    );

    if (!member)
        throw new APIError("FORBIDDEN", {
            message: "Not a member of this trip.",
        });

    return { user, member, trip };
}

export async function requireTripAdmin(
    ctx: QueryCtx | MutationCtx,
    tripId: Id<"trip">
) {
    const result = await requireTripMember(ctx, tripId);
    if (result.member.role !== "owner")
        throw new APIError("FORBIDDEN", { message: "Admin access required." });
    return result;
}
