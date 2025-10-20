-- Add Picture Day voting gum source for the Slacker objective in Chapter 3
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) VALUES
('picture_day_voting', 50, 0, 1, 'Reward for completing Picture Day voting objective - The Slacker (Chapter 3)', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  daily_limit = EXCLUDED.daily_limit,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the source was added
SELECT * FROM gum_sources WHERE source_name = 'picture_day_voting';