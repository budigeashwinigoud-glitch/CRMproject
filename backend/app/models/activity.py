from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(50), primary_key=True)  # e.g., 'ACT-301'
    lead_id = Column(String(50), ForeignKey("leads.id", ondelete="CASCADE"), nullable=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    lead_name = Column(String(150), nullable=True)
    company = Column(String(150), nullable=True)
    type = Column(String(50), default="note")  # 'stage_change', 'note', 'lead_created', 'email', 'task'
    description = Column(Text, nullable=False)
    timestamp = Column(String(30), nullable=True)  # 'YYYY-MM-DD HH:MM'
    performed_by = Column(String(100), default="Pavan Kumar")
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="activities")
