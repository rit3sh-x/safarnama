import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const currencyValidator = v.string();

export default defineSchema({
    trip: defineTable({
        orgId: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        destination: v.string(),
        coverImage: v.optional(v.string()),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        defaultCurrency: currencyValidator,
        isPublic: v.boolean(),
        createdBy: v.string(),
        updatedAt: v.number(),
        blog: v.optional(
            v.object({
                title: v.string(),
                content: v.string(),
                coverImage: v.optional(v.string()),
                published: v.boolean(),
                publishedAt: v.optional(v.number()),
                updatedAt: v.number(),
            })
        ),
    })
        .index("orgId", ["orgId"])
        .index("isPublic", ["isPublic"])
        .index("createdBy", ["createdBy"]),

    blogComment: defineTable({
        tripId: v.id("trip"),
        authorId: v.string(),
        content: v.string(),
        parentId: v.optional(v.id("blogComment")),
        editedAt: v.optional(v.number()),
        deletedAt: v.optional(v.number()),
    })
        .index("tripId", ["tripId"])
        .index("parentId", ["parentId"]),

    joinRequest: defineTable({
        tripId: v.id("trip"),
        orgId: v.string(),
        userId: v.string(),
        message: v.optional(v.string()),
        status: v.union(
            v.literal("pending"),
            v.literal("accepted"),
            v.literal("rejected")
        ),
        reviewedBy: v.optional(v.string()),
        reviewedAt: v.optional(v.number()),
    })
        .index("tripId", ["tripId"])
        .index("tripId_status", ["tripId", "status"])
        .index("userId_tripId", ["userId", "tripId"]),

    message: defineTable({
        tripId: v.id("trip"),
        senderId: v.string(),
        type: v.union(
            v.literal("message"),
            v.literal("expense_event"),
            v.literal("member_joined"),
            v.literal("member_left")
        ),
        content: v.string(),
        expenseId: v.optional(v.id("expense")),
        replyToId: v.optional(v.id("message")),
        attachmentUrl: v.optional(v.string()),
        attachmentType: v.optional(
            v.union(v.literal("image"), v.literal("file"))
        ),
        editedAt: v.optional(v.number()),
        deletedAt: v.optional(v.number()),
    })
        .index("tripId", ["tripId"])
        .index("senderId", ["senderId"])
        .index("tripId_type", ["tripId", "type"]),

    expense: defineTable({
        tripId: v.id("trip"),
        title: v.string(),
        amount: v.number(),
        currency: currencyValidator,
        paidBy: v.string(),
        date: v.number(),
        notes: v.optional(v.string()),
        receiptUrl: v.optional(v.string()),
        splitType: v.union(
            v.literal("equal"),
            v.literal("exact"),
            v.literal("percentage"),
            v.literal("payer_only")
        ),
        updatedAt: v.number(),
    })
        .index("tripId", ["tripId"])
        .index("tripId_date", ["tripId", "date"])
        .index("paidBy", ["paidBy"]),

    expenseSplit: defineTable({
        expenseId: v.id("expense"),
        tripId: v.id("trip"),
        userId: v.string(),
        owedAmount: v.number(),
        percentage: v.optional(v.number()),
        settled: v.boolean(),
        settledAt: v.optional(v.number()),
    })
        .index("tripId", ["tripId"])
        .index("expenseId", ["expenseId"])
        .index("tripId_userId", ["tripId", "userId"])
        .index("userId_settled", ["userId", "settled"]),

    settlement: defineTable({
        tripId: v.id("trip"),
        fromUserId: v.string(),
        toUserId: v.string(),
        amount: v.number(),
        currency: currencyValidator,
        note: v.optional(v.string()),
    })
        .index("tripId", ["tripId"])
        .index("fromUserId", ["fromUserId"])
        .index("toUserId", ["toUserId"]),
});
