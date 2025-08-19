-- Clean up existing incomplete WTF tracking setup
-- Run this first to remove any conflicting elements

DROP TABLE IF EXISTS wtf_command_logs CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command CASCADE;
DROP FUNCTION IF EXISTS get_wtf_command_stats CASCADE;
DROP FUNCTION IF EXISTS get_recent_wtf_commands CASCADE;
DROP FUNCTION IF EXISTS update_wtf_command_logs_updated_at CASCADE;
