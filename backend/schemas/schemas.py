from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, field_validator


class UserBase(BaseModel):
    name: str = Field(..., max_length=100)
    surname: str = Field(..., max_length=100)
    email: str = Field(..., max_length=100)
    phone_number: str = Field(..., max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserResponse(UserBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkflowCreate(BaseModel):
    raw_request: str


class WorkflowResponse(BaseModel):
    id: UUID
    user_id: UUID
    raw_request: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PlannerStepResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    step_number: int
    description: str
    assigned_role: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExecutionLogResponse(BaseModel):
    id: UUID
    step_id: Optional[UUID]
    agent_name: str
    tool_name: str
    input_payload: Optional[str] = None
    output_payload: Optional[str] = None
    latency_ms: Optional[int] = None
    approx_cost: Optional[float] = None
    success: bool
    timestamp: datetime

    class Config:
        from_attributes = True


class UserApprovalCreate(BaseModel):
    action_type: str
    action_payload: str


class UserApprovalUpdate(BaseModel):
    status: str


class UserApprovalResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    action_type: str
    action_payload: str
    status: str
    decided_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserMemoryCreate(BaseModel):
    memory_type: str
    key: str = Field(..., alias="KEY")
    value: str

    class Config:
        populate_by_name = True


class UserMemoryResponse(BaseModel):
    id: UUID
    user_id: UUID
    memory_type: str
    key: str = Field(..., serialization_alias="KEY")
    value: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class EmailRequest(BaseModel):
    email: EmailStr


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str


# Scheme pentru Calendar adaptate pentru UUID și formatul românesc DD-MM-YYYY
class CalendarEventBase(BaseModel):
    title: str = Field(..., max_length=200)
    date: str = Field(..., max_length=10)  # Format: DD-MM-YYYY (ex: 15-11-2026)
    time: str = Field(..., max_length=20)  # Format: HH:MM sau "All Day"

    @field_validator("title")
    @classmethod
    def validate_title(cls, value: str) -> str:
        title = value.strip()
        if not title:
            raise ValueError("Titlul evenimentului nu poate fi gol.")
        return title

    @field_validator("date")
    @classmethod
    def validate_date(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%d-%m-%Y")
        except ValueError as error:
            raise ValueError("Data trebuie să fie validă și în formatul DD-MM-YYYY.") from error
        return value

    @field_validator("time")
    @classmethod
    def validate_time(cls, value: str) -> str:
        if value == "All Day":
            return value
        try:
            datetime.strptime(value, "%H:%M")
        except ValueError as error:
            raise ValueError("Ora trebuie să fie în formatul HH:MM sau «All Day».") from error
        return value


class CalendarEventCreate(CalendarEventBase):
    workflow_id: Optional[UUID] = None


class CalendarEventResponse(CalendarEventBase):
    id: UUID                                # Corectat la UUID conform bazei de date SQL Server
    user_id: UUID
    workflow_id: Optional[UUID] = None

    date: str = Field(validation_alias="event_date")
    time: str = Field(validation_alias="event_time")

    class Config:
        from_attributes = True