import { generateOpenApiDocument } from "trpc-openapi";
import type { AppRouter } from "./router.js";
import { appRouter } from "./router.js";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Pixel API",
  version: "1.0.0",
  description: "پلتفرم ملی تحول دیجیتال در حوزه کشاورزی ایران — REST API",
  baseUrl: process.env.API_BASE_URL ?? "http://localhost:4000/api",
  docsUrl: "https://pixel.ir/docs",
  tags: [
    "auth",
    "farmer",
    "company",
    "supplier",
    "admin",
    "product",
    "rfq",
    "order",
    "chat",
    "review",
    "favorite",
    "content",
    "network",
    "ad",
    "inquiry",
    "ranking",
    "ai",
    "shipment",
    "webhook",
    "apiKey",
  ],
});

export type { AppRouter };
