import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pixel.ir";
  const staticRoutes = [
    "",
    "/market",
    "/news",
    "/reports",
    "/networks",
    "/contact",
    "/login",
    "/register",
    "/ai/chat",
    "/ai/price",
    "/rfq/create",
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
