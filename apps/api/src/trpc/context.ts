import { initTRPC, TRPCError } from "@trpc/server";
import type { FastifyRequest, FastifyReply } from "fastify";
import { db } from "@pixel/db";
import type { UserRole } from "@pixel/shared";
import { verifyToken } from "../lib/auth.js";

export interface ContextUser {
  id: string;
  phone: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
}

export interface Context {
  req: FastifyRequest;
  res: FastifyReply;
  db: typeof db;
  user: ContextUser | null;
}

export async function createContext({
  req,
  res,
}: {
  req: FastifyRequest;
  res: FastifyReply;
}): Promise<Context> {
  let user: ContextUser | null = null;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = verifyToken(token);
      if (payload) {
        user = {
          id: payload.userId,
          phone: payload.phone,
          role: payload.role as UserRole,
          firstName: payload.firstName ?? null,
          lastName: payload.lastName ?? null,
        };
      }
    } catch {
      // invalid token — user stays null
    }
  }

  return { req, res, db, user };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "احراز هویت لازم است" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "moderator") {
    throw new TRPCError({ code: "FORBIDDEN", message: "دسترسی محدود به مدیران" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const roleProcedure = (allowedRoles: UserRole[]) =>
  protectedProcedure.use(({ ctx, next }) => {
    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({ code: "FORBIDDEN", message: "دسترسی غیرمجاز" });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
