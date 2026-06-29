from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.models.price.predictor import generate_price_predictions, get_price_trend

router = APIRouter()


class PricePredictRequest(BaseModel):
    productName: str
    province: Optional[str] = None
    days: int = 7
    basePrice: Optional[float] = None


@router.post("/price/predict")
async def predict_price(req: PricePredictRequest):
    return generate_price_predictions(
        product_name=req.productName,
        province=req.province,
        days=req.days,
        base_price=req.basePrice or 1000000,
    )


@router.get("/price/trend")
async def price_trend(productName: str, province: Optional[str] = None, days: int = 30):
    return get_price_trend(productName, province, days)
