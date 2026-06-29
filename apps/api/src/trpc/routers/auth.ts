import { router, publicProcedure, protectedProcedure } from "../context.js";
import { requestOtpSchema, verifyOtpSchema, registerSchema } from "@pixel/shared";
import { users, otpCodes } from "@pixel/db";
import { eq, and, gt } from "drizzle-orm";
import { signToken } from "../../lib/auth.js";
import { generateOtpCode, sendOtpSms } from "../../lib/sms.js";
import { OTP_CONFIG } from "@pixel/shared";
import {
  storeOtp,
  getOtp,
  deleteOtp,
  incrementOtpAttempts,
  getOtpAttempts,
  checkOtpCooldown,
  setOtpCooldown,
  blacklistToken,
} from "../../lib/redis.js";

export const authRouter = router({
  requestOtp: publicProcedure
    .input(requestOtpSchema)
    .mutation(async ({ ctx, input }) => {
      const { phone } = input;

      // Check cooldown via Redis
      const onCooldown = await checkOtpCooldown(phone).catch(() => false);
      if (onCooldown) {
        return {
          success: true,
          message: `کد ارسال شده است. لطفاً ${OTP_CONFIG.RESEND_COOLDOWN_SECONDS} ثانیه صبر کنید.`,
        };
      }

      const code = generateOtpCode();

      // Store in Redis with TTL
      await storeOtp(phone, code).catch((err) => {
        console.error("[Redis] Failed to store OTP, falling back to DB:", err.message);
      });

      // Also store in DB as fallback
      const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
      await ctx.db.insert(otpCodes).values({ phone, code, expiresAt }).catch(() => {});

      // Set cooldown
      await setOtpCooldown(phone, OTP_CONFIG.RESEND_COOLDOWN_SECONDS).catch(() => {});

      await sendOtpSms(phone, code);

      return {
        success: true,
        message: "کد تأیید ارسال شد",
        devCode: process.env.NODE_ENV !== "production" ? code : undefined,
      };
    }),

  verifyOtp: publicProcedure
    .input(verifyOtpSchema)
    .mutation(async ({ ctx, input }) => {
      const { phone, code } = input;

      // Try Redis first
      let storedCode: string | null = null;
      try {
        storedCode = await getOtp(phone);
      } catch {
        // Redis unavailable
      }

      if (storedCode !== null) {
        const attempts = await getOtpAttempts(phone).catch(() => 0);
        if (attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
          await deleteOtp(phone).catch(() => {});
          return { success: false as const, message: "تعداد تلاش‌های مجاز تمام شد" };
        }
        if (storedCode !== code) {
          await incrementOtpAttempts(phone).catch(() => {});
          return { success: false as const, message: "کد اشتباه است" };
        }
        await deleteOtp(phone).catch(() => {});
      } else {
        // DB fallback
        const [otp] = await ctx.db
          .select()
          .from(otpCodes)
          .where(
            and(
              eq(otpCodes.phone, phone),
              eq(otpCodes.used, false),
              gt(otpCodes.expiresAt, new Date())
            )
          )
          .orderBy(otpCodes.createdAt)
          .limit(1);

        if (!otp) {
          return { success: false as const, message: "کد منقضی شده یا یافت نشد" };
        }
        if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
          await ctx.db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
          return { success: false as const, message: "تعداد تلاش‌های مجاز تمام شد" };
        }
        if (otp.code !== code) {
          await ctx.db.update(otpCodes).set({ attempts: otp.attempts + 1 }).where(eq(otpCodes.id, otp.id));
          return { success: false as const, message: "کد اشتباه است" };
        }
        await ctx.db.update(otpCodes).set({ used: true }).where(eq(otpCodes.id, otp.id));
      }

      // Find existing user
      const [existingUser] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (existingUser) {
        if (existingUser.status === "suspended") {
          return {
            success: false as const,
            message: "حساب کاربری شما معلق شده است. با پشتیبانی تماس بگیرید.",
          };
        }

        const token = signToken({
          userId: existingUser.id,
          phone: existingUser.phone,
          role: existingUser.role,
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
        });

        await ctx.db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, existingUser.id));

        return {
          success: true as const,
          token,
          user: existingUser,
          needsRegistration: false,
        };
      }

      return {
        success: true as const,
        token: null,
        user: null,
        needsRegistration: true,
      };
    }),

  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const { phone, role, firstName, lastName, nationalCode } = input;

      // Check if user already exists
      const [existing] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (existing) {
        return {
          success: false as const,
          message: "این شماره قبلاً ثبت شده است",
        };
      }

      const [newUser] = await ctx.db
        .insert(users)
        .values({
          phone,
          role,
          firstName,
          lastName,
          nationalCode,
          status: "active",
        })
        .returning();

      const token = signToken({
        userId: newUser.id,
        phone: newUser.phone,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      });

      return {
        success: true as const,
        token,
        user: newUser,
      };
    }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user) {
      return null;
    }

    return user;
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const authHeader = ctx.req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      await blacklistToken(token, 7 * 24 * 60 * 60).catch(() => {});
    }
    return { success: true };
  }),

  refresh: protectedProcedure.mutation(async ({ ctx }) => {
    const [user] = await ctx.db
      .select()
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    if (!user || user.status !== "active") {
      return { success: false as const, message: "کاربر یافت نشد یا غیرفعال است" };
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    return { success: true as const, token };
  }),
});
