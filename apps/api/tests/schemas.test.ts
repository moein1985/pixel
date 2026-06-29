import { describe, it, expect } from "vitest";
import { requestOtpSchema, verifyOtpSchema, registerSchema, searchSchema, paginationSchema } from "@pixel/shared";

describe("Shared schemas", () => {
  it("should validate phone number in requestOtpSchema", () => {
    const valid = requestOtpSchema.safeParse({ phone: "09123456789" });
    expect(valid.success).toBe(true);
  });

  it("should reject invalid phone number", () => {
    const invalid = requestOtpSchema.safeParse({ phone: "12345" });
    expect(invalid.success).toBe(false);
  });

  it("should validate verifyOtpSchema", () => {
    const valid = verifyOtpSchema.safeParse({ phone: "09123456789", code: "123456" });
    expect(valid.success).toBe(true);
  });

  it("should reject wrong code length", () => {
    const invalid = verifyOtpSchema.safeParse({ phone: "09123456789", code: "123" });
    expect(invalid.success).toBe(false);
  });

  it("should validate registerSchema with all fields", () => {
    const valid = registerSchema.safeParse({
      phone: "09123456789",
      role: "farmer",
      firstName: "علی",
      lastName: "محمدی",
    });
    expect(valid.success).toBe(true);
  });

  it("should reject registerSchema without required fields", () => {
    const invalid = registerSchema.safeParse({ phone: "09123456789" });
    expect(invalid.success).toBe(false);
  });

  it("should validate searchSchema with defaults", () => {
    const valid = searchSchema.safeParse({ query: "گندم" });
    expect(valid.success).toBe(true);
  });

  it("should validate paginationSchema with defaults", () => {
    const valid = paginationSchema.safeParse({});
    expect(valid.success).toBe(true);
  });
});
