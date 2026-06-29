import { describe, it, expect } from "vitest";
import { generateOtpCode } from "../src/lib/sms.js";
import { OTP_CONFIG } from "@pixel/shared";

describe("SMS / OTP utilities", () => {
  it("should generate dev code in non-production", () => {
    const code = generateOtpCode();
    expect(code).toBe(OTP_CONFIG.DEV_MODE_CODE);
  });

  it("should generate code with correct length", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const code = generateOtpCode();
    process.env.NODE_ENV = originalEnv;

    expect(code).toHaveLength(OTP_CONFIG.CODE_LENGTH);
    expect(code).toMatch(/^\d+$/);
  });
});
