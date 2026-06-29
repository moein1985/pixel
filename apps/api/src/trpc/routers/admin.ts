import { z } from "zod";
import { router, adminProcedure } from "../context.js";
import { users, farmers, companies, suppliers, categories, documents, provinces, counties } from "@pixel/db";
import { eq, and, ilike, desc, asc, sql, or, isNotNull, count } from "drizzle-orm";

export const adminRouter = router({
  // ─── Stats ──────────────────────────────────────────────────
  getStats: adminProcedure.query(async ({ ctx }) => {
    const [userCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    const [farmerCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(farmers);

    const [supplierCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(suppliers);

    const [companyCount] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(companies);

    const [verifiedFarmers] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(farmers)
      .where(isNotNull(farmers.verifiedAt));

    const [verifiedSuppliers] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(suppliers)
      .where(isNotNull(suppliers.verifiedAt));

    const [verifiedCompanies] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(companies)
      .where(isNotNull(companies.verifiedAt));

    const roleCounts = await ctx.db
      .select({
        role: users.role,
        count: sql<number>`count(*)::int`,
      })
      .from(users)
      .groupBy(users.role);

    return {
      totalUsers: userCount.count,
      totalFarmers: farmerCount.count,
      totalSuppliers: supplierCount.count,
      totalCompanies: companyCount.count,
      verifiedFarmers: verifiedFarmers.count,
      verifiedSuppliers: verifiedSuppliers.count,
      verifiedCompanies: verifiedCompanies.count,
      pendingVerifications:
        farmerCount.count - verifiedFarmers.count +
        supplierCount.count - verifiedSuppliers.count +
        companyCount.count - verifiedCompanies.count,
      usersByRole: roleCounts.reduce((acc, r) => {
        acc[r.role] = r.count;
        return acc;
      }, {} as Record<string, number>),
    };
  }),

  // ─── User Management ────────────────────────────────────────
  listUsers: adminProcedure
    .input(z.object({
      role: z.enum(["admin", "farmer", "supplier", "company", "moderator"]).optional(),
      status: z.enum(["pending", "active", "suspended", "rejected"]).optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.role) conditions.push(eq(users.role, input.role));
      if (input.status) conditions.push(eq(users.status, input.status));

      const offset = (input.page - 1) * input.pageSize;

      const items = await ctx.db
        .select({
          id: users.id,
          phone: users.phone,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          status: users.status,
          avatarUrl: users.avatarUrl,
          lastLoginAt: users.lastLoginAt,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(users.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count: total }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(users)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  updateUserStatus: adminProcedure
    .input(z.object({
      userId: z.string().uuid(),
      status: z.enum(["pending", "active", "suspended", "rejected"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(users)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(users.id, input.userId))
        .returning();

      if (!updated) {
        return { success: false as const, message: "کاربر یافت نشد" };
      }

      return { success: true as const, user: updated };
    }),

  // ─── Profile Verification ───────────────────────────────────
  verifyProfile: adminProcedure
    .input(z.object({
      profileType: z.enum(["farmer", "supplier", "company"]),
      profileId: z.string().uuid(),
      verified: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { profileType, profileId, verified } = input;
      const verifiedAt = verified ? new Date() : null;

      if (profileType === "farmer") {
        await ctx.db
          .update(farmers)
          .set({ verifiedAt })
          .where(eq(farmers.id, profileId));
      } else if (profileType === "supplier") {
        await ctx.db
          .update(suppliers)
          .set({ verifiedAt })
          .where(eq(suppliers.id, profileId));
      } else {
        await ctx.db
          .update(companies)
          .set({ verifiedAt })
          .where(eq(companies.id, profileId));
      }

      return { success: true as const };
    }),

  // ─── Category Management ────────────────────────────────────
  listCategories: adminProcedure
    .input(z.object({
      type: z.enum(["product", "input", "equipment", "service"]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input?.type) conditions.push(eq(categories.type, input.type));

      const items = await ctx.db
        .select()
        .from(categories)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(categories.sortOrder), asc(categories.name));

      return items;
    }),

  createCategory: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      parentId: z.number().int().optional(),
      type: z.enum(["product", "input", "equipment", "service"]),
      icon: z.string().max(50).optional(),
      slug: z.string().min(1).max(120),
      sortOrder: z.number().int().default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(categories)
        .values({
          name: input.name,
          parentId: input.parentId,
          type: input.type,
          icon: input.icon,
          slug: input.slug,
          sortOrder: input.sortOrder,
        })
        .returning();

      return created;
    }),

  updateCategory: adminProcedure
    .input(z.object({
      id: z.number().int(),
      name: z.string().min(1).max(100).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
      icon: z.string().max(50).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const updateData: Record<string, unknown> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;
      if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
      if (input.icon !== undefined) updateData.icon = input.icon;

      const [updated] = await ctx.db
        .update(categories)
        .set(updateData)
        .where(eq(categories.id, input.id))
        .returning();

      return updated ?? null;
    }),

  // ─── Document Management ────────────────────────────────────
  listDocuments: adminProcedure
    .input(z.object({
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.pageSize;

      const items = await ctx.db
        .select()
        .from(documents)
        .orderBy(desc(documents.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count: total }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(documents);

      return { items, total, page: input.page, pageSize: input.pageSize };
    }),

  createDocument: adminProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      category: z.string().max(50).optional(),
      source: z.string().max(100).optional(),
      fileUrl: z.string().optional(),
      summary: z.string().optional(),
      publishDate: z.string().datetime().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(documents)
        .values({
          title: input.title,
          category: input.category,
          source: input.source,
          fileUrl: input.fileUrl,
          summary: input.summary,
          publishDate: input.publishDate ? new Date(input.publishDate) : null,
        })
        .returning();

      return created;
    }),

  // ─── Location Management ────────────────────────────────────
  listProvinces: adminProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(provinces).orderBy(asc(provinces.name));
  }),

  createProvince: adminProcedure
    .input(z.object({ name: z.string().min(1).max(50) }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(provinces)
        .values({ name: input.name })
        .returning();
      return created;
    }),

  listCounties: adminProcedure
    .input(z.object({ provinceId: z.number().int().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.provinceId) conditions.push(eq(counties.provinceId, input.provinceId));

      const items = await ctx.db
        .select()
        .from(counties)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(asc(counties.name));

      return items;
    }),

  createCounty: adminProcedure
    .input(z.object({
      provinceId: z.number().int(),
      name: z.string().min(1).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(counties)
        .values({
          provinceId: input.provinceId,
          name: input.name,
        })
        .returning();
      return created;
    }),
});
