from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.models.fraud.anomaly_detector import calculate_risk_score

router = APIRouter()


class RiskAnalysisRequest(BaseModel):
    supplierId: str
    cancelRate: float = 0
    avgDelayDays: float = 0
    qualityRating: float = 5
    complaintCount: int = 0
    activityMonths: int = 12
    totalTransactions: int = 0


@router.get("/risk/supplier")
async def supplier_risk(
    supplierId: str,
    cancelRate: float = 0,
    avgDelayDays: float = 0,
    qualityRating: float = 5,
    complaintCount: int = 0,
    activityMonths: int = 12,
    totalTransactions: int = 0,
):
    return calculate_risk_score(
        supplier_id=supplierId,
        cancel_rate=cancelRate,
        avg_delay_days=avgDelayDays,
        quality_rating=qualityRating,
        complaint_count=complaintCount,
        activity_months=activityMonths,
        total_transactions=totalTransactions,
    )


@router.post("/risk/supplier")
async def supplier_risk_post(req: RiskAnalysisRequest):
    return calculate_risk_score(
        supplier_id=req.supplierId,
        cancel_rate=req.cancelRate,
        avg_delay_days=req.avgDelayDays,
        quality_rating=req.qualityRating,
        complaint_count=req.complaintCount,
        activity_months=req.activityMonths,
        total_transactions=req.totalTransactions,
    )
