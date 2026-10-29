-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = N'ProductivityAssistantDB')
BEGIN
    CREATE DATABASE ProductivityAssistantDB;
END
GO

USE ProductivityAssistantDB;
GO

--Drop existing tables in correct order
IF OBJECT_ID('dbo.user_memories', 'U') IS NOT NULL DROP TABLE dbo.user_memories;
IF OBJECT_ID('dbo.user_approvals', 'U') IS NOT NULL DROP TABLE dbo.user_approvals;
IF OBJECT_ID('dbo.execution_logs', 'U') IS NOT NULL DROP TABLE dbo.execution_logs;
IF OBJECT_ID('dbo.planner_steps', 'U') IS NOT NULL DROP TABLE dbo.planner_steps;
IF OBJECT_ID('dbo.workflows', 'U') IS NOT NULL DROP TABLE dbo.workflows;
IF OBJECT_ID('dbo.users', 'U') IS NOT NULL  DROP TABLE dbo.users;
GO

CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(100) NOT NULL,
    surname NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL,
    phone_number NVARCHAR(100) NOT NULL,
    password_hash NVARCHAR(100) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

CREATE TABLE dbo.workflows (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    raw_request NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Workflows_Users FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.planner_steps (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    workflow_id UNIQUEIDENTIFIER NOT NULL,
    step_number INT NOT NULL,
    description NVARCHAR(MAX) NOT NULL,
    assigned_role NVARCHAR(50) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_PlannerSteps_Workflows FOREIGN KEY (workflow_id) REFERENCES dbo.workflows(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.execution_logs (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    workflow_id UNIQUEIDENTIFIER NOT NULL,
    step_id UNIQUEIDENTIFIER NULL,
    agent_name NVARCHAR(50) NOT NULL,
    tool_name NVARCHAR(100) NOT NULL,
    input_payload NVARCHAR(MAX) NULL,
    output_payload NVARCHAR(MAX) NULL,
    latency_ms INT NULL,
    approx_cost FLOAT NULL,
    success BIT NOT NULL DEFAULT 1,
    timestamp DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_ExecutionLogs_Workflows FOREIGN KEY (workflow_id) REFERENCES dbo.workflows(id) ON DELETE CASCADE,
    CONSTRAINT FK_ExecutionLogs_PlannerSteps FOREIGN KEY (step_id) REFERENCES dbo.planner_steps(id) ON DELETE NO ACTION
);
GO

CREATE TABLE dbo.user_approvals (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    workflow_id UNIQUEIDENTIFIER NOT NULL,
    action_type NVARCHAR(100) NOT NULL,
    action_payload NVARCHAR(MAX) NOT NULL,
    status NVARCHAR(50) NOT NULL DEFAULT 'pending_approval',
    decided_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_UserApprovals_Workflows  FOREIGN KEY (workflow_id) REFERENCES dbo.workflows(id) ON DELETE CASCADE
);
GO

CREATE TABLE dbo.user_memories (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    memory_type NVARCHAR(50) NOT NULL,
    [KEY] NVARCHAR(100) NOT NULL,
    value NVARCHAR(MAX) NOT NULL,
    is_deleted BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_UserMemories_Users  FOREIGN KEY (user_id) REFERENCES dbo.users(id) ON DELETE CASCADE
);
GO




