import { describe, it, expect } from "vitest";

describe("RFQ Router — Schema Validation", () => {
  it("should validate createRfqSchema with required fields", async () => {
    const { createRfqSchema } = await import("@pixel/shared");
    const valid = createRfqSchema.parse({
      productName: "کود اوره",
      quantity: 10,
      unit: "تن",
    });
    expect(valid.productName).toBe("کود اوره");
    expect(valid.quantity).toBe(10);
  });

  it("should reject createRfqSchema without productName", async () => {
    const { createRfqSchema } = await import("@pixel/shared");
    expect(() => createRfqSchema.parse({ quantity: 5, unit: "تن" })).toThrow();
  });

  it("should reject createRfqSchema without quantity", async () => {
    const { createRfqSchema } = await import("@pixel/shared");
    expect(() => createRfqSchema.parse({ productName: "test", unit: "تن" })).toThrow();
  });

  it("should accept optional fields", async () => {
    const { createRfqSchema } = await import("@pixel/shared");
    const valid = createRfqSchema.parse({
      productName: "گندم",
      quantity: 100,
      unit: "کیلوگرم",
      description: "گندم مرغوب درخواست می‌کنم",
      targetPrice: 15000,
      deliveryProvince: "خراسان رضوی",
      deliveryCounty: "مشهد",
    });
    expect(valid.targetPrice).toBe(15000);
    expect(valid.deliveryProvince).toBe("خراسان رضوی");
  });
});

describe("Order Router — Schema Validation", () => {
  it("should validate createOrderSchema with items array", async () => {
    const { createOrderSchema } = await import("@pixel/shared");
    const valid = createOrderSchema.parse({
      supplierId: "123e4567-e89b-12d3-a456-426614174000",
      items: [
        { productId: "123e4567-e89b-12d3-a456-426614174001", name: "کود اوره", quantity: 5, unit: "تن", price: 50000 },
      ],
      shippingAddress: { province: "خراسان رضوی", county: "مشهد", address: "خیابان احمدآباد" },
    });
    expect(valid.items).toHaveLength(1);
    expect(valid.items[0].quantity).toBe(5);
  });

  it("should reject createOrderSchema without items", async () => {
    const { createOrderSchema } = await import("@pixel/shared");
    expect(() => createOrderSchema.parse({
      supplierId: "123e4567-e89b-12d3-a456-426614174000",
      shippingAddress: { province: "test", county: "test", address: "test" },
    })).toThrow();
  });
});
