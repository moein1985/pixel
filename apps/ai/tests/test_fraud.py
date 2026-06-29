import pytest
from app.models.fraud.anomaly_detector import check_fraud, calculate_risk_score


def test_fraud_check_low_risk():
    result = check_fraud("product", "123", avg_price=1000, current_price=1050)
    assert result["riskLevel"] == "low"
    assert result["score"] < 40


def test_fraud_check_high_risk():
    result = check_fraud("product", "123", avg_price=1000, current_price=5000)
    assert result["riskLevel"] == "high"
    assert result["score"] >= 70


def test_fraud_check_cancel_rate():
    result = check_fraud("supplier", "456", cancel_rate=0.5)
    assert result["riskLevel"] in ["medium", "high"]


def test_risk_score_low():
    result = calculate_risk_score("sup-1", cancel_rate=0.05, avg_delay_days=1, quality_rating=4.5, complaint_count=0, activity_months=24, total_transactions=20)
    assert result["riskLevel"] == "low"


def test_risk_score_high():
    result = calculate_risk_score("sup-2", cancel_rate=0.4, avg_delay_days=7, quality_rating=2, complaint_count=5, activity_months=2, total_transactions=1)
    assert result["riskLevel"] == "high"
    assert result["riskScore"] >= 70


def test_risk_score_factors():
    result = calculate_risk_score("sup-3")
    assert len(result["factors"]) == 6
    assert "recommendation" in result
