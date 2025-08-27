-- Cafeteria Button Clicks Tracking Table
-- This table tracks when users click the button in the cafeteria window

CREATE TABLE IF NOT EXISTS public.cafeteria_button_clicks (
    id SERIAL PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    username TEXT,
    click_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on wallet_address for faster queries
CREATE INDEX IF NOT EXISTS idx_cafeteria_clicks_wallet ON public.cafeteria_button_clicks (wallet_address);

-- Create an index on click_timestamp for time-based queries
CREATE INDEX IF NOT EXISTS idx_cafeteria_clicks_timestamp ON public.cafeteria_button_clicks (click_timestamp);

-- Enable Row Level Security (RLS)
ALTER TABLE public.cafeteria_button_clicks ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to insert (track clicks)
CREATE POLICY "Allow public to insert clicks" ON public.cafeteria_button_clicks
    FOR INSERT 
    WITH CHECK (true);

-- Create a policy that allows anyone to read clicks (for analytics)
CREATE POLICY "Allow public to read clicks" ON public.cafeteria_button_clicks
    FOR SELECT 
    USING (true);

-- Grant necessary permissions
GRANT INSERT, SELECT ON public.cafeteria_button_clicks TO anon;
GRANT INSERT, SELECT ON public.cafeteria_button_clicks TO authenticated;
GRANT USAGE ON SEQUENCE public.cafeteria_button_clicks_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.cafeteria_button_clicks_id_seq TO authenticated;
