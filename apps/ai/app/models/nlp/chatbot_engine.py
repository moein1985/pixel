import re
import unicodedata

ARABIC_TO_PERSIAN = {
    "ي": "ی",
    "ك": "ک",
    "أ": "ا",
    "إ": "ا",
    "آ": "ا",
    "ة": "ه",
}

PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹"
ENGLISH_DIGITS = "0123456789"


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKC", text)
    for ar, fa in ARABIC_TO_PERSIAN.items():
        text = text.replace(ar, fa)
    trans = str.maketrans(PERSIAN_DIGITS, ENGLISH_DIGITS)
    text = text.translate(trans)
    text = re.sub(r"\u200c", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().lower()


PRODUCT_KEYWORDS = [
    "گندم", "جو", "برنج", "ذرت", "عدس", "نخود", "لوبیا", "گوجه", "خیار", "بادمجان",
    "سیب", "پرتقال", "پسته", "گردو", "نعناع", "ریحان", "کرفس", "بذر", "کود", "سم",
    "اوره", "فاسفات", "ماشین", "تراکتور", "دریل", "سموم", "آفت", "سبزی", "پیاز",
    "سیب‌زمینی", "هویج", "فلفل", "خربزه", "طالبی", "هندوانه", "انگور", "زیتون",
    "چای", "پنبه", "آفتابگردان", "سویا", "کلزا", "افلatoon", "یونجه", "esch",
]

PROVINCE_KEYWORDS = [
    "تهران", "خراسان", "اصفهان", "فارس", "آذربایجان", "گیلان", "مازندران", "گلستان",
    "کرمان", "سیستان", "بلوچستان", "همدان", "کرمانشاه", "کردستان", "لرستان",
    "خوزستان", "بوشهر", "هرمزگان", "چهارمحال", "بختیاری", "کهگیلویه", "بویراحمد",
    "زنجان", "قزوین", "سمنان", "دامغان", "شهرکرد", "اردبیل", "ایلام", "البرز",
]


def extract_entities(text: str) -> dict:
    normalized = normalize_text(text)
    products = []
    provinces = []

    for kw in PRODUCT_KEYWORDS:
        if normalize_text(kw) in normalized:
            products.append(kw)

    for kw in PROVINCE_KEYWORDS:
        if normalize_text(kw) in normalized:
            provinces.append(kw)

    quantity_match = re.search(r"(\d+(?:\.\d+)?)\s*(تن|کیلو|گرم|کیلوگرم|تن|ton|kg)", normalized)
    quantity = None
    unit = None
    if quantity_match:
        quantity = float(quantity_match.group(1))
        unit = quantity_match.group(2)

    return {
        "products": list(set(products)),
        "provinces": list(set(provinces)),
        "quantity": quantity,
        "unit": unit,
    }


INTENT_TEMPLATES = {
    "search_product": [
        "میخوام خرید کنم", "خرید", "فروش", "قیمت", "نرخ", "به چه قیمت", "چند است",
        "کجا پیدا کنم", "در دسترس", "موجود", "محصول", "کالا",
    ],
    "get_price": [
        "قیمت", "نرخ", "به چه قیمت", "چند است", "گران", "ارزان", "نرخ روز",
    ],
    "find_supplier": [
        "تامین کننده", "فروشنده", "خریدار", "کجا بفروشم", "کجا بخرم", "چه کسی فروشنده",
    ],
    "get_market_info": [
        "بازار", "وضعیت بازار", "روند", "تحلیل", "آمار", "گزارش بازار",
    ],
    "create_rfq": [
        "درخواست خرید", "rfq", "استعلام", "پیشنهاد قیمت", "من میخوام بخرم",
    ],
    "ask_advice": [
        "مشاوره", "توصیه", "بهترین زمان", "چطور", "چگونه", "راهنمایی", "پیشنهاد",
    ],
}


def classify_intent(text: str) -> str:
    normalized = normalize_text(text)
    scores = {}
    for intent, templates in INTENT_TEMPLATES.items():
        score = 0
        for template in templates:
            if normalize_text(template) in normalized:
                score += 1
        scores[intent] = score

    best_intent = max(scores, key=scores.get)
    if scores[best_intent] == 0:
        return "general"
    return best_intent


INTENT_RESPONSES = {
    "search_product": "برای جستجوی محصول به صفحه بازار مراجعه کنید. محصولات موجود در دسته‌بندی‌های مختلف قابل بررسی هستند.",
    "get_price": "قیمت‌های روز بازار در صفحه گزارش بازار قابل مشاهده است. می‌توانید نام محصول و استان را مشخص کنید.",
    "find_supplier": "برای یافتن تأمین‌کننده، به صفحه تأمین‌کنندگان مراجعه کنید و بر اساس استان و دسته‌بندی فیلتر کنید.",
    "get_market_info": "گزارش‌های بازار شامل تحلیل قیمت، عرضه و تقاضا، و روند فصلی است. به صفحه گزارشات مراجعه کنید.",
    "create_rfq": "برای ثبت درخواست خرید (RFQ)، به داشبورد خود مراجعه کنید و فرم RFQ را تکمیل کنید.",
    "ask_advice": "برای مشاوره تخصصی، می‌توانید سوال خود را دقیق‌تر بپرسید یا با کارشناسان شبکه کشاورزان در ارتباط باشید.",
    "general": "سلام! من دستیار هوشمند پیکسل هستم. می‌توانم در جستجوی محصولات، استعلام قیمت، یافتن تأمین‌کننده و ثبت درخواست خرید به شما کمک کنم.",
}


def generate_response(intent: str, entities: dict) -> dict:
    base_response = INTENT_RESPONSES.get(intent, INTENT_RESPONSES["general"])

    if entities["products"]:
        base_response += f" محصول شناسایی‌شده: {', '.join(entities['products'])}."
    if entities["provinces"]:
        base_response += f" استان: {', '.join(entities['provinces'])}."
    if entities["quantity"]:
        base_response += f" مقدار: {entities['quantity']} {entities['unit']}."

    suggestions = []
    if intent == "search_product":
        suggestions = ["مشاهده بازار", "جستجوی تأمین‌کننده", "استعلام قیمت"]
    elif intent == "get_price":
        suggestions = ["گزارش بازار", "پیش‌بینی قیمت", "مشاهده محصولات"]
    elif intent == "find_supplier":
        suggestions = ["لیست تأمین‌کنندگان", "ثبت RFQ", "بازار"]
    elif intent == "create_rfq":
        suggestions = ["ثبت درخواست خرید", "مشاهده محصولات", "جستجوی تأمین‌کننده"]
    elif intent == "ask_advice":
        suggestions = ["شبکه کشاورزان", "مقالات آموزشی", "مشاوره تخصصی"]
    else:
        suggestions = ["جستجوی محصول", "استعلام قیمت", "یافتن تأمین‌کننده"]

    return {
        "response": base_response,
        "intent": intent,
        "suggestions": suggestions,
        "entities": entities,
    }
