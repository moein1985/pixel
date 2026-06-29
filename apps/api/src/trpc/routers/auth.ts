import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../context.js";
import { requestOtpSchema, verifyOtpSchema, registerSchema } from "@pixel/shared";
import { users, otpCodes } from "@pixel/db";
import { eq, and, gt, lt } from "drizzle-orm";
import { signToken } from "../../lib/auth.js";
import { generateOtpCode, sendOtpSms } from "../../lib/sms.js";
import { OTP_CONFIG } from "@pixel/shared";

export const authRouter = router({
  requestOtp: publicProcedure
    .input(requestOtpSchema)
    .mutation(async ({ ctx, input }) => {
      const { phone } = input;

      // Check cooldown — prevent spam
      const recentOtp = await ctx.db
        .select()
        .from(otpCodes)
        .where(and(eq(otpCodes.phone, phone), gt(otpCodes.expiresAt, new Date())))
        .limit(1);

      if (recentOtp.length > 0) {
        const ageSeconds = Math.floor(
          (Date.now() - new Date(recentOtp[0].createdAt).getTime()) / 1000
        );
        if (ageSeconds < OTP_CONFIG.RESEND_COOLDOWN_SECONDS) {
          return {
            success: true,
            message: `کد ارسال شده است. لطفاً ${OTP_CONFIG.RESEND_COOLDOWN_SECONDS - ageSeconds} ثانیه صبر کنید.`,
          };
        }
      }

      const code = generateOtpCode();
      const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

      await ctx.db.insert(otpCodes).values({
        phone,
        code,
        expiresAt,
      });

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

      // Find valid OTP
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
        return {
          success: false as const,
          message: "کد منقضی شده یا یافت نشد",
        };
      }

      // Check attempts
      if (otp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
        await ctx.db
          .update(otpCodes)
          .set({ used: true })
          .where(eq(otpCodes.id, otp.id));
        return {
          success: false as const,
          message: "تعداد تلاش‌های مجاز تمام شد",
        };
      }

      // Verify code
      if (otp.code !== code) {
        await ctx.db
          .update(otpCodes)
          .set({ attempts: otp.attempts + 1 })
          .where(eq(otpCodes.id, otp.id));
        return {
          success: false as const,
          message: "کد اشتباه است",
        };
      }

      // Mark OTP as used
      await ctx.db
        .update(otpCodes)
        .set({ used: true })
        .where(eq(otpCodes.id, otp.id));

      // Find existing user
      const [existingUser] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.phone, phone))
        .limit(1);

      if (existingUser) {
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
    // In a stateless JWT system, logout is handled client-side
    // Optionally blacklist the token in Redis
    return { success: true };
  }),
});
