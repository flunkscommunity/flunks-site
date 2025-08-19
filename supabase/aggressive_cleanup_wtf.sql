-- AGGRESSIVE CLEANUP for WTF Command Tracking
-- This will completely remove all traces of the WTF tracking system

-- Drop all policies first
DROP POLICY IF EXISTS "Users can insert their own wtf command logs" ON wtf_command_logs;
DROP POLICY IF EXISTS "Authenticated users can view wtf command logs" ON wtf_command_logs;
DROP POLICY IF EXISTS "Users can view their own wtf command logs" ON wtf_command_logs;

-- Drop triggers
DROP TRIGGER IF EXISTS update_wtf_command_logs_updated_at_trigger ON wtf_command_logs;

-- Drop functions
DROP FUNCTION IF EXISTS update_wtf_command_logs_updated_at() CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command(TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_wtf_command_stats() CASCADE;
DROP FUNCTION IF EXISTS get_recent_wtf_commands(INTEGER) CASCADE;

-- Drop table completely
DROP TABLE IF EXISTS wtf_command_logs CASCADE;

-- Verify cleanup
SELECT 'Cleanup complete - ready for fresh install' as status;
