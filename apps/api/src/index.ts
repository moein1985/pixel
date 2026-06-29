import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { appRouter, type AppRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";

const PORT = Number(process.env.API_PORT ?? 4000);

const server = Fastify({
  maxParamLength: 5000,
});

async function start() {
  // CORS
  await server.register(cors, {
    origin: process.env.NODE_ENV === "production" ? false : true,
    credentials: true,
  });

  // Cookies
  await server.register(cookie);

  // tRPC
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError: ({ path, error }) => {
        console.error(`[tRPC] ${path ?? "<unknown>"}: ${error.message}`);
      },
    },
  });

  // Health check
  server.get("/health", async () => {
    return {
      status: "ok",
      service: "pixel-api",
      timestamp: new Date().toISOString(),
    };
  });

  // Root
  server.get("/", async () => {
    return {
      name: "Pixel API",
      version: "0.0.0",
      docs: "/trpc",
    };
  });

  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Pixel API running on http://0.0.0.0:${PORT}`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

export type { AppRouter };
