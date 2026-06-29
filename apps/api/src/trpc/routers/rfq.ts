import { router, publicProcedure, protectedProcedure, roleProcedure } from "../context.js";
import { rfqs, rfqBids, suppliers, orders, orderStatusHistory, orderStatusEnum } from "@pixel/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { createRfqSchema, placeBidSchema, paginationSchema } from "@pixel/shared";
import { z } from "zod";

export const rfqRouter = router({
  create: roleProcedure(["farmer", "company"]).mutation(async ({ ctx, input }) => {
    const body = createRfqSchema.parse(input);
    const [rfq] = await ctx.db
      .insert(rfqs)
      .values({ ...body, quantity: String(body.quantity), targetPrice: body.targetPrice ? String(body.targetPrice) : undefined, buyerId: ctx.user.id })
      .returning();
    return rfq;
  }),

  getMyRfqs: protectedProcedure
    .input(z.object({ status: z.string().optional(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(rfqs.buyerId, ctx.user.id)];
      if (input.status) conditions.push(eq(rfqs.status, input.status as any));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(rfqs)
        .where(and(...conditions))
        .orderBy(desc(rfqs.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(rfqs)
        .where(and(...conditions));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  list: publicProcedure
    .input(z.object({
      categoryId: z.number().int().optional(),
      province: z.string().optional(),
      status: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(rfqs.status, "open")];
      if (input.categoryId) conditions.push(eq(rfqs.categoryId, input.categoryId));
      if (input.province) conditions.push(eq(rfqs.deliveryProvince, input.province));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(rfqs)
        .where(and(...conditions))
        .orderBy(desc(rfqs.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(rfqs)
        .where(and(...conditions));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  get: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [rfq] = await ctx.db.select().from(rfqs).where(eq(rfqs.id, input.id)).limit(1);
    if (!rfq) return null;

    const bids = await ctx.db
      .select({
        id: rfqBids.id,
        offeredPrice: rfqBids.offeredPrice,
        offeredQuantity: rfqBids.offeredQuantity,
        deliveryTime: rfqBids.deliveryTime,
        notes: rfqBids.notes,
        status: rfqBids.status,
        createdAt: rfqBids.createdAt,
        supplierName: suppliers.supplierName,
        supplierId: suppliers.id,
      })
      .from(rfqBids)
      .innerJoin(suppliers, eq(suppliers.id, rfqBids.supplierId))
      .where(eq(rfqBids.rfqId, input.id))
      .orderBy(desc(rfqBids.createdAt));

    return { ...rfq, bids };
  }),

  close: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(input);
    const [updated] = await ctx.db
      .update(rfqs)
      .set({ status: "closed", updatedAt: new Date() })
      .where(and(eq(rfqs.id, id), eq(rfqs.buyerId, ctx.user.id)))
      .returning();
    return updated;
  }),

  placeBid: roleProcedure(["supplier"]).mutation(async ({ ctx, input }) => {
    const body = placeBidSchema.parse(input);
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) throw new Error("پروفایل تأمین‌کننده یافت نشد");

    const [bid] = await ctx.db
      .insert(rfqBids)
      .values({ ...body, offeredPrice: String(body.offeredPrice), offeredQuantity: body.offeredQuantity ? String(body.offeredQuantity) : undefined, supplierId: supplier.id })
      .returning();
    return bid;
  }),

  getMyBids: roleProcedure(["supplier"]).query(async ({ ctx, input }) => {
    const { page, pageSize } = paginationSchema.parse(input ?? {});
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) return { items: [], total: 0, page, pageSize };

    const offset = (page - 1) * pageSize;
    const items = await ctx.db
      .select({
        id: rfqBids.id,
        offeredPrice: rfqBids.offeredPrice,
        status: rfqBids.status,
        createdAt: rfqBids.createdAt,
        rfqProductName: rfqs.productName,
        rfqQuantity: rfqs.quantity,
        rfqUnit: rfqs.unit,
      })
      .from(rfqBids)
      .innerJoin(rfqs, eq(rfqs.id, rfqBids.rfqId))
      .where(eq(rfqBids.supplierId, supplier.id))
      .orderBy(desc(rfqBids.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(rfqBids)
      .where(eq(rfqBids.supplierId, supplier.id));

    return { items, total: count, page, pageSize };
  }),

  acceptBid: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { bidId } = z.object({ bidId: z.string().uuid() }).parse(input);

    const [bid] = await ctx.db
      .select()
      .from(rfqBids)
      .where(eq(rfqBids.id, bidId))
      .limit(1);
    if (!bid) throw new Error("پیشنهاد یافت نشد");

    const [rfq] = await ctx.db.select().from(rfqs).where(eq(rfqs.id, bid.rfqId)).limit(1);
    if (!rfq || rfq.buyerId !== ctx.user.id) throw new Error("دسترسی غیرمجاز");

    const orderNumber = `PIX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;
    const [order] = await ctx.db
      .insert(orders)
      .values({
        orderNumber,
        buyerId: ctx.user.id,
        supplierId: bid.supplierId,
        items: [{ productName: rfq.productName, quantity: String(rfq.quantity), unit: rfq.unit, price: String(bid.offeredPrice) }],
        totalAmount: String(bid.offeredPrice),
        status: "pending",
        paymentStatus: "unpaid",
      })
      .returning();

    await ctx.db.update(rfqBids).set({ status: "accepted" }).where(eq(rfqBids.id, bidId));
    await ctx.db.update(rfqs).set({ status: "awarded", updatedAt: new Date() }).where(eq(rfqs.id, bid.rfqId));
    await ctx.db.insert(orderStatusHistory).values({ orderId: order.id, status: "pending", changedBy: ctx.user.id });

    return { orderId: order.id, orderNumber: order.orderNumber };
  }),

  rejectBid: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { bidId, reason } = z.object({ bidId: z.string().uuid(), reason: z.string().optional() }).parse(input);

    const [bid] = await ctx.db.select().from(rfqBids).where(eq(rfqBids.id, bidId)).limit(1);
    if (!bid) throw new Error("پیشنهاد یافت نشد");

    const [rfq] = await ctx.db.select().from(rfqs).where(eq(rfqs.id, bid.rfqId)).limit(1);
    if (!rfq || rfq.buyerId !== ctx.user.id) throw new Error("دسترسی غیرمجاز");

    await ctx.db.update(rfqBids).set({ status: "rejected" }).where(eq(rfqBids.id, bidId));
    return { success: true };
  }),
});
