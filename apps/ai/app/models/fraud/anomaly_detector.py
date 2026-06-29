import numpy as np
from typing import Optional


def check_fraud(
    target_type: str,
    target_id: str,
    avg_price: Optional[float] = None,
    current_price: Optional[float] = None,
    cancel_rate: Optional[float] = None,
    profile_completeness: Optional[float] = None,
) -> dict:
    flags = []
    score = 0

    if avg_price and current_price:
        z_score = abs(current_price - avg_price) / max(avg_price, 1)
        if z_score > 2:
            flags.append({
                "type": "abnormal_price",
                "detail": f"قیمت {current_price} انحراف شدید از میانگین {avg_price}",
                "weight": 30,
            })
            score += 30
        elif z_score > 1:
            flags.append({
                "type": "price_outlier",
                "detail": f"قیمت خارج از بازه عادی",
                "weight": 15,
            })
            score += 15

    if cancel_rate is not None and cancel_rate > 0.3:
        flags.append({
            "type": "high_cancel_rate",
            "detail": f"نرخ لغو سفارش {cancel_rate:.0%}",
            "weight": 25,
        })
        score += 25

    if profile_completeness is not None and profile_completeness < 0.3:
        flags.append({
            "type": "incomplete_profile",
            "detail": f"پروفایل تنها {profile_completeness:.0%} تکمیل شده",
            "weight": 20,
        })
        score += 20

    score = min(score, 100)
    if score >= 70:
        risk_level = "high"
    elif score >= 40:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "targetType": target_type,
        "targetId": target_id,
        "riskLevel": risk_level,
        "flags": flags,
        "score": score,
    }


def calculate_risk_score(
    supplier_id: str,
    cancel_rate: float = 0,
    avg_delay_days: float = 0,
    quality_rating: float = 5,
    complaint_count: int = 0,
    activity_months: int = 12,
    total_transactions: int = 0,
) -> dict:
    cancel_risk = min(cancel_rate * 100 * 0.25, 25)
    delay_risk = min(avg_delay_days * 2 * 0.20, 20)
    quality_risk = (5 - quality_rating) / 5 * 20
    complaint_risk = min(complaint_count * 5 * 0.15, 15)
    longevity_risk = max(0, (12 - activity_months) / 12 * 10)
    volume_risk = max(0, (10 - total_transactions) * 1.0)

    total_risk = cancel_risk + delay_risk + quality_risk + complaint_risk + longevity_risk + volume_risk
    total_risk = min(total_risk, 100)

    if total_risk >= 70:
        risk_level = "high"
        recommendation = "این تأمین‌کننده ریسک بالایی دارد. با احتیاط معامله کنید."
    elif total_risk >= 40:
        risk_level = "medium"
        recommendation = "این تأمین‌کننده ریسک متوسطی دارد."
    else:
        risk_level = "low"
        recommendation = "این تأمین‌کننده ریسک پایینی دارد. قابل اعتماد برای معامله."

    factors = [
        {"name": "نرخ لغو سفارش", "value": cancel_rate, "risk": "low" if cancel_rate < 0.1 else "medium" if cancel_rate < 0.3 else "high", "weight": 25},
        {"name": "میانگین تأخیر تحویل", "value": avg_delay_days, "unit": "روز", "risk": "low" if avg_delay_days < 2 else "medium" if avg_delay_days < 5 else "high", "weight": 20},
        {"name": "امتیاز کیفیت", "value": quality_rating, "risk": "low" if quality_rating >= 4 else "medium" if quality_rating >= 3 else "high", "weight": 20},
        {"name": "شکایات", "value": complaint_count, "risk": "low" if complaint_count == 0 else "medium" if complaint_count < 3 else "high", "weight": 15},
        {"name": "قدمت فعالیت", "value": activity_months, "unit": "ماه", "risk": "low" if activity_months >= 12 else "medium" if activity_months >= 6 else "high", "weight": 10},
        {"name": "حجم معاملات", "value": total_transactions, "risk": "low" if total_transactions >= 10 else "medium" if total_transactions >= 3 else "high", "weight": 10},
    ]

    return {
        "supplierId": supplier_id,
        "riskScore": round(total_risk),
        "riskLevel": risk_level,
        "factors": factors,
        "recommendation": recommendation,
        "trend": "stable",
    }
