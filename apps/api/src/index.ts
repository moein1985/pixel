import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import websocket from "@fastify/websocket";
import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createOpenApiFastifyPlugin } from "trpc-openapi";
import { appRouter, type AppRouter } from "./trpc/router.js";
import { createContext } from "./trpc/context.js";
import { openApiDocument } from "./trpc/openapi.js";
import { setupSocketServer } from "./lib/socket.js";
import { registerHealthRoutes } from "./lib/health.js";

const PORT = Number(process.env.API_PORT ?? 4000);

const server = Fastify({
  maxParamLength: 5000,
});

// Request metrics
const metrics = {
  totalRequests: 0,
  totalErrors: 0,
  responseTimes: [] as number[],
  startTime: Date.now(),
};

server.addHook("onRequest", async () => {
  metrics.totalRequests++;
});

server.addHook("onResponse", async (req, reply) => {
  const responseTime = Date.now() - (req as any).__startTime;
  if (responseTime >= 0) {
    metrics.responseTimes.push(responseTime);
    if (metrics.responseTimes.length > 1000) {
      metrics.responseTimes.shift();
    }
  }
  if (reply.statusCode >= 500) {
    metrics.totalErrors++;
  }
});

server.addHook("preHandler", async (req: any) => {
  req.__startTime = Date.now();
});

async function start() {
  // CORS
  await server.register(cors, {
    origin: process.env.NODE_ENV === "production" ? false : true,
    credentials: true,
  });

  // Cookies
  await server.register(cookie);

  // WebSocket for Socket.io
  await server.register(websocket);

  // tRPC
  await server.register(fastifyTRPCPlugin, {
    prefix: "/trpc",
    trpcOptions: {
      router: appRouter,
      createContext,
      onError: ({ path, error }: { path: string | undefined; error: { message: string } }) => {
        console.error(`[tRPC] ${path ?? "<unknown>"}: ${error.message}`);
      },
    },
  });

  // REST API (OpenAPI)
  await server.register(
    createOpenApiFastifyPlugin({
      path: "/api",
      openApiDocument,
    }),
  );

  // OpenAPI spec endpoint
  server.get("/api/openapi.json", async () => {
    return openApiDocument;
  });

  // Health & Metrics
  registerHealthRoutes(server, metrics);

  // Socket.io for real-time chat
  setupSocketServer(server);

  // Root
  server.get("/", async () => {
    return {
      name: "Pixel API",
      version: "1.0.0",
      docs: "/api/openapi.json",
      trpc: "/trpc",
      health: "/health",
    };
  });

  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Pixel API running on http://0.0.0.0:${PORT}`);
    console.log(`📚 OpenAPI spec at http://0.0.0.0:${PORT}/api/openapi.json`);
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();

export type { AppRouter };
