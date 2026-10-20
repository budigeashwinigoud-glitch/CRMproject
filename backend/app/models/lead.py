from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(50), primary_key=True)  # e.g., 'LEAD-101'
    full_name = Column(String(150), nullable=False, index=True)
    company = Column(String(150), nullable=False, index=True)
    email = Column(String(150), nullable=False, index=True)
    phone = Column(String(50), nullable=True, index=True)
    lead_source = Column(String(50), default="Website", index=True)
    lead_category = Column(String(100), default="Enterprise Banking")
    priority = Column(String(20), default="Medium", index=True)
    pipeline_stage = Column(String(50), ForeignKey("pipeline_stages.id"), default="New", index=True)
    
    assigned_employee = Column(String(100), default="Ashwini Sharma", index=True)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    expected_value = Column(Float, default=0.0)
    currency = Column(String(10), default="USD")
    notes = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    location = Column(String(150), nullable=True)
    
    created_date = Column(String(20), nullable=True)  # 'YYYY-MM-DD'
    next_follow_up_date = Column(String(20), nullable=True)  # 'YYYY-MM-DD'
    
    ai_score = Column(Integer, default=75)
    ai_summary = Column(Text, nullable=True)
    conversion_probability = Column(Float, nullable=True)
    ai_model_version = Column(String(50), nullable=True)
    ai_scored_at = Column(DateTime, nullable=True)
    
    is_archived = Column(Boolean, default=False, index=True)
    archived_at = Column(DateTime, nullable=True)
    last_contacted_at = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now(), server_default=func.now())

    # Relationships
    assigned_user = relationship("User", back_populates="leads", foreign_keys=[assigned_user_id])
    stage_rel = relationship("PipelineStage", back_populates="leads")
    follow_ups = relationship("FollowUp", back_populates="lead", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="lead", cascade="all, delete-orphan")
    lead_notes = relationship("Note", back_populates="lead", cascade="all, delete-orphan")
