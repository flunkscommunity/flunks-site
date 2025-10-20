-- Create table for tracking weekly objectives completions
CREATE TABLE IF NOT EXISTS weekly_objectives_completed (
    id BIGSERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    username TEXT,
    semester_week TEXT NOT NULL DEFAULT 'semester_zero_week1',
    objectives_completed TEXT[] NOT NULL DEFAULT '{}',
    all_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completion_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(wallet_address, semester_week)
);

-- Add RLS policy
ALTER TABLE weekly_objectives_completed ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own completion status
CREATE POLICY "Users can view their own objective completions"
    ON weekly_objectives_completed FOR SELECT
    USING (wallet_address = current_setting('request.jwt.claims.wallet_address', true));

-- Allow the service to insert completion records
CREATE POLICY "Service can insert objective completions"
    ON weekly_objectives_completed FOR INSERT
    WITH CHECK (true);

-- Allow the service to update completion records  
CREATE POLICY "Service can update objective completions"
    ON weekly_objectives_completed FOR UPDATE
    USING (true);
