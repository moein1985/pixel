from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.models.fraud.anomaly_detector import check_fraud

router = APIRouter()


class FraudCheckRequest(BaseModel):
    targetType: str
    targetId: str
    avgPrice: Optional[float] = None
    currentPrice: Optional[float] = None
    cancelRate: Optional[float] = None
    profileCompleteness: Optional[float] = None


@router.post("/fraud/check")
async def fraud_check(req: FraudCheckRequest):
    return check_fraud(
        target_type=req.targetType,
        target_id=req.targetId,
        avg_price=req.avgPrice,
        current_price=req.currentPrice,
        cancel_rate=req.cancelRate,
        profile_completeness=req.profileCompleteness,
    )
