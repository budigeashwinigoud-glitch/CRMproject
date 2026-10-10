from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(String(50), primary_key=True)  # e.g., 'FU-201'
    lead_id = Column(String(50), ForeignKey("leads.id", ondelete="CASCADE"), nullable=True, index=True)
    lead_name = Column(String(150), nullable=True)
    company = Column(String(150), nullable=True)
    title = Column(String(200), nullable=False)
    type = Column(String(50), default="Call")  # 'Call', 'Meeting', 'Email', 'Task'
    due_date = Column(String(20), nullable=False, index=True)  # 'YYYY-MM-DD'
    due_time = Column(String(10), default="10:00")  # 'HH:MM'
    priority = Column(String(20), default="Medium")
    status = Column(String(30), default="Pending", index=True)  # 'Pending', 'Completed', 'Overdue'
    
    assigned_employee = Column(String(100), default="Ashwini Sharma", index=True)
    assigned_user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    
    notes = Column(Text, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    lead = relationship("Lead", back_populates="follow_ups")
    assigned_user = relationship("User", back_populates="follow_ups", foreign_keys=[assigned_user_id])
