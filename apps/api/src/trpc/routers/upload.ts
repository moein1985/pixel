import { z } from "zod";
import { router, protectedProcedure } from "../context.js";
import { uploadFile, getSignedUrl, parseObjectPath } from "../../lib/minio.js";
import { users, farmers, companies, suppliers } from "@pixel/db";
import { eq } from "drizzle-orm";

export const uploadRouter = router({
  avatar: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      contentType: z.string(),
      base64: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ext = input.fileName.split(".").pop() ?? "jpg";
      const objectName = `${ctx.user.id}/avatar-${Date.now()}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");

      const path = await uploadFile("avatars", objectName, buffer, input.contentType);
      const signedUrl = await getSignedUrl("avatars", objectName);

      await ctx.db
        .update(users)
        .set({ avatarUrl: signedUrl, updatedAt: new Date() })
        .where(eq(users.id, ctx.user.id));

      return { url: signedUrl, path };
    }),

  logo: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      contentType: z.string(),
      base64: z.string(),
      profileType: z.enum(["company", "supplier"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const ext = input.fileName.split(".").pop() ?? "png";
      const objectName = `${ctx.user.id}/logo-${Date.now()}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");

      const path = await uploadFile("logos", objectName, buffer, input.contentType);
      const signedUrl = await getSignedUrl("logos", objectName);

      if (input.profileType === "company") {
        await ctx.db
          .update(companies)
          .set({ logoUrl: signedUrl, updatedAt: new Date() })
          .where(eq(companies.userId, ctx.user.id));
      } else {
        await ctx.db
          .update(suppliers)
          .set({ logoUrl: signedUrl, updatedAt: new Date() })
          .where(eq(suppliers.userId, ctx.user.id));
      }

      return { url: signedUrl, path };
    }),

  document: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      contentType: z.string(),
      base64: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const ext = input.fileName.split(".").pop() ?? "pdf";
      const objectName = `${ctx.user.id}/doc-${Date.now()}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");

      const path = await uploadFile("documents", objectName, buffer, input.contentType);
      const signedUrl = await getSignedUrl("documents", objectName);

      return { url: signedUrl, path };
    }),

  image: protectedProcedure
    .input(z.object({
      fileName: z.string(),
      contentType: z.string(),
      base64: z.string(),
      type: z.enum(["product", "general"]).default("general"),
    }))
    .mutation(async ({ ctx, input }) => {
      const ext = input.fileName.split(".").pop() ?? "jpg";
      const objectName = `${ctx.user.id}/${input.type}-${Date.now()}.${ext}`;
      const buffer = Buffer.from(input.base64, "base64");

      const path = await uploadFile("images", objectName, buffer, input.contentType);
      const signedUrl = await getSignedUrl("images", objectName);

      return { url: signedUrl, path };
    }),
});
