-- Add new gum source for manual daily check-in (separate from automatic login)
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) VALUES
('daily_checkin', 15, 1440, 15, 'Manual daily check-in button in locker', true);

-- Update existing daily_login source to be clear it's automatic
UPDATE gum_sources 
SET description = 'Automatic daily login bonus (awarded on wallet connect)', 
    base_reward = 5
WHERE source_name = 'daily_login';

-- Verify the sources
SELECT source_name, base_reward, cooldown_minutes, description, is_active 
FROM gum_sources 
WHERE source_name IN ('daily_login', 'daily_checkin');
