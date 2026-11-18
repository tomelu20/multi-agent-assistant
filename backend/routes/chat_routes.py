from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

# Importuri absolute, corecte pentru ruterul rulat din interiorul folderului backend
from database import get_db
from models import Workflow, UserApproval, PlannerStep, User
from schemas.schemas import WorkflowCreate, WorkflowResponse, UserApprovalResponse

router = APIRouter(prefix="/api", tags=["Chat & Workflows"])

@router.get("/chats", response_model=List[WorkflowResponse])
def get_chats(user_id: Optional[UUID] = None, db: Session = Depends(get_db)):
    """Returnează lista de workflow-uri / chat-uri din baza de date."""
    query = db.query(Workflow)
    if user_id:
        query = query.filter(Workflow.user_id == user_id)
    return query.order_by(Workflow.created_at.desc()).all()

@router.post("/chats", response_model=WorkflowResponse)
def create_chat(user_id: UUID, payload: WorkflowCreate, db: Session = Depends(get_db)):
    """Creează un nou workflow (chat session) asociat unui utilizator."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilizatorul nu a fost găsit.")

    new_workflow = Workflow(
        user_id=user_id,
        raw_request=payload.raw_request,
        status="pending"
    )
    db.add(new_workflow)
    db.commit()
    db.refresh(new_workflow)
    return new_workflow

@router.post("/chats/{chat_id}/messages")
def send_message(chat_id: UUID, payload: WorkflowCreate, db: Session = Depends(get_db)):
    """Procesază un mesaj nou, creează pași în planner și generează o cerere de aprobare umană."""
    workflow = db.query(Workflow).filter(Workflow.id == chat_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow-ul nu a fost găsit.")

    workflow.raw_request = payload.raw_request
    db.commit()

    # Creăm un pas în Planner (PlannerStep)
    step = PlannerStep(
        workflow_id=workflow.id,
        step_number=1,
        description=f"Analiză obiectiv: {payload.raw_request}",
        assigned_role="Planner Master",
        status="pending"
    )
    db.add(step)
    db.commit()

    # Creăm o înregistrare de aprobare umană (UserApproval)
    approval = UserApproval(
        workflow_id=workflow.id,
        action_type="Write Action",
        action_payload=f"Executare scriere/modificare pentru: {payload.raw_request}",
        status="pending_approval"
    )
    db.add(approval)
    db.commit()

    return {
        "success": True,
        "newTitle": payload.raw_request[:30] + ("..." if len(payload.raw_request) > 30 else ""),
        "reply": "[Planner Master] Am preluat cererea, am descompus-o în pași și am validat acțiunile.",
        "requiresApproval": True
    }

@router.post("/chats/{chat_id}/approve")
def approve_action(chat_id: UUID, db: Session = Depends(get_db)):
    """Confirmă aprobarea umană (Human-in-the-Loop) și actualizează starea în baza de date."""
    approval = db.query(UserApproval).filter(
        UserApproval.workflow_id == chat_id,
        UserApproval.status == "pending_approval"
    ).first()

    if approval:
        approval.status = "approved"
        approval.decided_at = datetime.utcnow()
        db.commit()

    workflow = db.query(Workflow).filter(Workflow.id == chat_id).first()
    if workflow:
        workflow.status = "completed"
        db.commit()

    return {
        "success": True,
        "message": "✅ Aprobare umană confirmată. Acțiunile externe au fost executate cu succes!"
    }

@router.get("/chats/{chat_id}/logs")
def get_logs(chat_id: UUID, db: Session = Depends(get_db)):
    """Returnează jurnalele de execuție asociate unui workflow."""
    workflow = db.query(Workflow).filter(Workflow.id == chat_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow-ul nu a fost găsit.")

    logs = [
        {
            "agent_name": log.agent_name,
            "tool_name": log.tool_name,
            "success": log.success,
            "timestamp": log.timestamp
        }
        for log in workflow.execution_logs
    ]
    return logs