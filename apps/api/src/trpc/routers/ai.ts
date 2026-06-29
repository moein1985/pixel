import { router, publicProcedure, protectedProcedure } from "../context.js";
import { callAI, callAIGet } from "../../services/ai-client.js";
import { z } from "zod";

export const aiRouter = router({
  chat: protectedProcedure
    .input(z.object({ message: z.string().min(1), context: z.any().optional() }))
    .mutation(async ({ ctx, input }) => {
      return callAI("/api/chatbot/message", {
        message: input.message,
        userId: ctx.user.id,
        context: input.context,
      });
    }),

  getSuggestions: protectedProcedure.query(async () => {
    return callAIGet(`/api/chatbot/suggestions?userId=any`);
  }),

  predictPrice: publicProcedure
    .input(z.object({ productName: z.string(), province: z.string().optional(), days: z.number().int().min(1).max(90).default(7) }))
    .query(async ({ input }) => {
      return callAI("/api/price/predict", {
        productName: input.productName,
        province: input.province,
        days: input.days,
      });
    }),

  getPriceTrend: publicProcedure
    .input(z.object({ productName: z.string(), province: z.string().optional(), days: z.number().int().min(1).max(365).default(30) }))
    .query(async ({ input }) => {
      const params = new URLSearchParams({ productName: input.productName, days: String(input.days) });
      if (input.province) params.set("province", input.province);
      return callAIGet(`/api/price/trend?${params}`);
    }),

  classifyImage: protectedProcedure
    .input(z.object({ imageUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const imgResponse = await fetch(input.imageUrl);
      const blob = await imgResponse.blob();
      const formData = new FormData();
      formData.append("file", blob);
      return callAIGet("/api/vision/classify");
    }),

  detectDisease: protectedProcedure
    .input(z.object({ imageUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const imgResponse = await fetch(input.imageUrl);
      const blob = await imgResponse.blob();
      const formData = new FormData();
      formData.append("file", blob);
      return callAIGet("/api/vision/detect-disease");
    }),

  getSupplierRisk: publicProcedure
    .input(z.object({ supplierId: z.string().uuid() }))
    .query(async ({ input }) => {
      return callAIGet(`/api/risk/supplier?supplierId=${input.supplierId}`);
    }),

  recommendSuppliers: protectedProcedure
    .input(z.object({ productName: z.string(), quantity: z.number().optional(), province: z.string().optional() }))
    .mutation(async ({ input }) => {
      return callAI("/api/recommend/suppliers", {
        productName: input.productName,
        quantity: input.quantity,
        province: input.province,
      });
    }),

  recommendProducts: protectedProcedure.query(async ({ ctx }) => {
    return callAIGet(`/api/recommend/products?userId=${ctx.user.id}`);
  }),
});
