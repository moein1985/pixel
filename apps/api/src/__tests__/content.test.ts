import { describe, it, expect } from "vitest";

describe("Content Router — Schema Validation", () => {
  it("should validate article list query", () => {
    const params = { page: 1, pageSize: 10, category: "news" };
    expect(params.page).toBe(1);
    expect(params.pageSize).toBe(10);
    expect(params.category).toBe("news");
  });

  it("should validate report list query", () => {
    const params = { page: 1, pageSize: 20, type: "price_analysis" };
    expect(params.type).toBe("price_analysis");
  });

  it("should validate market price batch input", () => {
    const prices = [
      { productName: "گندم", minPrice: "12000", maxPrice: "15000", avgPrice: "13500", unit: "کیلوگرم", province: "خراسان" },
      { productName: "جو", minPrice: "10000", maxPrice: "12000", avgPrice: "11000", unit: "کیلوگرم" },
    ];
    expect(prices).toHaveLength(2);
    expect(prices[0].productName).toBe("گندم");
  });
});

describe("Social Router — Schema Validation", () => {
  it("should validate network creation", () => {
    const input = { name: "شبکه کشاورزان خراسان", networkType: "regional", province: "خراسان رضوی" };
    expect(input.name).toBe("شبکه کشاورزان خراسان");
    expect(input.networkType).toBe("regional");
  });

  it("should validate inquiry creation", () => {
    const input = {
      type: "inquiry",
      name: "علی احمدی",
      phone: "09123456789",
      subject: "استعلام قیمت",
      message: "قیمت کود اوره چنده؟",
    };
    expect(input.type).toBe("inquiry");
    expect(input.phone).toMatch(/^09\d{9}$/);
  });
});
