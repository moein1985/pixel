from fastapi import FastAPI
from app.routers import health, chatbot, price_prediction, image_recognition, fraud_detection, risk_analysis, recommendation

app = FastAPI(
    title="Pixel AI Service",
    description="سرویس هوش مصنوعی پیکسل — چت‌بات، پیش‌بینی قیمت، تشخیص تصویر، تشخیص تقلب",
    version="1.0.0",
)

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(chatbot.router, prefix="/api", tags=["chatbot"])
app.include_router(price_prediction.router, prefix="/api", tags=["price"])
app.include_router(image_recognition.router, prefix="/api", tags=["vision"])
app.include_router(fraud_detection.router, prefix="/api", tags=["fraud"])
app.include_router(risk_analysis.router, prefix="/api", tags=["risk"])
app.include_router(recommendation.router, prefix="/api", tags=["recommend"])


@app.get("/")
async def root():
    return {
        "name": "Pixel AI Service",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": [
            "/api/health",
            "/api/chatbot/message",
            "/api/chatbot/suggestions",
            "/api/price/predict",
            "/api/price/trend",
            "/api/vision/classify",
            "/api/vision/detect-disease",
            "/api/fraud/check",
            "/api/risk/supplier",
            "/api/recommend/suppliers",
            "/api/recommend/products",
        ],
    }
