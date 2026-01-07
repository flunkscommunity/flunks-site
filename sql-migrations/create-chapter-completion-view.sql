-- Create a public view for checking chapter completion status
-- This bypasses RLS on gum_transactions to allow mobile app to check completion

-- Drop existing view if it exists
DROP VIEW IF EXISTS chapter_completion_status;
DROP VIEW IF EXISTS wallet_chapter_completions;

-- Create the view that aggregates completion data from gum_transactions
-- This view provides a single row per wallet with all completion flags
CREATE VIEW wallet_chapter_completions AS
SELECT DISTINCT
    wallet_address,
    -- From gum_transactions table
    BOOL_OR(source = 'hidden_riff') AS has_hidden_riff,
    BOOL_OR(source = 'chapter4_homecoming_dance') AS has_homecoming_dance,
    BOOL_OR(source = 'repeat_offender') AS has_repeat_offender,
    BOOL_OR(source = 'paradise_motel_room7') AS has_paradise_motel_room7,
    BOOL_OR(source = 'four_thieves_underground') AS has_four_thieves_underground,
    COUNT(*) FILTER (WHERE source = 'daily_checkin') AS daily_checkin_count
FROM gum_transactions
GROUP BY wallet_address;

-- Grant access to anon key (critical for mobile app)
GRANT SELECT ON wallet_chapter_completions TO anon;
GRANT SELECT ON wallet_chapter_completions TO authenticated;

COMMENT ON VIEW wallet_chapter_completions IS 'Public view for checking chapter completion status from gum_transactions. Allows mobile app to check without RLS restrictions.';

-- Create separate views for other tracking tables that have RLS issues

-- Paradise Motel Room 7 keys view
DROP VIEW IF EXISTS wallet_room7_keys;
CREATE VIEW wallet_room7_keys AS
SELECT wallet_address, obtained_at
FROM paradise_motel_room7_keys;

GRANT SELECT ON wallet_room7_keys TO anon;
GRANT SELECT ON wallet_room7_keys TO authenticated;

-- Four Thieves Underground access view  
DROP VIEW IF EXISTS wallet_underground_access;
CREATE VIEW wallet_underground_access AS
SELECT wallet_address, access_timestamp
FROM four_thieves_underground_access;

GRANT SELECT ON wallet_underground_access TO anon;
GRANT SELECT ON wallet_underground_access TO authenticated;

-- Homecoming dance attendance view
DROP VIEW IF EXISTS wallet_homecoming_attendance;
CREATE VIEW wallet_homecoming_attendance AS
SELECT wallet_address, attendance_timestamp
FROM homecoming_dance_attendance;

GRANT SELECT ON wallet_homecoming_attendance TO anon;
GRANT SELECT ON wallet_homecoming_attendance TO authenticated;

-- Crack the code completions view
DROP VIEW IF EXISTS wallet_crack_the_code;
CREATE VIEW wallet_crack_the_code AS
SELECT wallet_address, code_entered, success, created_at
FROM digital_lock_attempts
WHERE success = true;

GRANT SELECT ON wallet_crack_the_code TO anon;
GRANT SELECT ON wallet_crack_the_code TO authenticated;

-- Chat messages view (for mobile app to bypass RLS)
DROP VIEW IF EXISTS public_chat_messages;
CREATE VIEW public_chat_messages AS
SELECT 
    id,
    room_name,
    username,
    wallet_address,
    message_text,
    is_ai,
    ai_agent_id,
    created_at
FROM chat_messages
ORDER BY created_at ASC;

GRANT SELECT ON public_chat_messages TO anon;
GRANT SELECT ON public_chat_messages TO authenticated;

COMMENT ON VIEW public_chat_messages IS 'Public view for chat messages. Allows mobile app to read messages without RLS restrictions.';
