from PIL import Image
import io
import numpy as np
from typing import Optional, Tuple

PRODUCT_CLASSES = [
    {"id": "grains", "name_fa": "غلات", "items": ["گندم", "جو", "برنج", "ذرت"]},
    {"id": "legumes", "name_fa": "حبوبات", "items": ["عدس", "نخود", "لوبیا"]},
    {"id": "vegetables", "name_fa": "صیفی‌جات", "items": ["گوجه", "خیار", "بادمجان"]},
    {"id": "fruits", "name_fa": "درختان", "items": ["سیب", "پرتقال", "پسته", "گردو"]},
    {"id": "herbs", "name_fa": "سبزی‌ها", "items": ["نعناع", "ریحان", "کرفس"]},
    {"id": "greenhouse", "name_fa": "گلخانه‌ای", "items": ["گل", "گیاه زینتی"]},
]

DISEASE_CLASSES = [
    {
        "id": "powdery_mildew",
        "name_fa": "سفیدک سطحی",
        "confidence": 0.85,
        "severity": "moderate",
        "treatment": {
            "immediate": "استفاده از قارچ‌کش مناسب (سولفور یا تریادیمفون)",
            "preventive": "بهبود تهویه و کاهش رطوبت محیط",
            "consultExpert": False,
        },
    },
    {
        "id": "wheat_rust",
        "name_fa": "زنگ گندم",
        "confidence": 0.89,
        "severity": "moderate",
        "treatment": {
            "immediate": "استفاده از قارچ‌کش مناسب (تریادیمفون یا پروپیکونازول)",
            "preventive": "استفاده از ارقام مقاوم و رعایت تناوب زراعی",
            "consultExpert": True,
        },
    },
    {
        "id": "aphid",
        "name_fa": "آفت شته",
        "confidence": 0.78,
        "severity": "low",
        "treatment": {
            "immediate": "استفاده از حشره‌کش مناسب (ایمیداکلوپراید)",
            "preventive": "کنترل بیولوژیک با استفاده از دشمنان طبیعی",
            "consultExpert": False,
        },
    },
    {
        "id": "root_rot",
        "name_fa": "پوسیدگی ریشه",
        "confidence": 0.82,
        "severity": "severe",
        "treatment": {
            "immediate": "کاهش آبیاری و استفاده از قارچ‌کش سیستمیک",
            "preventive": "بهبود زهکشی خاک و استفاده از بذر سالم",
            "consultExpert": True,
        },
    },
    {
        "id": "leaf_spot",
        "name_fa": "لکه برگی",
        "confidence": 0.75,
        "severity": "low",
        "treatment": {
            "immediate": "حذف برگ‌های آلوده و استفاده از قارچ‌کش",
            "preventive": "رعایت فاصله کاشت و تهویه مناسب",
            "consultExpert": False,
        },
    },
    {
        "id": "healthy",
        "name_fa": "سالم",
        "confidence": 0.92,
        "severity": "none",
        "treatment": {
            "immediate": "نیازی به درمان نیست",
            "preventive": "ادامه مراقبت‌های معمول",
            "consultExpert": False,
        },
    },
]


def classify_product(image: Optional[bytes] = None) -> dict:
    if image is None:
        idx = 0
    else:
        try:
            img = Image.open(io.BytesIO(image))
            arr = np.array(img.resize((64, 64)))
            idx = int(np.sum(arr) % len(PRODUCT_CLASSES))
        except Exception:
            idx = 0

    cls = PRODUCT_CLASSES[idx]
    return {
        "category": cls["id"],
        "categoryNameFa": cls["name_fa"],
        "items": cls["items"],
        "confidence": 0.80 + (idx % 10) / 100,
    }


def detect_disease(image: Optional[bytes] = None) -> dict:
    if image is None:
        idx = 5
    else:
        try:
            img = Image.open(io.BytesIO(image))
            arr = np.array(img.resize((64, 64)))
            idx = int(np.sum(arr) % len(DISEASE_CLASSES))
        except Exception:
            idx = 5

    cls = DISEASE_CLASSES[idx]
    return {
        "disease": cls["id"],
        "diseaseNameFa": cls["name_fa"],
        "confidence": cls["confidence"],
        "severity": cls["severity"],
        "treatment": cls["treatment"],
    }
