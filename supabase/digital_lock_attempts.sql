-- Digital Lock Attempts Tracking Table
-- This table tracks when users attempt to enter codes in the digital lock system

CREATE TABLE IF NOT EXISTS public.digital_lock_attempts (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    username TEXT,
    code_entered TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    attempt_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on wallet_address for faster queries
CREATE INDEX IF NOT EXISTS idx_digital_lock_wallet ON public.digital_lock_attempts (wallet_address);

-- Create an index on attempt_timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_digital_lock_timestamp ON public.digital_lock_attempts (attempt_timestamp);

-- Create an index on success for filtering successful/failed attempts
CREATE INDEX IF NOT EXISTS idx_digital_lock_success ON public.digital_lock_attempts (success);

-- Enable Row Level Security (RLS)
ALTER TABLE public.digital_lock_attempts ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (track attempts)
CREATE POLICY "Allow public to insert attempts" ON public.digital_lock_attempts
    FOR INSERT 
    WITH CHECK (true);

-- Create a policy that allows anyone to read attempts (for analytics)
CREATE POLICY "Allow public to read attempts" ON public.digital_lock_attempts
    FOR SELECT 
    USING (true);

-- Grant necessary permissions
GRANT INSERT, SELECT ON public.digital_lock_attempts TO anon;
GRANT INSERT, SELECT ON public.digital_lock_attempts TO authenticated;
GRANT USAGE ON SEQUENCE public.digital_lock_attempts_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.digital_lock_attempts_id_seq TO authenticated;
