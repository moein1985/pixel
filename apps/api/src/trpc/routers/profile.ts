import { router, publicProcedure, protectedProcedure, roleProcedure } from "../context.js";
import { farmers, companies, suppliers, users } from "@pixel/db";
import { eq, ilike, and, desc, asc, sql, or } from "drizzle-orm";
import { farmerProfileSchema, companyProfileSchema, supplierProfileSchema, paginationSchema, searchSchema } from "@pixel/shared";
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
        .select({
          id: farmers.id,
          userId: farmers.userId,
          farmType: farmers.farmType,
          province: farmers.province,
          county: farmers.county,
          village: farmers.village,
          totalAreaHectares: farmers.totalAreaHectares,
          mainCrops: farmers.mainCrops,
          experienceYears: farmers.experienceYears,
          certifications: farmers.certifications,
          bio: farmers.bio,
          verifiedAt: farmers.verifiedAt,
          creditScore: farmers.creditScore,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        })
        .from(farmers)
        .innerJoin(users, eq(users.id, farmers.userId))
        .where(eq(farmers.id, input.farmerId))
        .limit(1);
      return profile ?? null;
    }),

  list: publicProcedure
    .input(z.object({
      province: z.string().optional(),
      farmType: z.enum(["dryland", "irrigated", "greenhouse", "orchard", "livestock", "poultry"]).optional(),
      crop: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
      sort: z.enum(["newest", "credit", "name"]).default("newest"),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.province) conditions.push(eq(farmers.province, input.province));
      if (input.farmType) conditions.push(eq(farmers.farmType, input.farmType));

      const offset = (input.page - 1) * input.pageSize;

      const orderBy =
        input.sort === "credit" ? desc(farmers.creditScore) :
        input.sort === "name" ? asc(users.firstName) :
        desc(farmers.createdAt);

      const items = await ctx.db
        .select({
          id: farmers.id,
          farmType: farmers.farmType,
          province: farmers.province,
          county: farmers.county,
          mainCrops: farmers.mainCrops,
          creditScore: farmers.creditScore,
          verifiedAt: farmers.verifiedAt,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        })
        .from(farmers)
        .innerJoin(users, eq(users.id, farmers.userId))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy)
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(farmers)
        .innerJoin(users, eq(users.id, farmers.userId))
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  search: publicProcedure
    .input(searchSchema)
    .query(async ({ ctx, input }) => {
      const { query, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const items = await ctx.db
        .select({
          id: farmers.id,
          farmType: farmers.farmType,
          province: farmers.province,
          county: farmers.county,
          mainCrops: farmers.mainCrops,
          creditScore: farmers.creditScore,
          verifiedAt: farmers.verifiedAt,
          firstName: users.firstName,
          lastName: users.lastName,
          avatarUrl: users.avatarUrl,
        })
        .from(farmers)
        .innerJoin(users, eq(users.id, farmers.userId))
        .where(
          or(
            ilike(users.firstName, `%${query}%`),
            ilike(users.lastName, `%${query}%`),
            ilike(farmers.province, `%${query}%`),
            ilike(farmers.county, `%${query}%`)
          )
        )
        .orderBy(desc(farmers.creditScore))
        .limit(pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(farmers)
        .innerJoin(users, eq(users.id, farmers.userId))
        .where(
          or(
            ilike(users.firstName, `%${query}%`),
            ilike(users.lastName, `%${query}%`),
            ilike(farmers.province, `%${query}%`),
            ilike(farmers.county, `%${query}%`)
          )
        );

      return { items, total: count, page, pageSize };
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
        .select({
          id: companies.id,
          userId: companies.userId,
          companyName: companies.companyName,
          companyType: companies.companyType,
          province: companies.province,
          county: companies.county,
          address: companies.address,
          phone: companies.phone,
          productionLines: companies.productionLines,
          certifications: companies.certifications,
          importExportHistory: companies.importExportHistory,
          verifiedAt: companies.verifiedAt,
          creditScore: companies.creditScore,
          logoUrl: companies.logoUrl,
          description: companies.description,
        })
        .from(companies)
        .where(eq(companies.id, input.companyId))
        .limit(1);
      return profile ?? null;
    }),

  list: publicProcedure
    .input(z.object({
      province: z.string().optional(),
      type: z.enum(["cooperative", "private", "industrial", "governmental"]).optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
      sort: z.enum(["newest", "credit", "name"]).default("newest"),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.province) conditions.push(eq(companies.province, input.province));
      if (input.type) conditions.push(eq(companies.companyType, input.type));

      const offset = (input.page - 1) * input.pageSize;
      const orderBy =
        input.sort === "credit" ? desc(companies.creditScore) :
        input.sort === "name" ? asc(companies.companyName) :
        desc(companies.createdAt);

      const items = await ctx.db
        .select({
          id: companies.id,
          companyName: companies.companyName,
          companyType: companies.companyType,
          province: companies.province,
          county: companies.county,
          creditScore: companies.creditScore,
          verifiedAt: companies.verifiedAt,
          logoUrl: companies.logoUrl,
        })
        .from(companies)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy)
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(companies)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  search: publicProcedure
    .input(searchSchema)
    .query(async ({ ctx, input }) => {
      const { query, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const items = await ctx.db
        .select({
          id: companies.id,
          companyName: companies.companyName,
          companyType: companies.companyType,
          province: companies.province,
          creditScore: companies.creditScore,
          verifiedAt: companies.verifiedAt,
          logoUrl: companies.logoUrl,
        })
        .from(companies)
        .where(
          or(
            ilike(companies.companyName, `%${query}%`),
            ilike(companies.province, `%${query}%`),
            ilike(companies.description, `%${query}%`)
          )
        )
        .orderBy(desc(companies.creditScore))
        .limit(pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(companies)
        .where(
          or(
            ilike(companies.companyName, `%${query}%`),
            ilike(companies.province, `%${query}%`),
            ilike(companies.description, `%${query}%`)
          )
        );

      return { items, total: count, page, pageSize };
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
        .select({
          id: suppliers.id,
          userId: suppliers.userId,
          supplierName: suppliers.supplierName,
          province: suppliers.province,
          county: suppliers.county,
          address: suppliers.address,
          phone: suppliers.phone,
          supplyCategories: suppliers.supplyCategories,
          capacityUnit: suppliers.capacityUnit,
          verifiedAt: suppliers.verifiedAt,
          creditScore: suppliers.creditScore,
          rating: suppliers.rating,
          logoUrl: suppliers.logoUrl,
          description: suppliers.description,
        })
        .from(suppliers)
        .where(eq(suppliers.id, input.supplierId))
        .limit(1);
      return profile ?? null;
    }),

  list: publicProcedure
    .input(z.object({
      province: z.string().optional(),
      category: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
      sort: z.enum(["newest", "credit", "rating", "name"]).default("newest"),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.province) conditions.push(eq(suppliers.province, input.province));

      const offset = (input.page - 1) * input.pageSize;
      const orderBy =
        input.sort === "credit" ? desc(suppliers.creditScore) :
        input.sort === "rating" ? desc(suppliers.rating) :
        input.sort === "name" ? asc(suppliers.supplierName) :
        desc(suppliers.createdAt);

      const items = await ctx.db
        .select({
          id: suppliers.id,
          supplierName: suppliers.supplierName,
          province: suppliers.province,
          county: suppliers.county,
          supplyCategories: suppliers.supplyCategories,
          creditScore: suppliers.creditScore,
          rating: suppliers.rating,
          verifiedAt: suppliers.verifiedAt,
          logoUrl: suppliers.logoUrl,
        })
        .from(suppliers)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderBy)
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(suppliers)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  search: publicProcedure
    .input(searchSchema)
    .query(async ({ ctx, input }) => {
      const { query, page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const items = await ctx.db
        .select({
          id: suppliers.id,
          supplierName: suppliers.supplierName,
          province: suppliers.province,
          supplyCategories: suppliers.supplyCategories,
          creditScore: suppliers.creditScore,
          rating: suppliers.rating,
          verifiedAt: suppliers.verifiedAt,
          logoUrl: suppliers.logoUrl,
        })
        .from(suppliers)
        .where(
          or(
            ilike(suppliers.supplierName, `%${query}%`),
            ilike(suppliers.province, `%${query}%`),
            ilike(suppliers.description, `%${query}%`)
          )
        )
        .orderBy(desc(suppliers.creditScore))
        .limit(pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(suppliers)
        .where(
          or(
            ilike(suppliers.supplierName, `%${query}%`),
            ilike(suppliers.province, `%${query}%`),
            ilike(suppliers.description, `%${query}%`)
          )
        );

      return { items, total: count, page, pageSize };
    }),
});
