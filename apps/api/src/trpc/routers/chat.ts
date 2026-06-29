import { router, protectedProcedure } from "../context.js";
import { conversations, messages, users } from "@pixel/db";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { sendMessageSchema, startConversationSchema } from "@pixel/shared";
import { z } from "zod";

export const chatRouter = router({
  listConversations: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select({
        id: conversations.id,
        participant1Id: conversations.participant1Id,
        participant2Id: conversations.participant2Id,
        lastMessageAt: conversations.lastMessageAt,
        createdAt: conversations.createdAt,
      })
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, ctx.user.id),
          eq(conversations.participant2Id, ctx.user.id),
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    const enriched = await Promise.all(
      items.map(async (conv) => {
        const otherUserId = conv.participant1Id === ctx.user.id ? conv.participant2Id : conv.participant1Id;
        const [otherUser] = await ctx.db
          .select({ firstName: users.firstName, lastName: users.lastName, avatarUrl: users.avatarUrl })
          .from(users)
          .where(eq(users.id, otherUserId))
          .limit(1);

        const [lastMsg] = await ctx.db
          .select({ content: messages.content, createdAt: messages.createdAt })
          .from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        const [{ unreadCount }] = await ctx.db
          .select({ unreadCount: sql<number>`count(*)::int` })
          .from(messages)
          .where(and(
            eq(messages.conversationId, conv.id),
            eq(messages.senderId, otherUserId),
            eq(messages.isRead, false),
          ));

        return { ...conv, otherUser, lastMessage: lastMsg, unreadCount };
      })
    );
    return enriched;
  }),

  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.string().uuid(), page: z.number().int().min(1).default(1), pageSize: z.number().int().min(1).max(100).default(50) }))
    .query(async ({ ctx, input }) => {
      const [conv] = await ctx.db.select().from(conversations).where(eq(conversations.id, input.conversationId)).limit(1);
      if (!conv) throw new Error("مکالمه یافت نشد");
      if (conv.participant1Id !== ctx.user.id && conv.participant2Id !== ctx.user.id) throw new Error("دسترسی غیرمجاز");

      const offset = (input.page - 1) * input.pageSize;
      const items = await ctx.db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(desc(messages.createdAt))
        .limit(input.pageSize)
        .offset(offset);

      const [{ count }] = await ctx.db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId));

      return { items: items.reverse(), total: count, page: input.page, pageSize: input.pageSize };
    }),

  sendMessage: protectedProcedure.input(sendMessageSchema).mutation(async ({ ctx, input }) => {
    const [conv] = await ctx.db.select().from(conversations).where(eq(conversations.id, input.conversationId)).limit(1);
    if (!conv) throw new Error("مکالمه یافت نشد");
    if (conv.participant1Id !== ctx.user.id && conv.participant2Id !== ctx.user.id) throw new Error("دسترسی غیرمجاز");

    const [msg] = await ctx.db
      .insert(messages)
      .values({
        conversationId: input.conversationId,
        senderId: ctx.user.id,
        content: input.content,
        attachments: input.attachments,
      })
      .returning();

    await ctx.db.update(conversations).set({ lastMessageAt: new Date() }).where(eq(conversations.id, input.conversationId));
    return msg;
  }),

  markAsRead: protectedProcedure.input(z.object({ conversationId: z.string().uuid() })).mutation(async ({ ctx, input }) => {
    const [conv] = await ctx.db.select().from(conversations).where(eq(conversations.id, input.conversationId)).limit(1);
    if (!conv) throw new Error("مکالمه یافت نشد");
    if (conv.participant1Id !== ctx.user.id && conv.participant2Id !== ctx.user.id) throw new Error("دسترسی غیرمجاز");

    const otherUserId = conv.participant1Id === ctx.user.id ? conv.participant2Id : conv.participant1Id;
    await ctx.db
      .update(messages)
      .set({ isRead: true })
      .where(and(eq(messages.conversationId, input.conversationId), eq(messages.senderId, otherUserId)));
    return { success: true };
  }),

  startConversation: protectedProcedure.input(startConversationSchema).mutation(async ({ ctx, input }) => {
    const [existing] = await ctx.db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.participant1Id, ctx.user.id), eq(conversations.participant2Id, input.userId)),
          and(eq(conversations.participant1Id, input.userId), eq(conversations.participant2Id, ctx.user.id)),
        )
      )
      .limit(1);

    if (existing) return existing;

    const [conv] = await ctx.db
      .insert(conversations)
      .values({
        participant1Id: ctx.user.id,
        participant2Id: input.userId,
        relatedProductId: input.productId,
        relatedOrderId: input.orderId,
      })
      .returning();
    return conv;
  }),
});
