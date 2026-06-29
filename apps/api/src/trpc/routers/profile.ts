import { router, publicProcedure, protectedProcedure, roleProcedure } from "../context.js";
import { farmers, companies, suppliers } from "@pixel/db";
import { eq } from "drizzle-orm";
import { farmerProfileSchema, companyProfileSchema, supplierProfileSchema } from "@pixel/shared";
import { z } from "zod";

// ─── Farmer Router ──────────────────────────────────────────

export const farmerRouter = router({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(farmers)
      .where(eq(farmers.userId, ctx.user.id))
      .limit(1);
    return profile ?? null;
  }),

  updateMyProfile: protectedProcedure
    .input(farmerProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(farmers)
        .where(eq(farmers.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        const [updated] = await ctx.db
          .update(farmers)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(farmers.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await ctx.db
        .insert(farmers)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return created;
    }),

  getProfile: publicProcedure
    .input(z.object({ farmerId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [profile] = await ctx.db
        .select()
        .from(farmers)
        .where(eq(farmers.id, input.farmerId))
        .limit(1);
      return profile ?? null;
    }),
});

// ─── Company Router ─────────────────────────────────────────

export const companyRouter = router({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(companies)
      .where(eq(companies.userId, ctx.user.id))
      .limit(1);
    return profile ?? null;
  }),

  updateMyProfile: protectedProcedure
    .input(companyProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        const [updated] = await ctx.db
          .update(companies)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(companies.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await ctx.db
        .insert(companies)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return created;
    }),

  getProfile: publicProcedure
    .input(z.object({ companyId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [profile] = await ctx.db
        .select()
        .from(companies)
        .where(eq(companies.id, input.companyId))
        .limit(1);
      return profile ?? null;
    }),
});

// ─── Supplier Router ────────────────────────────────────────

export const supplierRouter = router({
  getMyProfile: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, ctx.user.id))
      .limit(1);
    return profile ?? null;
  }),

  updateMyProfile: protectedProcedure
    .input(supplierProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const [existing] = await ctx.db
        .select()
        .from(suppliers)
        .where(eq(suppliers.userId, ctx.user.id))
        .limit(1);

      if (existing) {
        const [updated] = await ctx.db
          .update(suppliers)
          .set({ ...input, updatedAt: new Date() })
          .where(eq(suppliers.id, existing.id))
          .returning();
        return updated;
      }

      const [created] = await ctx.db
        .insert(suppliers)
        .values({ userId: ctx.user.id, ...input })
        .returning();
      return created;
    }),

  getProfile: publicProcedure
    .input(z.object({ supplierId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const [profile] = await ctx.db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, input.supplierId))
        .limit(1);
      return profile ?? null;
    }),
});
