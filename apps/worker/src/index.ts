import { Worker, Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

// ─── Queues ─────────────────────────────────────────────────

export const emailQueue = new Queue("email", { connection });
export const smsQueue = new Queue("sms", { connection });
export const notificationQueue = new Queue("notification", { connection });
export const priceHistoryQueue = new Queue("price-history", { connection });
export const fraudCheckQueue = new Queue("fraud-check", { connection });

// ─── Workers ────────────────────────────────────────────────

const smsWorker = new Worker(
  "sms",
  async (job) => {
    const { phone, message } = job.data;
    console.log(`[SMS Worker] → ${phone}: ${message}`);
    // TODO: integrate with actual SMS provider
    return { success: true };
  },
  { connection }
);

smsWorker.on("completed", (job) => {
  console.log(`[SMS Worker] Job ${job.id} completed`);
});

smsWorker.on("failed", (job, err) => {
  console.error(`[SMS Worker] Job ${job?.id} failed:`, err.message);
});

const notificationWorker = new Worker(
  "notification",
  async (job) => {
    const { userId, type, title, body } = job.data;
    console.log(`[Notification Worker] → user ${userId}: ${title}`);
    // TODO: send push notification / in-app notification
    return { success: true };
  },
  { connection }
);

notificationWorker.on("completed", (job) => {
  console.log(`[Notification Worker] Job ${job.id} completed`);
});

notificationWorker.on("failed", (job, err) => {
  console.error(`[Notification Worker] Job ${job?.id} failed:`, err.message);
});

console.log("🔧 Pixel Worker started — listening for jobs...");

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Shutting down workers...");
  await smsWorker.close();
  await notificationWorker.close();
  await connection.quit();
  process.exit(0);
});
