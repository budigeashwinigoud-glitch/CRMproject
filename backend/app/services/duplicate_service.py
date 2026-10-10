import re
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.schemas.import_export import DuplicateMatch


def normalize_email(email: Optional[str]) -> str:
    if not email:
        return ""
    return email.strip().lower()


def normalize_phone(phone: Optional[str]) -> str:
    if not phone:
        return ""
    # Strip non-digits
    return re.sub(r"\D", "", phone)


def normalize_company(company: Optional[str]) -> str:
    if not company:
        return ""
    return company.strip().lower()


def check_lead_duplicates(
    db: Session,
    email: Optional[str] = None,
    phone: Optional[str] = None,
    company: Optional[str] = None,
    full_name: Optional[str] = None,
    exclude_lead_id: Optional[str] = None
) -> List[DuplicateMatch]:
    matches: List[DuplicateMatch] = []
    seen_ids = set()

    norm_email = normalize_email(email)
    norm_phone = normalize_phone(phone)
    norm_comp = normalize_company(company)
    norm_name = (full_name or "").strip().lower()

    leads_query = db.query(Lead).filter(Lead.is_archived == False)
    if exclude_lead_id:
        leads_query = leads_query.filter(Lead.id != exclude_lead_id)
    active_leads = leads_query.all()

    for lead in active_leads:
        lead_norm_email = normalize_email(lead.email)
        lead_norm_phone = normalize_phone(lead.phone)
        lead_norm_comp = normalize_company(lead.company)
        lead_norm_name = (lead.full_name or "").strip().lower()

        # 1. Exact Email match
        if norm_email and lead_norm_email and norm_email == lead_norm_email:
            if lead.id not in seen_ids:
                matches.append(DuplicateMatch(
                    existingLeadId=lead.id,
                    company=lead.company,
                    fullName=lead.full_name,
                    email=lead.email,
                    phone=lead.phone or "",
                    matchReason=f"Exact email match ({lead.email})",
                    confidence="High"
                ))
                seen_ids.add(lead.id)
                continue

        # 2. Normalized Phone match (if 8+ digits)
        if norm_phone and lead_norm_phone and len(norm_phone) >= 8 and norm_phone == lead_norm_phone:
            if lead.id not in seen_ids:
                matches.append(DuplicateMatch(
                    existingLeadId=lead.id,
                    company=lead.company,
                    fullName=lead.full_name,
                    email=lead.email,
                    phone=lead.phone or "",
                    matchReason=f"Identical phone number match ({lead.phone})",
                    confidence="High"
                ))
                seen_ids.add(lead.id)
                continue

        # 3. Company + Name match
        if norm_comp and lead_norm_comp and norm_comp == lead_norm_comp:
            if norm_name and lead_norm_name and norm_name == lead_norm_name:
                if lead.id not in seen_ids:
                    matches.append(DuplicateMatch(
                        existingLeadId=lead.id,
                        company=lead.company,
                        fullName=lead.full_name,
                        email=lead.email,
                        phone=lead.phone or "",
                        matchReason=f"Same contact name and company ({lead.company})",
                        confidence="High"
                    ))
                    seen_ids.add(lead.id)
                    continue

        # 4. Company match only
        if norm_comp and lead_norm_comp and norm_comp == lead_norm_comp:
            if lead.id not in seen_ids:
                matches.append(DuplicateMatch(
                    existingLeadId=lead.id,
                    company=lead.company,
                    fullName=lead.full_name,
                    email=lead.email,
                    phone=lead.phone or "",
                    matchReason=f"Existing enterprise account already registered ({lead.company})",
                    confidence="Medium"
                ))
                seen_ids.add(lead.id)

    return matches
