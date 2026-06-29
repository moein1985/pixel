import pytest
from app.models.nlp.chatbot_engine import classify_intent, extract_entities, generate_response, normalize_text


def test_normalize_text():
    assert normalize_text("كلمه") == "کلمه"
    assert normalize_text("ي") == "ی"
    assert normalize_text("۱۲۳") == "123"
    assert normalize_text("سلام  دنیا") == "سلام دنیا"


def test_classify_intent_search():
    assert classify_intent("قیمت گندم چنده؟") == "get_price"


def test_classify_intent_supplier():
    assert classify_intent("تامین کننده کود اوره در خراسان") == "find_supplier"


def test_classify_intent_general():
    assert classify_intent("سلام") == "general"


def test_extract_entities_product():
    entities = extract_entities("قیمت گندم چنده؟")
    assert "گندم" in entities["products"]


def test_extract_entities_province():
    entities = extract_entities("تامین کننده در خراسان")
    assert "خراسان" in entities["provinces"]


def test_extract_entities_quantity():
    entities = extract_entities("۵ تن کود می‌خوام")
    assert entities["quantity"] is not None


def test_generate_response():
    result = generate_response("get_price", {"products": ["گندم"], "provinces": [], "quantity": None, "unit": None})
    assert "response" in result
    assert "intent" in result
    assert "suggestions" in result
    assert result["intent"] == "get_price"
