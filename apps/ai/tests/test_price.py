import pytest
from app.models.price.predictor import generate_price_predictions, get_price_trend


def test_price_prediction_basic():
    result = generate_price_predictions("گندم", days=7)
    assert len(result["predictions"]) == 7
    assert "price" in result["predictions"][0]
    assert "date" in result["predictions"][0]
    assert "lower" in result["predictions"][0]
    assert "upper" in result["predictions"][0]


def test_price_prediction_with_province():
    result = generate_price_predictions("جو", province="خراسان", days=14)
    assert result["province"] == "خراسان"
    assert len(result["predictions"]) == 14


def test_price_prediction_confidence():
    result = generate_price_predictions("برنج", days=7)
    assert 0.5 <= result["confidence"] <= 0.95


def test_price_trend():
    result = get_price_trend("ذرت", days=30)
    assert "trend" in result
    assert result["trend"] in ["increasing", "decreasing", "stable"]
    assert "changePct" in result
