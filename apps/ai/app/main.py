from fastapi import FastAPI
from app.routers import health

app = FastAPI(
    title="Pixel AI Service",
    description="سرویس هوش مصنوعی پیکسل — چت‌بات، پیش‌بینی قیمت، تشخیص تصویر",
    version="0.0.0",
)

app.include_router(health.router, prefix="/api", tags=["health"])


@app.get("/")
async def root():
    return {
        "name": "Pixel AI Service",
        "version": "0.0.0",
        "docs": "/docs",
    }
