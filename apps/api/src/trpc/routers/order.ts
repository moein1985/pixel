import { router, protectedProcedure, roleProcedure } from "../context.js";
import { orders, orderStatusHistory, suppliers, transactions } from "@pixel/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { createOrderSchema } from "@pixel/shared";
import { z } from "zod";

export const orderRouter = router({
  create: roleProcedure(["farmer", "company"]).mutation(async ({ ctx, input }) => {
    const body = createOrderSchema.parse(input);
    const totalAmount = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderNumber = `PIX-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;

    const [order] = await ctx.db
      .insert(orders)
      .values({
        orderNumber,
        buyerId: ctx.user.id,
        supplierId: body.supplierId,
        items: body.items,
        totalAmount: String(totalAmount),
        status: "pending",
        paymentStatus: "unpaid",
        shippingAddress: body.shippingAddress,
        notes: body.notes,
      })
      .returning();

    await ctx.db.insert(orderStatusHistory).values({ orderId: order.id, status: "pending", changedBy: ctx.user.id });
    return order;
  }),

  getMyOrders: protectedProcedure
    .input(z.object({ status: z.string().optional(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(orders.buyerId, ctx.user.id)];
      if (input.status) conditions.push(eq(orders.status, input.status as any));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          totalAmount: orders.totalAmount,
          status: orders.status,
          paymentStatus: orders.paymentStatus,
          createdAt: orders.createdAt,
          supplierName: suppliers.supplierName,
        })
        .from(orders)
        .innerJoin(suppliers, eq(suppliers.id, orders.supplierId))
        .where(and(...conditions))
        .orderBy(desc(orders.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(and(...conditions));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  getSupplierOrders: roleProcedure(["supplier"]).query(async ({ ctx, input }) => {
    const { page, pageSize } = z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }).parse(input ?? {});
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) return { items: [], total: 0, page, pageSize };

    const offset = (page - 1) * pageSize;
    const items = await ctx.db
      .select()
      .from(orders)
      .where(eq(orders.supplierId, supplier.id))
      .orderBy(desc(orders.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(orders)
      .where(eq(orders.supplierId, supplier.id));

    return { items, total: count, page, pageSize };
  }),

  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [order] = await ctx.db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerId: orders.buyerId,
        supplierId: orders.supplierId,
        items: orders.items,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        shippingAddress: orders.shippingAddress,
        shippingCost: orders.shippingCost,
        notes: orders.notes,
        trackingCode: orders.trackingCode,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        supplierName: suppliers.supplierName,
      })
      .from(orders)
      .innerJoin(suppliers, eq(suppliers.id, orders.supplierId))
      .where(eq(orders.id, input.id))
      .limit(1);

    if (!order) return null;
    if (order.buyerId !== ctx.user.id) {
      const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
      if (!supplier || supplier.id !== order.supplierId) {
        if (ctx.user.role !== "admin") return null;
      }
    }

    const history = await ctx.db
      .select()
      .from(orderStatusHistory)
      .where(eq(orderStatusHistory.orderId, input.id))
      .orderBy(desc(orderStatusHistory.createdAt));

    return { ...order, history };
  }),

  confirm: roleProcedure(["supplier"]).mutation(async ({ ctx, input }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(input);
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) throw new Error("پروفایل تأمین‌کننده یافت نشد");

    const [updated] = await ctx.db
      .update(orders)
      .set({ status: "confirmed", updatedAt: new Date() })
      .where(and(eq(orders.id, id), eq(orders.supplierId, supplier.id)))
      .returning();

    await ctx.db.insert(orderStatusHistory).values({ orderId: id, status: "confirmed", changedBy: ctx.user.id });
    return { success: true };
  }),

  cancel: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { id, reason } = z.object({ id: z.string().uuid(), reason: z.string().optional() }).parse(input);
    const [order] = await ctx.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new Error("سفارش یافت نشد");
    if (order.buyerId !== ctx.user.id && ctx.user.role !== "admin") throw new Error("دسترسی غیرمجاز");

    await ctx.db.update(orders).set({ status: "cancelled", updatedAt: new Date() }).where(eq(orders.id, id));
    await ctx.db.insert(orderStatusHistory).values({ orderId: id, status: "cancelled", note: reason, changedBy: ctx.user.id });
    return { success: true };
  }),

  markPaid: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { id, transactionId } = z.object({ id: z.string().uuid(), transactionId: z.string().optional() }).parse(input);
    await ctx.db.update(orders).set({ status: "paid", paymentStatus: "paid", updatedAt: new Date() }).where(eq(orders.id, id));
    await ctx.db.insert(orderStatusHistory).values({ orderId: id, status: "paid", changedBy: ctx.user.id });
    if (transactionId) {
      await ctx.db.update(transactions).set({ status: "paid", refId: transactionId }).where(eq(transactions.orderId, id));
    }
    return { success: true };
  }),

  markShipped: roleProcedure(["supplier"]).mutation(async ({ ctx, input }) => {
    const { id, trackingCode } = z.object({ id: z.string().uuid(), trackingCode: z.string().optional() }).parse(input);
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) throw new Error("پروفایل تأمین‌کننده یافت نشد");

    await ctx.db
      .update(orders)
      .set({ status: "shipped", trackingCode, updatedAt: new Date() })
      .where(and(eq(orders.id, id), eq(orders.supplierId, supplier.id)));
    await ctx.db.insert(orderStatusHistory).values({ orderId: id, status: "shipped", changedBy: ctx.user.id });
    return { success: true };
  }),

  markDelivered: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(input);
    const [order] = await ctx.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order) throw new Error("سفارش یافت نشد");
    if (order.buyerId !== ctx.user.id) throw new Error("دسترسی غیرمجاز");

    await ctx.db.update(orders).set({ status: "delivered", updatedAt: new Date() }).where(eq(orders.id, id));
    await ctx.db.insert(orderStatusHistory).values({ orderId: id, status: "delivered", changedBy: ctx.user.id });
    return { success: true };
  }),

  dispute: protectedProcedure.mutation(async ({ ctx, input }) => {
    const { id, reason } = z.object({ id: z.string().uuid(), reason: z.string() }).parse(input);
    const [order] = await ctx.db.select().from(orders).where(eq(orders.id, id)).limit(1);
    if (!order || order.buyerId !== ctx.user.id) throw new Error("دسترسی غیرمجاز");

    await ctx.db.update(orders).set({ status: "disputed", updatedAt: new Date() }).where(eq(orders.id, id));
    await ctx.db.insert(orderStatusHistory).values({ orderId: id, status: "disputed", note: reason, changedBy: ctx.user.id });
    return { success: true };
  }),
});
