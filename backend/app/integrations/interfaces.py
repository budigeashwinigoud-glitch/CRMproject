"""
Belvo CRM External Integration Interfaces
========================================
Modular abstractions for external providers and AI/ML model integration.
Teammate Thrija (AI/ML) and external connectors can extend these abstract base classes
without altering the core CRM database schemas or REST API contracts.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel


# 1. AI / ML Lead Scoring & Recommendation Interface (For Teammate Thrija)
class AIScoreResult(BaseModel):
    lead_id: str
    ai_score: int  # 0 to 100
    ai_summary: str
    recommended_stage: Optional[str] = None
    suggested_actions: List[str] = []
    confidence: float = 0.85


class BaseAIScoringProvider(ABC):
    @abstractmethod
    def predict_lead_score(self, lead_data: Dict[str, Any]) -> AIScoreResult:
        """Evaluate B2B lead profile attributes and predict deal propensity."""
        pass


class DefaultHeuristicAIProvider(BaseAIScoringProvider):
    """Clean baseline heuristic provider before Thrija connects external ML model."""
    def predict_lead_score(self, lead_data: Dict[str, Any]) -> AIScoreResult:
        score = 65
        source = lead_data.get("leadSource", "")
        if source in ["Referral", "Partner"]:
            score += 20
        elif source == "Inbound":
            score += 15
        elif source == "LinkedIn":
            score += 10

        priority = lead_data.get("priority", "")
        if priority == "High":
            score += 10
        elif priority == "Low":
            score -= 10

        score = max(10, min(99, score))
        return AIScoreResult(
            lead_id=lead_data.get("id", ""),
            ai_score=score,
            ai_summary=f"Automated heuristic score based on {source} channel and {priority} priority level.",
            recommended_stage="Qualified" if score > 75 else "Contacted",
            suggested_actions=["Schedule technical discovery call", "Provide LatAm sandbox documentation"]
        )


# 2. Webhook & Messaging Interfaces (WhatsApp, Email, Calendar, Meta Lead Ads)
class BaseMessagingConnector(ABC):
    @abstractmethod
    def send_notification(self, recipient: str, message: str) -> bool:
        pass


class BaseWebhookReceiver(ABC):
    @abstractmethod
    def verify_signature(self, payload: bytes, signature_header: str, secret: str) -> bool:
        pass

    @abstractmethod
    def parse_payload_to_lead(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        pass
