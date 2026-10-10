from pydantic import BaseModel
from typing import Optional


class PipelineStageBase(BaseModel):
    id: str
    label: str
    display_order: int = 0
    color: str = "#64748b"
    is_active: bool = True
    terminal_outcome: Optional[str] = None  # 'WON', 'LOST', or None


class PipelineStageCreate(PipelineStageBase):
    pass


class PipelineStageUpdate(BaseModel):
    label: Optional[str] = None
    display_order: Optional[int] = None
    color: Optional[str] = None
    is_active: Optional[bool] = None
    terminal_outcome: Optional[str] = None


class PipelineStageResponse(PipelineStageBase):
    class Config:
        from_attributes = True
