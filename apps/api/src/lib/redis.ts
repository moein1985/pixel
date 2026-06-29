import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("[Redis] Error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

export async function getRedis(): Promise<Redis> {
  if (redis.status === "ready" || redis.status === "connect" || redis.status === "connecting") {
    return redis;
  }
  await redis.connect();
  return redis;
}

// ─── OTP helpers ────────────────────────────────────────────

export async function storeOtp(phone: string, code: string): Promise<void> {
  const r = await getRedis();
  const key = `otp:${phone}`;
  await r.set(key, code, "EX", 120); // 2 minutes TTL
}

export async function getOtp(phone: string): Promise<string | null> {
  const r = await getRedis();
  return r.get(`otp:${phone}`);
}

export async function deleteOtp(phone: string): Promise<void> {
  const r = await getRedis();
  await r.del(`otp:${phone}`);
}

export async function incrementOtpAttempts(phone: string): Promise<number> {
  const r = await getRedis();
  const key = `otp:attempts:${phone}`;
  const count = await r.incr(key);
  await r.expire(key, 120);
  return count;
}

export async function getOtpAttempts(phone: string): Promise<number> {
  const r = await getRedis();
  const val = await r.get(`otp:attempts:${phone}`);
  return val ? parseInt(val, 10) : 0;
}

export async function checkOtpCooldown(phone: string): Promise<boolean> {
  const r = await getRedis();
  const key = `otp:cooldown:${phone}`;
  const exists = await r.exists(key);
  return exists === 1;
}

export async function setOtpCooldown(phone: string, seconds: number): Promise<void> {
  const r = await getRedis();
  await r.set(`otp:cooldown:${phone}`, "1", "EX", seconds);
}

// ─── Token blacklist ────────────────────────────────────────

export async function blacklistToken(token: string, expirySeconds: number): Promise<void> {
  const r = await getRedis();
  await r.set(`bl:${token}`, "1", "EX", expirySeconds);
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  const r = await getRedis();
  const exists = await r.exists(`bl:${token}`);
  return exists === 1;
}
