from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from uuid import UUID
from typing import Optional, List

class UserBase(BaseModel):
    name: str = Field(..., max_length=100)
    surname: str  = Field(..., max_length=100)
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
    step_id : Optional[UUID]
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
    key:str = Field(..., serialization_alias="KEY")
    value: str
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
