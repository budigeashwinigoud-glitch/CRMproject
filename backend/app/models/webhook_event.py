from sqlalchemy import Column, String, DateTime, Text, func
from app.database import Base


class ProcessedWebhookEvent(Base):
    __tablename__ = "processed_webhook_events"

    id = Column(String(100), primary_key=True)  # e.g., 'meta_leadgen_12345678' or 'wa_msg_98765'
    provider = Column(String(50), nullable=False, index=True)  # 'Meta', 'WhatsApp', 'Website'
    payload_hash = Column(String(64), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
