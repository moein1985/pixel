import { router, publicProcedure, adminProcedure } from "../context.js";
import { articles, articleCategories, marketReports, marketPrices } from "@pixel/db";
import { eq, and, desc, asc, ilike, sql, or } from "drizzle-orm";
import { createArticleSchema, createMarketReportSchema, addMarketPriceSchema } from "@pixel/shared";
import { z } from "zod";

function slugify(text: string): string {
  return text.trim().replace(/\s+/g, "-").replace(/[^\u0600-\u06FF\w-]/g, "").toLowerCase();
}

export const contentRouter = router({
  // ─── Articles ──────────────────────────────────────────────
  articleCreate: adminProcedure.input(createArticleSchema).mutation(async ({ ctx, input }) => {
    const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
    const [article] = await ctx.db
      .insert(articles)
      .values({ ...input, slug, authorId: ctx.user.id })
      .returning();
    return article;
  }),

  articleUpdate: adminProcedure
    .input(z.object({ id: z.string().uuid(), ...createArticleSchema.shape }).partial())
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db
        .update(articles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(articles.id, id!))
        .returning();
      return updated;
    }),

  articleDelete: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(articles).where(eq(articles.id, input.id));
    return { success: true };
  }),

  articlePublish: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.db
      .update(articles)
      .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
      .where(eq(articles.id, input.id))
      .returning();
    return updated;
  }),

  articleArchive: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const [updated] = await ctx.db
      .update(articles)
      .set({ status: "archived", updatedAt: new Date() })
      .where(eq(articles.id, input.id))
      .returning();
    return updated;
  }),

  articleGet: publicProcedure
    .input(z.object({ id: z.string().uuid().optional(), slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const condition = input.id ? eq(articles.id, input.id) : eq(articles.slug, input.slug!);
      const [article] = await ctx.db.select().from(articles).where(and(condition, eq(articles.status, "published"))).limit(1);
      if (article) {
        await ctx.db.update(articles).set({ viewCount: sql`${articles.viewCount} + 1` }).where(eq(articles.id, article.id));
      }
      return article ?? null;
    }),

  articleList: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      tag: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(articles.status, "published")];
      if (input.category) conditions.push(eq(articles.category, input.category as any));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select({
          id: articles.id,
          title: articles.title,
          slug: articles.slug,
          excerpt: articles.excerpt,
          coverImageUrl: articles.coverImageUrl,
          category: articles.category,
          publishedAt: articles.publishedAt,
          viewCount: articles.viewCount,
          isFeatured: articles.isFeatured,
        })
        .from(articles)
        .where(and(...conditions))
        .orderBy(desc(articles.publishedAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(articles)
        .where(and(...conditions));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  articleSearch: publicProcedure
    .input(z.object({ query: z.string().min(1), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const where = and(
        eq(articles.status, "published"),
        or(ilike(articles.title, `%${input.query}%`), ilike(articles.excerpt, `%${input.query}%`), ilike(articles.content, `%${input.query}%`)),
      );

      const items = await ctx.db
        .select({ id: articles.id, title: articles.title, slug: articles.slug, excerpt: articles.excerpt, coverImageUrl: articles.coverImageUrl, publishedAt: articles.publishedAt })
        .from(articles)
        .where(where)
        .orderBy(desc(articles.publishedAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db.select({ count: sql<number>`count(*)::int` }).from(articles).where(where);
      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  articleGetFeatured: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select()
      .from(articles)
      .where(and(eq(articles.status, "published"), eq(articles.isFeatured, true)))
      .orderBy(desc(articles.publishedAt))
      .limit(5);
    return items;
  }),

  // ─── Article Categories ────────────────────────────────────
  categoryList: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(articleCategories).orderBy(asc(articleCategories.sortOrder));
  }),

  // ─── Market Reports ────────────────────────────────────────
  reportCreate: adminProcedure.input(createMarketReportSchema).mutation(async ({ ctx, input }) => {
    const slug = `${slugify(input.title)}-${Date.now().toString(36)}`;
    const [report] = await ctx.db
      .insert(marketReports)
      .values({ ...input, slug, authorId: ctx.user.id })
      .returning();
    return report;
  }),

  reportUpdate: adminProcedure
    .input(z.object({ id: z.string().uuid(), ...createMarketReportSchema.shape }).partial())
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [updated] = await ctx.db.update(marketReports).set(data).where(eq(marketReports.id, id!)).returning();
      return updated;
    }),

  reportGet: publicProcedure
    .input(z.object({ id: z.string().uuid().optional(), slug: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const condition = input.id ? eq(marketReports.id, input.id) : eq(marketReports.slug, input.slug!);
      const [report] = await ctx.db.select().from(marketReports).where(and(condition, eq(marketReports.status, "published"))).limit(1);
      if (report) {
        await ctx.db.update(marketReports).set({ viewCount: sql`${marketReports.viewCount} + 1` }).where(eq(marketReports.id, report.id));
      }
      return report ?? null;
    }),

  reportList: publicProcedure
    .input(z.object({ type: z.string().optional(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const conditions = [eq(marketReports.status, "published")];
      if (input.type) conditions.push(eq(marketReports.reportType, input.type as any));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select({ id: marketReports.id, title: marketReports.title, slug: marketReports.slug, summary: marketReports.summary, reportType: marketReports.reportType, coverImageUrl: marketReports.coverImageUrl, publishedAt: marketReports.publishedAt })
        .from(marketReports)
        .where(and(...conditions))
        .orderBy(desc(marketReports.publishedAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db.select({ count: sql<number>`count(*)::int` }).from(marketReports).where(and(...conditions));
      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  // ─── Market Prices ─────────────────────────────────────────
  priceAdd: adminProcedure.input(addMarketPriceSchema).mutation(async ({ ctx, input }) => {
    const [price] = await ctx.db
      .insert(marketPrices)
      .values({
        ...input,
        minPrice: String(input.minPrice),
        maxPrice: String(input.maxPrice),
        avgPrice: String(input.avgPrice),
        recordedAt: input.recordedAt,
      })
      .returning();
    return price;
  }),

  priceBatchAdd: adminProcedure
    .input(z.array(addMarketPriceSchema).min(1).max(500))
    .mutation(async ({ ctx, input }) => {
      const values = input.map((p) => ({
        ...p,
        minPrice: String(p.minPrice),
        maxPrice: String(p.maxPrice),
        avgPrice: String(p.avgPrice),
        recordedAt: p.recordedAt,
      }));
      await ctx.db.insert(marketPrices).values(values);
      return { count: values.length };
    }),

  priceList: publicProcedure
    .input(z.object({
      productName: z.string().optional(),
      province: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(20),
    }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.productName) conditions.push(ilike(marketPrices.productName, `%${input.productName}%`));
      if (input.province) conditions.push(eq(marketPrices.province, input.province));
      if (input.from) conditions.push(sql`${marketPrices.recordedAt} >= ${input.from}`);
      if (input.to) conditions.push(sql`${marketPrices.recordedAt} <= ${input.to}`);

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(marketPrices)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(marketPrices.recordedAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(marketPrices)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  priceGetLatest: publicProcedure
    .input(z.object({ productName: z.string().optional(), province: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.productName) conditions.push(ilike(marketPrices.productName, `%${input.productName}%`));
      if (input.province) conditions.push(eq(marketPrices.province, input.province));

      const items = await ctx.db
        .select()
        .from(marketPrices)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(marketPrices.recordedAt))
        .limit(20);
      return items;
    }),

  priceGetTrend: publicProcedure
    .input(z.object({ productName: z.string(), province: z.string().optional(), days: z.number().int().min(1).max(365).default(30) }))
    .query(async ({ ctx, input }) => {
      const conditions = [ilike(marketPrices.productName, `%${input.productName}%`)];
      if (input.province) conditions.push(eq(marketPrices.province, input.province));

      const items = await ctx.db
        .select({
          recordedAt: marketPrices.recordedAt,
          avgPrice: marketPrices.avgPrice,
          minPrice: marketPrices.minPrice,
          maxPrice: marketPrices.maxPrice,
        })
        .from(marketPrices)
        .where(and(...conditions))
        .orderBy(desc(marketPrices.recordedAt))
        .limit(input.days);
      return items.reverse();
    }),
});
