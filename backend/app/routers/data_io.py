from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Response, status
from fastapi.responses import StreamingResponse
import io
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.lead import Lead
from app.models.user import User
from app.schemas.import_export import ImportReport
from app.services.import_export_service import (
    parse_csv_file,
    parse_excel_file,
    process_lead_import,
    export_leads_to_csv,
    export_leads_to_excel
)
from app.services.auth_service import get_current_user_optional, require_admin

router = APIRouter(prefix="", tags=["Data Import and Export"])


@router.post("/import/leads", response_model=ImportReport)
async def import_leads(
    file: UploadFile = File(...),
    dry_run: bool = Query(False, description="Preview / validate without committing to database"),
    update_duplicates: bool = Query(False, description="Update existing duplicate leads instead of skipping"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    filename = file.filename or ""
    lower_filename = filename.lower()
    if not (lower_filename.endswith(".csv") or lower_filename.endswith(".xlsx")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a .csv or .xlsx spreadsheet."
        )

    content = await file.read()
    if len(content) > 10 * 1024 * 1024:  # 10 MB limit
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed upload limit (10 MB)."
        )

    try:
        if lower_filename.endswith(".csv"):
            rows = parse_csv_file(content)
        else:
            rows = parse_excel_file(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse file: {str(e)}"
        )

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file contains no data rows."
        )

    performer = current_user.full_name if current_user else "Ashwini Sharma"
    report = process_lead_import(
        db=db,
        raw_rows=rows,
        dry_run=dry_run,
        update_duplicates=update_duplicates,
        performed_by=performer
    )
    return report


@router.get("/export/leads")
def export_leads(
    format: str = Query("csv", pattern="^(csv|xlsx)$"),
    stage: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    source: Optional[str] = Query(None),
    employee: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    query = db.query(Lead).filter(Lead.is_archived == False)

    if current_user and current_user.role.upper() == "EMPLOYEE":
        query = query.filter(Lead.assigned_employee == current_user.full_name)
    elif employee and employee != "All":
        query = query.filter(Lead.assigned_employee == employee)

    if stage and stage != "All":
        query = query.filter(Lead.pipeline_stage == stage)
    if priority and priority != "All":
        query = query.filter(Lead.priority == priority)
    if source and source != "All":
        query = query.filter(Lead.lead_source == source)

    leads = query.order_by(Lead.created_date.desc()).all()

    if format == "csv":
        csv_data = export_leads_to_csv(leads)
        return Response(
            content=csv_data,
            media_type="text/csv",
            headers={"Content-Disposition": 'attachment; filename="belvo_crm_leads.csv"'}
        )
    else:
        excel_bytes = export_leads_to_excel(leads)
        return Response(
            content=excel_bytes,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": 'attachment; filename="belvo_crm_leads.xlsx"'}
        )
