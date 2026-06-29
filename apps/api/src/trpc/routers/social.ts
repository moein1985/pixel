import { router, publicProcedure, protectedProcedure, adminProcedure } from "../context.js";
import { farmerNetworks, networkMembers, networkPosts, networkComments, advertisements, inquiries, creditScoreHistory, users } from "@pixel/db";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { createNetworkSchema, createNetworkPostSchema, createNetworkCommentSchema, createAdSchema, createInquirySchema } from "@pixel/shared";
import { z } from "zod";

export const networkRouter = router({
  create: protectedProcedure.input(createNetworkSchema).mutation(async ({ ctx, input }) => {
    const [network] = await ctx.db
      .insert(farmerNetworks)
      .values({ ...input, creatorId: ctx.user.id })
      .returning();

    await ctx.db.insert(networkMembers).values({ networkId: network.id, userId: ctx.user.id, role: "admin" });
    await ctx.db.update(farmerNetworks).set({ memberCount: 1 }).where(eq(farmerNetworks.id, network.id));
    return network;
  }),

  get: publicProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [network] = await ctx.db.select().from(farmerNetworks).where(eq(farmerNetworks.id, input.id)).limit(1);
    return network ?? null;
  }),

  list: publicProcedure
    .input(z.object({ type: z.string().optional(), province: z.string().optional(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.type) conditions.push(eq(farmerNetworks.networkType, input.type as any));
      if (input.province) conditions.push(eq(farmerNetworks.province, input.province));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(farmerNetworks)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(farmerNetworks.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(farmerNetworks)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  join: protectedProcedure.input(z.object({ networkId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const [existing] = await ctx.db
      .select()
      .from(networkMembers)
      .where(and(eq(networkMembers.networkId, input.networkId), eq(networkMembers.userId, ctx.user.id)))
      .limit(1);
    if (existing) return { success: true, alreadyMember: true };

    await ctx.db.insert(networkMembers).values({ networkId: input.networkId, userId: ctx.user.id });
    await ctx.db.update(farmerNetworks).set({ memberCount: sql`${farmerNetworks.memberCount} + 1` }).where(eq(farmerNetworks.id, input.networkId));
    return { success: true, alreadyMember: false };
  }),

  leave: protectedProcedure.input(z.object({ networkId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await ctx.db
      .delete(networkMembers)
      .where(and(eq(networkMembers.networkId, input.networkId), eq(networkMembers.userId, ctx.user.id)));
    await ctx.db.update(farmerNetworks).set({ memberCount: sql`GREATEST(${farmerNetworks.memberCount} - 1, 0)` }).where(eq(farmerNetworks.id, input.networkId));
    return { success: true };
  }),

  getMyNetworks: protectedProcedure.query(async ({ ctx }) => {
    const memberships = await ctx.db
      .select({ networkId: networkMembers.networkId })
      .from(networkMembers)
      .where(eq(networkMembers.userId, ctx.user.id));

    if (memberships.length === 0) return [];

    const networkIds = memberships.map((m) => m.networkId);
    const items = await ctx.db
      .select()
      .from(farmerNetworks)
      .where(sql`${farmerNetworks.id} = ANY(${networkIds})`)
      .orderBy(desc(farmerNetworks.createdAt));
    return items;
  }),

  getPosts: publicProcedure
    .input(z.object({ networkId: z.string().uuid(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select({
          id: networkPosts.id,
          content: networkPosts.content,
          images: networkPosts.images,
          likeCount: networkPosts.likeCount,
          commentCount: networkPosts.commentCount,
          createdAt: networkPosts.createdAt,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorAvatarUrl: users.avatarUrl,
        })
        .from(networkPosts)
        .innerJoin(users, eq(users.id, networkPosts.authorId))
        .where(eq(networkPosts.networkId, input.networkId))
        .orderBy(desc(networkPosts.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(networkPosts)
        .where(eq(networkPosts.networkId, input.networkId));

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  createPost: protectedProcedure.input(createNetworkPostSchema).mutation(async ({ ctx, input }) => {
    const [post] = await ctx.db
      .insert(networkPosts)
      .values({ ...input, authorId: ctx.user.id })
      .returning();
    return post;
  }),

  getComments: publicProcedure
    .input(z.object({ postId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db
        .select({
          id: networkComments.id,
          content: networkComments.content,
          parentId: networkComments.parentId,
          createdAt: networkComments.createdAt,
          authorFirstName: users.firstName,
          authorLastName: users.lastName,
          authorAvatarUrl: users.avatarUrl,
        })
        .from(networkComments)
        .innerJoin(users, eq(users.id, networkComments.authorId))
        .where(eq(networkComments.postId, input.postId))
        .orderBy(desc(networkComments.createdAt));
      return items;
    }),

  createComment: protectedProcedure.input(createNetworkCommentSchema).mutation(async ({ ctx, input }) => {
    const [comment] = await ctx.db
      .insert(networkComments)
      .values({ ...input, authorId: ctx.user.id })
      .returning();

    await ctx.db.update(networkPosts).set({ commentCount: sql`${networkPosts.commentCount} + 1` }).where(eq(networkPosts.id, input.postId));
    return comment;
  }),
});

export const adRouter = router({
  create: adminProcedure.input(createAdSchema).mutation(async ({ ctx, input }) => {
    const [ad] = await ctx.db
      .insert(advertisements)
      .values({ ...input })
      .returning();
    return ad;
  }),

  list: publicProcedure
    .input(z.object({ placement: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const conditions = [
        eq(advertisements.isActive, true),
        sql`${advertisements.startDate} <= ${now}`,
        sql`${advertisements.endDate} >= ${now}`,
      ];
      if (input.placement) conditions.push(eq(advertisements.placement, input.placement as any));

      const items = await ctx.db
        .select()
        .from(advertisements)
        .where(and(...conditions))
        .orderBy(desc(advertisements.createdAt));
      return items;
    }),

  click: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await ctx.db.update(advertisements).set({ clicks: sql`${advertisements.clicks} + 1` }).where(eq(advertisements.id, input.id));
    return { success: true };
  }),

  impression: publicProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await ctx.db.update(advertisements).set({ impressions: sql`${advertisements.impressions} + 1` }).where(eq(advertisements.id, input.id));
    return { success: true };
  }),

  delete: adminProcedure.input(z.object({ id: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(advertisements).where(eq(advertisements.id, input.id));
    return { success: true };
  }),
});

export const inquiryRouter = router({
  create: publicProcedure.input(createInquirySchema).mutation(async ({ ctx, input }) => {
    const [inquiry] = await ctx.db.insert(inquiries).values(input).returning();
    return inquiry;
  }),

  list: adminProcedure
    .input(z.object({ status: z.string().optional(), type: z.string().optional(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(20) }))
    .query(async ({ ctx, input }) => {
      const conditions = [];
      if (input.status) conditions.push(eq(inquiries.status, input.status as any));
      if (input.type) conditions.push(eq(inquiries.type, input.type as any));

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(inquiries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(inquiries.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(inquiries)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      return { items, total: count, page: input.page, pageSize: input.pageSize };
    }),

  get: adminProcedure.input(z.object({ id: z.string().uuid() })).query(async ({ ctx, input }) => {
    const [inquiry] = await ctx.db.select().from(inquiries).where(eq(inquiries.id, input.id)).limit(1);
    return inquiry ?? null;
  }),

  respond: adminProcedure
    .input(z.object({ id: z.string().uuid(), response: z.string(), status: z.enum(["reviewed", "responded", "closed"]).default("responded") }))
    .mutation(async ({ ctx, input }) => {
      const [updated] = await ctx.db
        .update(inquiries)
        .set({ response: input.response, status: input.status, assignedTo: ctx.user.id, updatedAt: new Date() })
        .where(eq(inquiries.id, input.id))
        .returning();
      return updated;
    }),
});

export const rankingRouter = router({
  getCreditHistory: protectedProcedure
    .input(z.object({ userId: z.string().uuid().optional() }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId ?? ctx.user.id;
      const items = await ctx.db
        .select()
        .from(creditScoreHistory)
        .where(eq(creditScoreHistory.userId, userId))
        .orderBy(desc(creditScoreHistory.createdAt))
        .limit(50);
      return items;
    }),

  getTopSuppliers: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(50).default(10) }))
    .query(async ({ ctx }) => {
      const items = await ctx.db
        .select()
        .from(creditScoreHistory)
        .orderBy(desc(creditScoreHistory.score))
        .limit(10);
      return items;
    }),
});
