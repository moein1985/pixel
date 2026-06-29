from typing import Optional


def recommend_suppliers(
    product_name: str,
    quantity: Optional[float] = None,
    province: Optional[str] = None,
    suppliers_data: Optional[list] = None,
) -> list:
    if not suppliers_data:
        return []

    scored = []
    for s in suppliers_data:
        score = 0
        if product_name.lower() in " ".join(s.get("supplyCategories", []) or []).lower():
            score += 40
        if province and s.get("province") == province:
            score += 20
        score += min(float(s.get("rating", 0)) * 8, 40)
        scored.append({**s, "recommendationScore": score})

    scored.sort(key=lambda x: x["recommendationScore"], reverse=True)
    return scored[:10]


def recommend_products(
    user_id: str,
    user_profile: Optional[dict] = None,
    products_data: Optional[list] = None,
) -> list:
    if not products_data:
        return []

    scored = []
    for p in products_data:
        score = 0
        if user_profile and user_profile.get("mainCrops"):
            for crop in user_profile["mainCrops"]:
                if crop.lower() in p.get("name", "").lower():
                    score += 30
        score += min(float(p.get("rating", 0)) * 10, 50)
        score += min(p.get("viewCount", 0) / 100, 20)
        scored.append({**p, "recommendationScore": score})

    scored.sort(key=lambda x: x["recommendationScore"], reverse=True)
    return scored[:10]
