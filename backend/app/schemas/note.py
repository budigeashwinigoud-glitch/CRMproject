from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NoteCreate(BaseModel):
    content: str
    author_name: Optional[str] = Field("Pavan Kumar", alias="authorName")

    class Config:
        populate_by_name = True


class NoteResponse(BaseModel):
    id: int
    leadId: str
    authorId: Optional[int] = None
    authorName: str
    content: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None

    @classmethod
    def from_orm_model(cls, note):
        return cls(
            id=note.id,
            leadId=note.lead_id,
            authorId=note.author_id,
            authorName=note.author_name or "Belvo User",
            content=note.content,
            createdAt=note.created_at,
            updatedAt=note.updated_at
        )

    class Config:
        from_attributes = True
