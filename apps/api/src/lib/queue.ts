import { Queue, Worker } from "bullmq";
import { getRedis } from "./redis.js";

// ─── Queue definitions ──────────────────────────────────────

export interface NotificationJob {
  type: "sms" | "email" | "push" | "in_app";
  userId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface WebhookJob {
  webhookId: string;
  url: string;
  secret: string;
  event: string;
  payload: unknown;
}

export interface IndexUpdateJob {
  productId?: string;
  supplierId?: string;
  action: "create" | "update" | "delete";
}

// ─── Queue instances ────────────────────────────────────────

let notificationQueue: Queue | null = null;
let webhookQueue: Queue | null = null;
let indexQueue: Queue | null = null;

export async function getNotificationQueue(): Promise<Queue> {
  if (!notificationQueue) {
    const connection = await getRedis();
    notificationQueue = new Queue("notifications", { connection: connection as any });
  }
  return notificationQueue;
}

export async function getWebhookQueue(): Promise<Queue> {
  if (!webhookQueue) {
    const connection = await getRedis();
    webhookQueue = new Queue("webhooks", { connection: connection as any });
  }
  return webhookQueue;
}

export async function getIndexQueue(): Promise<Queue> {
  if (!indexQueue) {
    const connection = await getRedis();
    indexQueue = new Queue("index-updates", { connection: connection as any });
  }
  return indexQueue;
}

// ─── Queue helpers ──────────────────────────────────────────

export async function enqueueNotification(job: NotificationJob): Promise<void> {
  const queue = await getNotificationQueue();
  await queue.add("notify", job, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}

export async function enqueueWebhook(job: WebhookJob): Promise<void> {
  const queue = await getWebhookQueue();
  await queue.add("deliver", job, {
    attempts: 5,
    backoff: { type: "exponential", delay: 10000 },
  });
}

export async function enqueueIndexUpdate(job: IndexUpdateJob): Promise<void> {
  const queue = await getIndexQueue();
  await queue.add("index", job, {
    attempts: 2,
    backoff: { type: "fixed", delay: 2000 },
  });
}

// ─── Worker setup (call on server start) ────────────────────

export async function setupWorkers(): Promise<void> {
  const connection = await getRedis();

  const conn = connection as any;

  // Notification worker
  new Worker(
    "notifications",
    async (job) => {
      const { type, userId, title, body } = job.data;
      console.log(`[Notification] ${type} → user:${userId}: ${title}`);
      // TODO: integrate with actual SMS/email/push providers
    },
    { connection: conn },
  );

  // Webhook delivery worker
  new Worker(
    "webhooks",
    async (job) => {
      const { url, secret, event, payload } = job.data;
      const crypto = await import("crypto");
      const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
      const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Pixel-Signature": signature,
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status}`);
      }

      console.log(`[Webhook] Delivered ${event} to ${url} (${response.status})`);
    },
    { connection: conn },
  );

  // Index update worker
  new Worker(
    "index-updates",
    async (job) => {
      const { productId, supplierId, action } = job.data;
      console.log(`[Index] ${action}: product=${productId} supplier=${supplierId}`);
      // TODO: update search index (e.g., Elasticsearch or pg_trgm)
    },
    { connection: conn },
  );

  console.log("📋 BullMQ workers registered (notifications, webhooks, index-updates)");
}
