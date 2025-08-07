-- Feedback/Report Cards Table
CREATE TABLE feedback_reports (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(255),
  wallet_address VARCHAR(64),
  issues_found TEXT NOT NULL,
  suggestions TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_agent TEXT,
  ip_address INET
);

-- Add indexes for performance
CREATE INDEX idx_feedback_reports_submitted_at ON feedback_reports(submitted_at DESC);
CREATE INDEX idx_feedback_reports_wallet ON feedback_reports(wallet_address);

-- Enable Row Level Security
ALTER TABLE feedback_reports ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert feedback (public form)
CREATE POLICY "Allow public feedback submission" ON feedback_reports
FOR INSERT WITH CHECK (true);

-- Policy to allow reading feedback (for admin/dev access)
CREATE POLICY "Allow feedback read access" ON feedback_reports
FOR SELECT USING (true);

-- Add helpful comments
COMMENT ON TABLE feedback_reports IS 'User feedback and bug reports from the Flunks website';
COMMENT ON COLUMN feedback_reports.issues_found IS 'Detailed description of bugs, issues, or problems found';
COMMENT ON COLUMN feedback_reports.suggestions IS 'User suggestions for improvements or new features';
COMMENT ON COLUMN feedback_reports.user_agent IS 'Browser information for debugging context';
COMMENT ON COLUMN feedback_reports.ip_address IS 'User IP for spam prevention (optional)';
