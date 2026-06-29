import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../src/lib/auth.js";

describe("Auth utilities", () => {
  it("should sign and verify a token", () => {
    const payload = {
      userId: "test-user-id",
      phone: "09100000000",
      role: "farmer",
      firstName: "Test",
      lastName: "User",
    };

    const token = signToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(payload.userId);
    expect(decoded?.phone).toBe(payload.phone);
    expect(decoded?.role).toBe(payload.role);
  });

  it("should return null for invalid token", () => {
    const result = verifyToken("invalid-token-string");
    expect(result).toBeNull();
  });

  it("should return null for empty token", () => {
    const result = verifyToken("");
    expect(result).toBeNull();
  });
});
