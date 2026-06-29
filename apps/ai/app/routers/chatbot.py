from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.models.nlp.chatbot_engine import classify_intent, extract_entities, generate_response

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    userId: Optional[str] = None
    context: Optional[dict] = None


@router.post("/chatbot/message")
async def chat_message(msg: ChatMessage):
    intent = classify_intent(msg.message)
    entities = extract_entities(msg.message)
    result = generate_response(intent, entities)
    return result


@router.get("/chatbot/suggestions")
async def get_suggestions(userId: Optional[str] = None):
    return {
        "suggestions": [
            "قیمت گندم چنده؟",
            "تأمین‌کننده کود اوره در خراسان",
            "وضعیت بازار پنبه چطوره؟",
            "۵ تن کود می‌خوام",
            "بهترین زمان کاشت گندم کیه؟",
        ]
    }
