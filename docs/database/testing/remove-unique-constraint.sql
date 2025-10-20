-- Remove the unique constraint that prevents multiple votes per clique
-- This will allow users to vote multiple times for the same or different candidates in each clique

ALTER TABLE picture_day_votes 
DROP CONSTRAINT IF EXISTS picture_day_votes_user_wallet_clique_key;

-- Verify the constraint is removed
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'picture_day_votes'::regclass 
AND contype = 'u';