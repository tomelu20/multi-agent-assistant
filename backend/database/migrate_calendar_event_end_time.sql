IF COL_LENGTH('dbo.calendar_events', 'event_end_time') IS NULL
BEGIN
    ALTER TABLE dbo.calendar_events
    ADD event_end_time NVARCHAR(5) NULL;
END;
GO
