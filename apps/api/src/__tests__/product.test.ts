import { describe, it, expect } from "vitest";

describe("Product Router — Schema Validation", () => {
  it("should validate createProductSchema with required fields", async () => {
    const { createProductSchema } = await import("@pixel/shared");
    const valid = createProductSchema.parse({
      name: "کود اوره ۴۶٪",
      categoryId: 1,
      unit: "تن",
      currency: "IRR",
    });
    expect(valid.name).toBe("کود اوره ۴۶٪");
    expect(valid.currency).toBe("IRR");
  });

  it("should reject createProductSchema without name", async () => {
    const { createProductSchema } = await import("@pixel/shared");
    expect(() => createProductSchema.parse({ categoryId: 1, unit: "تن" })).toThrow();
  });

  it("should reject createProductSchema without unit", async () => {
    const { createProductSchema } = await import("@pixel/shared");
    expect(() => createProductSchema.parse({ name: "test", categoryId: 1 })).toThrow();
  });

  it("should accept optional fields", async () => {
    const { createProductSchema } = await import("@pixel/shared");
    const valid = createProductSchema.parse({
      name: "گندم",
      categoryId: 2,
      unit: "کیلوگرم",
      currency: "IRR",
      pricePerUnit: 15000,
      minOrderQuantity: 100,
      availableQuantity: 5000,
      description: "گندم مرغوب",
      brand: "برند تست",
      origin: "ایران",
    });
    expect(valid.pricePerUnit).toBe(15000);
    expect(valid.description).toBe("گندم مرغوب");
  });
});
