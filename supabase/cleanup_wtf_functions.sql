-- Clean up all WTF tracking functions from database
-- This removes any existing log_wtf_command functions that may be causing conflicts

DROP FUNCTION IF EXISTS log_wtf_command CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command(TEXT) CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command(TEXT, TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS log_wtf_command(TEXT, TEXT, TEXT, TEXT, TEXT) CASCADE;

-- Drop any related tables if they exist
DROP TABLE IF EXISTS wtf_command_logs CASCADE;

SELECT 'WTF tracking functions and tables cleaned up!' as status;
