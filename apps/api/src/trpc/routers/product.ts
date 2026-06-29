import { router, publicProcedure, protectedProcedure, roleProcedure } from "../context.js";
import { products, productPriceHistory, suppliers, categories } from "@pixel/db";
import { eq, ilike, and, desc, asc, sql, or, gte, lte, inArray } from "drizzle-orm";
import { createProductSchema, paginationSchema } from "@pixel/shared";
import { z } from "zod";

function slugify(text: string): string {
  return text.trim().replace(/\s+/g, "-").replace(/[^\u0600-\u06FF\w-]/g, "").toLowerCase();
}

export const productRouter = router({
  create: roleProcedure(["supplier"]).mutation(async ({ ctx, input }) => {
    const body = createProductSchema.parse(input);
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) throw new Error("پروفایل تأمین‌کننده یافت نشد");

    const slug = `${slugify(body.name)}-${Date.now().toString(36)}`;
    const [product] = await ctx.db
      .insert(products)
      .values({
        ...body,
        pricePerUnit: body.pricePerUnit ? String(body.pricePerUnit) : undefined,
        minOrderQuantity: body.minOrderQuantity ? String(body.minOrderQuantity) : undefined,
        availableQuantity: body.availableQuantity ? String(body.availableQuantity) : undefined,
        supplierId: supplier.id,
        slug,
      })
      .returning();
    return product;
  }),

  update: roleProcedure(["supplier"]).mutation(async ({ ctx, input }) => {
    const body = z.object({ id: z.string().uuid(), ...createProductSchema.shape }).partial().parse(input);
    const { id, ...data } = body;
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) throw new Error("پروفایل تأمین‌کننده یافت نشد");

    const [updated] = await ctx.db
      .update(products)
      .set({
        ...data,
        pricePerUnit: data.pricePerUnit !== undefined ? (data.pricePerUnit ? String(data.pricePerUnit) : null) : undefined,
        minOrderQuantity: data.minOrderQuantity !== undefined ? (data.minOrderQuantity ? String(data.minOrderQuantity) : null) : undefined,
        availableQuantity: data.availableQuantity !== undefined ? (data.availableQuantity ? String(data.availableQuantity) : null) : undefined,
        updatedAt: new Date(),
      })
      .where(and(eq(products.id, id!), eq(products.supplierId, supplier.id)))
      .returning();
    return updated;
  }),

  delete: roleProcedure(["supplier"]).mutation(async ({ ctx, input }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(input);
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) throw new Error("پروفایل تأمین‌کننده یافت نشد");

    await ctx.db.delete(products).where(and(eq(products.id, id), eq(products.supplierId, supplier.id)));
    return { success: true };
  }),

  getMyProducts: roleProcedure(["supplier"]).query(async ({ ctx, input }) => {
    const { page, pageSize } = paginationSchema.parse(input ?? {});
    const [supplier] = await ctx.db.select().from(suppliers).where(eq(suppliers.userId, ctx.user.id)).limit(1);
    if (!supplier) return { items: [], total: 0, page, pageSize };

    const offset = (page - 1) * pageSize;
    const items = await ctx.db
      .select()
      .from(products)
      .where(eq(products.supplierId, supplier.id))
      .orderBy(desc(products.createdAt))
      .limit(pageSize)
      .offset(offset);

    const [{ count }] = await ctx.db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.supplierId, supplier.id));

    return { items, total: count, page, pageSize };
  }),

  get: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [product] = await ctx.db
      .select({
        id: products.id,
        supplierId: products.supplierId,
        categoryId: products.categoryId,
        name: products.name,
        slug: products.slug,
        description: products.description,
        unit: products.unit,
        pricePerUnit: products.pricePerUnit,
        currency: products.currency,
        minOrderQuantity: products.minOrderQuantity,
        availableQuantity: products.availableQuantity,
        stockStatus: products.stockStatus,
        images: products.images,
        specifications: products.specifications,
        origin: products.origin,
        brand: products.brand,
        certifications: products.certifications,
        isActive: products.isActive,
        isVerified: products.isVerified,
        viewCount: products.viewCount,
        rating: products.rating,
        createdAt: products.createdAt,
        supplierName: suppliers.supplierName,
        supplierProvince: suppliers.province,
        supplierLogoUrl: suppliers.logoUrl,
        categoryName: categories.name,
      })
      .from(products)
      .innerJoin(suppliers, eq(suppliers.id, products.supplierId))
      .leftJoin(categories, eq(categories.id, products.categoryId))
      .where(eq(products.id, input.id))
      .limit(1);

    if (product) {
      await ctx.db.update(products).set({ viewCount: sql`${products.viewCount} + 1` }).where(eq(products.id, input.id));
    }
    return product ?? null;
  }),

  list: publicProcedure
    .input(z.object({
      categoryId: z.number().int().optional(),
      supplierId: z.string().uuid().optional(),
      province: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      sort: z.enum(["newest", "price_asc", "price_desc", "popular", "rating"]).default("newest"),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(products.isActive, true)];
      if (input.categoryId) conditions.push(eq(products.categoryId, input.categoryId));
      if (input.supplierId) conditions.push(eq(products.supplierId, input.supplierId));
      if (input.minPrice) conditions.push(gte(products.pricePerUnit, input.minPrice.toString()));
      if (input.maxPrice) conditions.push(lte(products.pricePerUnit, input.maxPrice.toString()));
      if (input.province) conditions.push(eq(suppliers.province, input.province));

      const offset = (input.page - 1) * input.pageSize;
      const orderBy =
        input.sort === "price_asc" ? asc(products.pricePerUnit) :
        input.sort === "price_desc" ? desc(products.pricePerUnit) :
        input.sort === "popular" ? desc(products.viewCount) :
        input.sort === "rating" ? desc(products.rating) :
        desc(products.createdAt);

      const items = await ctx.db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          pricePerUnit: products.pricePerUnit,
          unit: products.unit,
          stockStatus: products.stockStatus,
          images: products.images,
          rating: products.rating,
          viewCount: products.viewCount,
          brand: products.brand,
          supplierName: suppliers.supplierName,
          supplierProvince: suppliers.province,
        })
        .from(products)
        .innerJoin(suppliers, eq(suppliers.id, products.supplierId))
        .where(and(...conditions))
        .orderBy(orderBy)
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .innerJoin(suppliers, eq(suppliers.id, products.supplierId))
        .where(and(...conditions));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  search: publicProcedure
    .input(z.object({ query: z.string().min(1), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const where = and(
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${input.query}%`),
          ilike(products.description, `%${input.query}%`),
          ilike(products.brand, `%${input.query}%`),
        ),
      );

      const items = await ctx.db
        .select({
          id: products.id,
          name: products.name,
          slug: products.slug,
          pricePerUnit: products.pricePerUnit,
          unit: products.unit,
          images: products.images,
          rating: products.rating,
          supplierName: suppliers.supplierName,
        })
        .from(products)
        .innerJoin(suppliers, eq(suppliers.id, products.supplierId))
        .where(where)
        .orderBy(desc(products.rating))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .innerJoin(suppliers, eq(suppliers.id, products.supplierId))
        .where(where);

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  compare: publicProcedure
    .input(z.object({ productIds: z.array(z.string().uuid()).min(2).max(4) }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select({
          id: products.id,
          name: products.name,
          pricePerUnit: products.pricePerUnit,
          unit: products.unit,
          stockStatus: products.stockStatus,
          specifications: products.specifications,
          brand: products.brand,
          certifications: products.certifications,
          rating: products.rating,
          supplierName: suppliers.supplierName,
        })
        .from(products)
        .innerJoin(suppliers, eq(suppliers.id, products.supplierId))
        .where(inArray(products.id, input.productIds));
      return items;
    }),

  getPriceHistory: publicProcedure
    .input(z.object({ productId: z.string().uuid(), from: z.string().optional(), to: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(productPriceHistory.productId, input.productId)];
      if (input.from) conditions.push(gte(productPriceHistory.recordedAt, new Date(input.from)));
      if (input.to) conditions.push(lte(productPriceHistory.recordedAt, new Date(input.to)));

      const items = await ctx.db
        .select()
        .from(productPriceHistory)
        .where(and(...conditions))
        .orderBy(desc(productPriceHistory.recordedAt))
        .limit(100);
      return items;
    }),
});
