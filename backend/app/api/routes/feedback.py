"""Feedback routes — anyone can submit, only admin can list/triage."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.database import get_db
from app.models.feedback import Feedback

router = APIRouter()

CATEGORIES = ("bug", "data", "suggestion")


class FeedbackIn(BaseModel):
    category: str = Field(default="bug", max_length=32)
    message: str = Field(min_length=5, max_length=2000)
    page_url: str | None = Field(default=None, max_length=256)
    contact: str | None = Field(default=None, max_length=128)


@router.post("/feedback", status_code=201)
def submit_feedback(body: FeedbackIn, db: Session = Depends(get_db)):
    category = body.category if body.category in CATEGORIES else "bug"
    fb = Feedback(category=category, message=body.message.strip(),
                  page_url=body.page_url, contact=body.contact)
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return {"id": fb.id, "status": fb.status}


@router.get("/feedback")
def list_feedback(status: str | None = None, db: Session = Depends(get_db),
                  admin=Depends(require_role("admin"))):
    q = db.query(Feedback).order_by(Feedback.created_at.desc()).limit(100)
    if status:
        q = q.filter(Feedback.status == status.upper())
    return [{"id": f.id, "category": f.category, "message": f.message,
             "page_url": f.page_url, "contact": f.contact, "status": f.status,
             "created_at": str(f.created_at)} for f in q.all()]


@router.post("/feedback/{feedback_id}/resolve")
def resolve_feedback(feedback_id: int, db: Session = Depends(get_db),
                     admin=Depends(require_role("admin"))):
    fb = db.get(Feedback, feedback_id)
    if not fb:
        raise HTTPException(404, "Feedback not found")
    fb.status = "RESOLVED"
    db.commit()
    return {"id": fb.id, "status": fb.status}
