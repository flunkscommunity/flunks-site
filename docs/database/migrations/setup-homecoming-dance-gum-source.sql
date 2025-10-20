-- Create GUM source for Chapter 4 Homecoming Dance attendance
-- This allows users to earn 50 GUM for attending the homecoming dance (Chapter 4 Slacker objective)

INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, description, is_active)
VALUES ('chapter4_homecoming_dance', 50, 525600, 'Chapter 4 Slacker - Homecoming Dance attendance', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  cooldown_minutes = EXCLUDED.cooldown_minutes,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Verify the source was created
SELECT * FROM gum_sources WHERE source_name = 'chapter4_homecoming_dance';