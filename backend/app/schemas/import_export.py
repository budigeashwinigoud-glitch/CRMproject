from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any


class DuplicateMatch(BaseModel):
    existingLeadId: str
    company: str
    fullName: str
    email: str
    phone: Optional[str] = ""
    matchReason: str
    confidence: str  # 'High' or 'Medium'


class DuplicateCheckRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    fullName: Optional[str] = Field(None, alias="fullName")

    class Config:
        populate_by_name = True


class DuplicateCheckResponse(BaseModel):
    isDuplicate: bool
    potentialMatches: List[DuplicateMatch]


class RowError(BaseModel):
    rowNumber: int
    field: Optional[str] = None
    message: str


class ImportReport(BaseModel):
    totalRows: int
    inserted: int
    updated: int
    skippedDuplicates: int
    rejectedErrors: int
    errors: List[RowError]
    duplicateWarnings: List[DuplicateMatch]
