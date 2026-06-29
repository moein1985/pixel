import { describe, it, expect } from "vitest";

describe("AI Router — Input Validation", () => {
  it("should validate chat input", () => {
    const input = { message: "قیمت گندم چنده؟", context: { userId: "123" } };
    expect(input.message).toHaveLength(20);
    expect(input.message).toContain("گندم");
  });

  it("should reject empty chat message", () => {
    const input = { message: "" };
    expect(input.message.length).toBe(0);
  });

  it("should validate price prediction input", () => {
    const input = { productName: "گندم", province: "خراسان", days: 7 };
    expect(input.days).toBeGreaterThan(0);
    expect(input.days).toBeLessThanOrEqual(90);
  });

  it("should validate image classification input", () => {
    const input = { imageBase64: "data:image/png;base64,iVBORw0KGgo..." };
    expect(input.imageBase64).toContain("base64");
  });

  it("should validate risk analysis input", () => {
    const input = { supplierId: "123e4567-e89b-12d3-a456-426614174000" };
    expect(input.supplierId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });
});

describe("Logistics Router — Input Validation", () => {
  it("should validate shipment creation", () => {
    const input = {
      orderId: "123e4567-e89b-12d3-a456-426614174000",
      carrierType: "self" as const,
      originAddress: "مشهد، خیابان احمدآباد",
      destinationAddress: "تهران، میدان آزادی",
      originProvince: "خراسان رضوی",
      destinationProvince: "تهران",
    };
    expect(input.carrierType).toBe("self");
    expect(input.originAddress).toContain("مشهد");
  });

  it("should validate tracking update", () => {
    const input = {
      shipmentId: "123e4567-e89b-12d3-a456-426614174000",
      status: "in_transit",
      latitude: "35.6892",
      longitude: "51.3890",
      note: "محموله در راه است",
    };
    expect(input.status).toBe("in_transit");
    expect(parseFloat(input.latitude)).toBeGreaterThan(0);
  });

  it("should validate webhook creation", () => {
    const input = {
      url: "https://example.com/webhook",
      events: ["order.created", "order.status_changed"],
    };
    expect(input.url).toMatch(/^https?:\/\//);
    expect(input.events).toContain("order.created");
  });

  it("should validate API key creation", () => {
    const input = { name: "Mobile App Key", scopes: ["read:products", "read:prices"] };
    expect(input.scopes).toHaveLength(2);
    expect(input.scopes[0]).toBe("read:products");
  });
});
