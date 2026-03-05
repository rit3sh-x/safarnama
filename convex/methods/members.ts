import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { PAGINATION, Owner } from "../lib/constants";
import { requireTripAdmin, requireTripMember } from "../lib/utils";
import { components } from "../_generated/api";
import { Doc } from "../betterAuth/_generated/dataModel";
import { PaginationResult } from "convex/server";

export const list = query({
    args: {
        tripId: v.id("trip"),
        cursor: v.optional(v.string()),
    },
    handler: async (ctx, { tripId, cursor }) => {
        const { trip } = await requireTripMember(ctx, tripId);

        const members: PaginationResult<{
            member: Doc<"member">;
            user: Doc<"user">;
        }> = await ctx.runQuery(components.betterAuth.adapter.findMany, {
            model: "member",
            where: [
                {
                    field: "organizationId",
                    value: trip.orgId,
                    operator: "eq",
                },
            ],
            join: [
                {
                    model: "user",
                    on: [{ field: "id", value: "userId", operator: "eq" }],
                },
            ],
            paginationOpts: {
                cursor: cursor ?? null,
                numItems: PAGINATION.MEMBERS_PAGE_SIZE,
            },
        });

        // TODO: validate types
        console.log(members);

        return members;
    },
});

export const remove = mutation({
    args: {
        tripId: v.id("trip"),
        targetUserId: v.string(),
    },
    handler: async (ctx, { tripId, targetUserId }) => {
        const { trip } = await requireTripAdmin(ctx, tripId);

        const target: Doc<"member"> | null = await ctx.runQuery(
            components.betterAuth.adapter.findOne,
            {
                model: "member",
                where: [
                    { field: "userId", value: targetUserId, operator: "eq" },
                    {
                        field: "organizationId",
                        value: trip.orgId,
                        operator: "eq",
                    },
                ],
            }
        );

        if (!target) throw new Error("Member not found");

        await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
            input: {
                model: "member",
                where: [{ field: "_id", value: target._id, operator: "eq" }],
            },
        });
    },
});

export const leave = mutation({
    args: { tripId: v.id("trip") },
    handler: async (ctx, { tripId }) => {
        const { member, trip } = await requireTripMember(ctx, tripId);

        if (member.role === "owner") {
            const otherOwner: Doc<"member"> | null = await ctx.runQuery(
                components.betterAuth.adapter.findOne,
                {
                    model: "member",
                    where: [
                        {
                            field: "organizationId",
                            value: trip.orgId,
                            operator: "eq",
                        },
                        {
                            field: "userId",
                            value: member.userId,
                            operator: "ne",
                            connector: "AND",
                        },
                        {
                            field: "role",
                            value: Owner.value,
                            operator: "eq",
                            connector: "AND",
                        },
                    ],
                }
            );

            if (!otherOwner) {
                throw new ConvexError({
                    code: "FORBIDDEN",
                    message:
                        "Assign another admin before leaving or delete trip",
                });
            }
        }

        await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
            input: {
                model: "member",
                where: [{ field: "_id", value: member._id, operator: "eq" }],
            },
        });
    },
});

export const changeRole = mutation({
    args: {
        tripId: v.id("trip"),
        targetUserId: v.string(),
        role: v.union(v.literal("owner"), v.literal("member")),
    },
    handler: async (ctx, { tripId, targetUserId, role }) => {
        const { trip } = await requireTripAdmin(ctx, tripId);

        const target: Doc<"member"> | null = await ctx.runQuery(
            components.betterAuth.adapter.findOne,
            {
                model: "member",
                where: [
                    { field: "userId", value: targetUserId, operator: "eq" },
                    {
                        field: "organizationId",
                        value: trip.orgId,
                        operator: "eq",
                    },
                ],
            }
        );

        if (!target) {
            throw new ConvexError({
                code: "NOT_FOUND",
                message: "Member not found",
            });
        }

        await ctx.runMutation(components.betterAuth.adapter.updateOne, {
            input: {
                model: "member",
                where: [{ field: "_id", value: target._id, operator: "eq" }],
                update: { role },
            },
        });
    },
});
