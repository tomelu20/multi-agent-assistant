-- Create database if not exists
IF NOT EXISTS (SELECT * FROM sys.database WHERE name = N'ProducticityAssistantDB')
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



