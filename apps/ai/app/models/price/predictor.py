import numpy as np
from datetime import datetime, timedelta
from typing import Optional


def generate_price_predictions(
    product_name: str,
    province: Optional[str] = None,
    days: int = 7,
    base_price: float = 1000000,
) -> dict:
    np.random.seed(hash(product_name) % 2**32)

    trend = np.random.choice([-1, 0, 1])
    trend_pct = np.random.uniform(0.5, 3.0)
    volatility = np.random.uniform(0.01, 0.05)

    predictions = []
    current_price = base_price

    for i in range(days):
        date = (datetime.now() + timedelta(days=i + 1)).strftime("%Y-%m-%d")
        change = trend * trend_pct / 100 + np.random.normal(0, volatility)
        current_price = current_price * (1 + change)
        lower = current_price * (1 - volatility * 2)
        upper = current_price * (1 + volatility * 2)
        predictions.append({
            "date": date,
            "price": round(current_price),
            "lower": round(lower),
            "upper": round(upper),
        })

    change_pct = ((predictions[-1]["price"] - base_price) / base_price) * 100
    if trend > 0:
        trend_dir = "increasing"
    elif trend < 0:
        trend_dir = "decreasing"
    else:
        trend_dir = "stable"

    factors = []
    if trend > 0:
        factors.append("روند صعودی بازار")
        factors.append("احتمال کاهش عرضه")
    elif trend < 0:
        factors.append("روند نزولی بازار")
        factors.append("افزایش عرضه")
    else:
        factors.append("بازار باثبات")

    if province:
        factors.append(f"شرایط استان {province}")

    confidence = max(0.5, min(0.95, 1 - volatility * 10))

    return {
        "productName": product_name,
        "province": province,
        "predictions": predictions,
        "confidence": round(confidence, 2),
        "trend": trend_dir,
        "changePct": round(change_pct, 2),
        "factors": factors,
    }


def get_price_trend(
    product_name: str,
    province: Optional[str] = None,
    days: int = 30,
    base_price: float = 1000000,
) -> dict:
    result = generate_price_predictions(product_name, province, days, base_price)
    return {
        "productName": product_name,
        "province": province,
        "trend": result["trend"],
        "direction": result["trend"],
        "changePct": result["changePct"],
        "confidence": result["confidence"],
    }
