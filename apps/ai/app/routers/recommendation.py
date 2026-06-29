from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.services.recommendation import recommend_suppliers, recommend_products

router = APIRouter()


class SupplierRecommendationRequest(BaseModel):
    productName: str
    quantity: Optional[float] = None
    province: Optional[str] = None
    suppliersData: Optional[list] = None


@router.post("/recommend/suppliers")
async def recommend_suppliers_endpoint(req: SupplierRecommendationRequest):
    return recommend_suppliers(
        product_name=req.productName,
        quantity=req.quantity,
        province=req.province,
        suppliers_data=req.suppliersData or [],
    )


@router.get("/recommend/products")
async def recommend_products_endpoint(userId: str, productsData: Optional[list] = None):
    return recommend_products(user_id=userId, products_data=productsData or [])
