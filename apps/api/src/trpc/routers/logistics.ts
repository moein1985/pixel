import { router, protectedProcedure, roleProcedure, adminProcedure } from "../context.js";
import { shipments, shipmentTracking, orders, webhooks, webhookDeliveries, apiKeys } from "@pixel/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { createShipmentSchema, createWebhookSchema, createApiKeySchema } from "@pixel/shared";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";

export const shipmentRouter = router({
  create: roleProcedure(["supplier"]).mutation(async ({ ctx, input }) => {
    const body = createShipmentSchema.parse(input);
    const shipmentNumber = `SHP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString().slice(-4)}`;

    const [shipment] = await ctx.db
      .insert(shipments)
      .values({
        ...body,
        estimatedCost: body.estimatedCost ? String(body.estimatedCost) : undefined,
        shipmentNumber,
      })
      .returning();

    await ctx.db.insert(shipmentTracking).values({
      shipmentId: shipment.id,
      status: "preparing",
      note: "محموله ایجاد شد",
    });

    return shipment;
  }),

  get: protectedProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [shipment] = await ctx.db.select().from(shipments).where(eq(shipments.id, input.id)).limit(1);
    if (!shipment) return null;

    const tracking = await ctx.db
      .select()
      .from(shipmentTracking)
      .where(eq(shipmentTracking.shipmentId, input.id))
      .orderBy(desc(shipmentTracking.recordedAt));

    return { ...shipment, tracking };
  }),

  getByOrder: protectedProcedure.input(z.object({ orderId: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [shipment] = await ctx.db.select().from(shipments).where(eq(shipments.orderId, input.orderId)).limit(1);
    return shipment ?? null;
  }),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: z.enum(["preparing", "picked_up", "in_transit", "delivered", "failed"]), note: z.string().optional(), lat: z.number().optional(), lng: z.number().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { id, status, note, lat, lng } = input;

      const updates: any = { status, updatedAt: new Date() };
      if (status === "picked_up") updates.pickupAt = new Date();
      if (status === "delivered") updates.deliveredAt = new Date();

      await ctx.db.update(shipments).set(updates).where(eq(shipments.id, id));
      await ctx.db.insert(shipmentTracking).values({
        shipmentId: id,
        status,
        note,
        latitude: lat ? String(lat) : undefined,
        longitude: lng ? String(lng) : undefined,
      });

      return { success: true };
    }),

  listSupplierShipments: roleProcedure(["supplier"]).query(async ({ ctx, input }) => {
    const { page, pageSize } = z.object({ page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }).parse(input ?? {});
    const offset = (page - 1) * pageSize;

    const items = await ctx.db
      .select()
      .from(shipments)
      .orderBy(desc(shipments.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await ctx.db.select({ count: sql<number>`count(*)::int` }).from(shipments);
    return { items, total: count, page, pageSize };
  }),

  listAll: adminProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.select().from(shipments).orderBy(desc(shipments.createdAt)).limit(100);
    return items;
  }),
});

export const webhookRouter = router({
  create: protectedProcedure.input(createWebhookSchema).mutation(async ({ ctx, input }) => {
    const secret = randomBytes(32).toString("hex");
    const [webhook] = await ctx.db
      .insert(webhooks)
      .values({ ...input, secret })
      .returning();
    return { ...webhook, secret };
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.select().from(webhooks).where(eq(webhooks.isActive, true));
    return items;
  }),

  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await ctx.db.update(webhooks).set({ isActive: false }).where(eq(webhooks.id, input.id));
    return { success: true };
  }),

  getDeliveries: protectedProcedure
    .input(z.object({ webhookId: z.string().uuid(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.webhookId, input.webhookId))
        .orderBy(desc(webhookDeliveries.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(webhookDeliveries)
        .where(eq(webhookDeliveries.webhookId, input.webhookId));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),
});

export const apiKeyRouter = router({
  create: protectedProcedure.input(createApiKeySchema).mutation(async ({ ctx, input }) => {
    const rawKey = `px_${randomBytes(32).toString("hex")}`;
    const keyHash = createHash("sha256").update(rawKey).digest("hex");

    const [apiKey] = await ctx.db
      .insert(apiKeys)
      .values({
        ...input,
        userId: ctx.user.id,
        keyHash,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      })
      .returning();

    return { ...apiKey, key: rawKey };
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select({ id: apiKeys.id, name: apiKeys.name, scopes: apiKeys.scopes, lastUsedAt: apiKeys.lastUsedAt, expiresAt: apiKeys.expiresAt, isActive: apiKeys.isActive, createdAt: apiKeys.createdAt })
      .from(apiKeys)
      .where(eq(apiKeys.userId, ctx.user.id));
    return items;
  }),

  revoke: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await ctx.db.update(apiKeys).set({ isActive: false }).where(and(eq(apiKeys.id, input.id), eq(apiKeys.userId, ctx.user.id)));
    return { success: true };
  }),
});
