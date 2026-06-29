from fastapi import APIRouter, UploadFile, File
from typing import Optional
from app.models.vision.product_classifier import classify_product, detect_disease

router = APIRouter()


@router.post("/vision/classify")
async def classify_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    return classify_product(image_bytes)


@router.post("/vision/detect-disease")
async def detect_disease_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    return detect_disease(image_bytes)
