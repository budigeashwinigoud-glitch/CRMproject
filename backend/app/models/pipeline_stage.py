from sqlalchemy import Column, String, Integer, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class PipelineStage(Base):
    __tablename__ = "pipeline_stages"

    id = Column(String(50), primary_key=True)  # e.g., 'New', 'Contacted', 'Qualified', etc.
    label = Column(String(100), nullable=False)
    display_order = Column(Integer, nullable=False, default=0, index=True)
    color = Column(String(20), default="#64748b")
    is_active = Column(Boolean, default=True, nullable=False)
    terminal_outcome = Column(String(20), nullable=True)  # 'WON', 'LOST', or None

    leads = relationship("Lead", back_populates="stage_rel")
