from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.pipeline_stage import PipelineStage
from app.models.lead import Lead
from app.models.user import User
from app.schemas.pipeline_stage import (
    PipelineStageCreate,
    PipelineStageUpdate,
    PipelineStageResponse
)
from app.services.auth_service import get_current_user_optional, require_admin

router = APIRouter(prefix="/pipeline", tags=["Pipeline Stages"])


@router.get("/stages", response_model=List[PipelineStageResponse])
def get_pipeline_stages(db: Session = Depends(get_db)):
    stages = db.query(PipelineStage).filter(PipelineStage.is_active == True).order_by(PipelineStage.display_order).all()
    return [PipelineStageResponse.model_validate(s) for s in stages]


@router.post("/stages", response_model=PipelineStageResponse, status_code=status.HTTP_201_CREATED)
def create_pipeline_stage(
    stage_in: PipelineStageCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    existing = db.query(PipelineStage).filter(PipelineStage.id == stage_in.id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stage with ID '{stage_in.id}' already exists."
        )

    stage = PipelineStage(
        id=stage_in.id,
        label=stage_in.label,
        display_order=stage_in.display_order,
        color=stage_in.color,
        is_active=stage_in.is_active,
        terminal_outcome=stage_in.terminal_outcome
    )
    db.add(stage)
    db.commit()
    db.refresh(stage)
    return PipelineStageResponse.model_validate(stage)


@router.patch("/stages/{stage_id}", response_model=PipelineStageResponse)
def update_pipeline_stage(
    stage_id: str,
    stage_in: PipelineStageUpdate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stage = db.query(PipelineStage).filter(PipelineStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail=f"Stage '{stage_id}' not found.")

    if stage_in.label is not None:
        stage.label = stage_in.label
    if stage_in.display_order is not None:
        stage.display_order = stage_in.display_order
    if stage_in.color is not None:
        stage.color = stage_in.color
    if stage_in.is_active is not None:
        stage.is_active = stage_in.is_active
    if stage_in.terminal_outcome is not None:
        stage.terminal_outcome = stage_in.terminal_outcome

    db.commit()
    db.refresh(stage)
    return PipelineStageResponse.model_validate(stage)


@router.delete("/stages/{stage_id}", status_code=status.HTTP_200_OK)
def delete_pipeline_stage(
    stage_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    stage = db.query(PipelineStage).filter(PipelineStage.id == stage_id).first()
    if not stage:
        raise HTTPException(status_code=404, detail=f"Stage '{stage_id}' not found.")

    # Safety check: prevent deleting stage if active leads are in it
    active_leads_in_stage = db.query(Lead).filter(
        Lead.pipeline_stage == stage_id,
        Lead.is_archived == False
    ).count()
    if active_leads_in_stage > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete stage '{stage_id}': {active_leads_in_stage} active lead(s) currently occupy it. Reassign leads first."
        )

    db.delete(stage)
    db.commit()
    return {"success": True, "message": f"Stage '{stage_id}' successfully removed."}
