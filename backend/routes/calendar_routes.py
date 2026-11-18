from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database import get_db
from config import settings
from models import CalendarEvent, User, Workflow
from schemas.schemas import CalendarEventCreate, CalendarEventResponse

router = APIRouter(prefix="/calendar", tags=["Calendar"])
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autentificarea este necesară pentru calendar.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        user_id = UUID(payload["sub"])
    except (JWTError, KeyError, TypeError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autentificare invalid sau expirat.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilizatorul autentificat nu mai există.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.get("/events", response_model=List[CalendarEventResponse])
def get_calendar_events(
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user),
):
    events = (
        db.query(CalendarEvent)
        .filter(CalendarEvent.user_id == current_user.id)
        .order_by(CalendarEvent.event_date, CalendarEvent.event_time) # <- Modificat aici
        .all()
    )
    return events


@router.post("/events", response_model=CalendarEventResponse, status_code=status.HTTP_201_CREATED)
def create_calendar_event(
    event_data: CalendarEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if event_data.workflow_id is not None:
        workflow = (
            db.query(Workflow)
            .filter(
                Workflow.id == event_data.workflow_id,
                Workflow.user_id == current_user.id,
            )
            .first()
        )
        if workflow is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workflow-ul nu a fost găsit.",
            )

    new_event = CalendarEvent(
        title=event_data.title,
        event_date=event_data.date,
        event_time=event_data.time,
        event_end_time=event_data.end_time,
        user_id=current_user.id,
        workflow_id=event_data.workflow_id,
    )

    db.add(new_event)
    db.commit()
    db.refresh(new_event)

    return new_event


@router.delete("/events/{event_id}", status_code=status.HTTP_200_OK)
def delete_calendar_event(
    event_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = (
        db.query(CalendarEvent)
        .filter(
            CalendarEvent.id == event_id,
            CalendarEvent.user_id == current_user.id,
        )
        .first()
    )

    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Evenimentul nu a fost găsit în calendar.",
        )

    db.delete(event)
    db.commit()

    return {"message": "Evenimentul a fost șters cu succes din calendar."}