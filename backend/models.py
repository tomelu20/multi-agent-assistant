import uuid
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.mssql import UNIQUEIDENTIFIER
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    surname = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False)
    phone_number = Column(String(100), nullable=False)
    password_hash = Column(String(100), nullable=False)
    created_at = Column(DateTime, nullable=False, server_default=func.sysdatetime())
    updated_at = Column(DateTime, nullable=False, server_default=func.sysdatetime(), onupdate=func.sysdatetime())

    workflows = relationship("Workflow", back_populates="user", cascade="all, delete")
    memories = relationship("UserMemory", back_populates="user", cascade="all, delete")

class Workflow(Base):
    __tablename__ = 'workflows'

    id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    user_id = Column(UNIQUEIDENTIFIER, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    raw_request = Column(Text, nullable=False)
    status = Column(String(100), nullable=False, default='pending')
    created_at = Column(DateTime, nullable=False, server_default=func.sysdatetime())
    updated_at = Column(DateTime, nullable=False, server_default=func.sysdatetime(), onupdate=func.sysdatetime())

    user = relationship("User", back_populates="workflows")
    planner_steps = relationship("PlannerStep", back_populates="workflow", cascade="all, delete")
    execution_logs = relationship("ExecutionLog", back_populates="workflow", cascade="all, delete")
    user_approvals = relationship("UserApproval", back_populates="workflow", cascade="all, delete")

class PlannerStep(Base):
    __tablename__ = 'planner_steps'

    id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UNIQUEIDENTIFIER, ForeignKey('workflows.id', ondelete="CASCADE"), nullable=False)
    step_number = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    assigned_role = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False, default='pending')
    created_at = Column(DateTime, nullable=False, server_default=func.sysdatetime())

    workflow = relationship("Workflow", back_populates="planner_steps")
    execution_logs = relationship("ExecutionLog",back_populates="planner_step")

class ExecutionLog(Base):
    __tablename__ = 'execution_logs'

    id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UNIQUEIDENTIFIER, ForeignKey("workflows.id", ondelete="CASCADE"), nullable=False)
    step_id = Column(UNIQUEIDENTIFIER, ForeignKey("planner_steps.id", ondelete="NO ACTION"), nullable=True)
    agent_name = Column(String(50), nullable=False)
    tool_name = Column(String(100), nullable=False)
    input_payload = Column(Text, nullable=True)
    output_payload = Column(Text, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    approx_cost = Column(Float, nullable=True)
    success = Column(Boolean, nullable=False, default=True)
    timestamp = Column(DateTime, nullable=False, server_default=func.sysdatetime())

    workflow = relationship("Workflow", back_populates="execution_logs")
    planner_step = relationship("PlannerStep", back_populates="execution_logs")

class UserApproval(Base):
    __tablename__ = 'user_approvals'

    id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    workflow_id = Column(UNIQUEIDENTIFIER, ForeignKey('workflows.id', ondelete="CASCADE"), nullable=False)
    action_type = Column(String(100), nullable=False)
    action_payload = Column(Text, nullable=False)
    status = Column(String(100), nullable=False, default='pending_approval')
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.sysdatetime())

    workflow = relationship("Workflow", back_populates="user_approvals")

class UserMemory(Base):
    __tablename__ = 'user_memories'

    id = Column(UNIQUEIDENTIFIER, primary_key=True, default=uuid.uuid4)
    user_id = Column(UNIQUEIDENTIFIER, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    memory_type = Column(String(50), nullable=False)
    key = Column("KEY", String(100), nullable=False)
    value = Column(Text, nullable=False)
    is_deleted = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, server_default=func.sysdatetime())
    updated_at = Column(DateTime, nullable=False, server_default=func.sysdatetime(), onupdate=func.sysdatetime())

    user = relationship("User", back_populates="memories")