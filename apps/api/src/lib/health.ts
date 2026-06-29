import type { FastifyInstance } from "fastify";

interface ServerMetrics {
  totalRequests: number;
  totalErrors: number;
  responseTimes: number[];
  startTime: number;
}

export function registerHealthRoutes(server: FastifyInstance, metrics: ServerMetrics) {
  server.get("/health", async () => {
    return {
      status: "ok",
      service: "pixel-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });

  server.get("/api/health", async () => {
    return {
      status: "ok",
      service: "pixel-api",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: process.env.DATABASE_URL ? "configured" : "not-configured",
        redis: process.env.REDIS_URL ? "configured" : "not-configured",
        ai: process.env.AI_SERVICE_URL ? "configured" : "not-configured",
      },
    };
  });

  server.get("/api/metrics", async () => {
    const avgResponseTime =
      metrics.responseTimes.length > 0
        ? Math.round(metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length)
        : 0;

    const p95Index = Math.floor(metrics.responseTimes.length * 0.95);
    const sortedTimes = [...metrics.responseTimes].sort((a, b) => a - b);
    const p95ResponseTime = sortedTimes[p95Index] ?? 0;

    const uptimeSeconds = (Date.now() - metrics.startTime) / 1000;
    const errorRate = metrics.totalRequests > 0 ? (metrics.totalErrors / metrics.totalRequests) * 100 : 0;

    return {
      requests: {
        total: metrics.totalRequests,
        errors: metrics.totalErrors,
        errorRate: Number(errorRate.toFixed(2)),
      },
      responseTime: {
        avg: avgResponseTime,
        p95: p95ResponseTime,
        unit: "ms",
      },
      uptime: {
        seconds: Math.round(uptimeSeconds),
        human: formatUptime(uptimeSeconds),
      },
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  });
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(" ");
}
