import { TRPCError } from "@trpc/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export async function callAI<T>(path: string, body?: any): Promise<T> {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `AI service error: ${response.status}`,
    });
  }

  return response.json() as Promise<T>;
}

export async function callAIGet<T>(path: string): Promise<T> {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `AI service error: ${response.status}`,
    });
  }

  return response.json() as Promise<T>;
}

export async function callAIFormData<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${AI_SERVICE_URL}${path}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: `AI service error: ${response.status}`,
    });
  }

  return response.json() as Promise<T>;
}
