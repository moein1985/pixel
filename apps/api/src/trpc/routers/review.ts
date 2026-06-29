import { router, publicProcedure, protectedProcedure } from "../context.js";
import { reviews, favorites, orders } from "@pixel/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { createReviewSchema } from "@pixel/shared";
import { z } from "zod";

export const reviewRouter = router({
  create: protectedProcedure.input(createReviewSchema).mutation(async ({ ctx, input }) => {
    const [order] = await ctx.db.select().from(orders).where(eq(orders.id, input.orderId)).limit(1);
    if (!order) throw new Error("سفارش یافت نشد");
    if (order.buyerId !== ctx.user.id) throw new Error("دسترسی غیرمجاز");
    if (order.status !== "delivered") throw new Error("فقط سفارش‌های تحویل‌شده قابل ارزیابی هستند");

    const [review] = await ctx.db
      .insert(reviews)
      .values({
        reviewerId: ctx.user.id,
        orderId: input.orderId,
        revieweeType: input.revieweeType as any,
        revieweeId: input.revieweeId,
        rating: input.rating,
        qualityRating: input.qualityRating,
        deliveryRating: input.deliveryRating,
        communicationRating: input.communicationRating,
        comment: input.comment,
        isVerified: true,
      })
      .returning();
    return review;
  }),

  list: publicProcedure
    .input(z.object({
      revieweeType: z.enum(["supplier", "product", "farmer", "company"]),
      revieweeId: z.string().uuid(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(reviews)
        .where(and(eq(reviews.revieweeType, input.revieweeType as any), eq(reviews.revieweeId, input.revieweeId)))
        .orderBy(desc(reviews.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(reviews)
        .where(and(eq(reviews.revieweeType, input.revieweeType as any), eq(reviews.revieweeId, input.revieweeId)));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  reply: protectedProcedure
    .input(z.object({ reviewId: z.string().uuid(), reply: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(reviews).set({ reply: input.reply }).where(eq(reviews.id, input.reviewId));
      return { success: true };
    }),
});

export const favoriteRouter = router({
  toggle: protectedProcedure
    .input(z.object({ itemType: z.string(), itemId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(favorites)
        .where(and(eq(favorites.userId, ctx.user.id), eq(favorites.itemType, input.itemType), eq(favorites.itemId, input.itemId)))
        .limit(1);

      if (existing) {
        await ctx.db.delete(favorites).where(eq(favorites.id, existing.id));
        return { success: true, favorited: false };
      }

      await ctx.db.insert(favorites).values({ userId: ctx.user.id, itemType: input.itemType, itemId: input.itemId });
      return { success: true, favorited: true };
    }),

  list: protectedProcedure
    .input(z.object({ itemType: z.string().optional(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(favorites.userId, ctx.user.id)];
      if (input.itemType) conditions.push(eq(favorites.itemType, input.itemType));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(favorites)
        .where(and(...conditions))
        .orderBy(desc(favorites.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(favorites)
        .where(and(...conditions));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),
});
