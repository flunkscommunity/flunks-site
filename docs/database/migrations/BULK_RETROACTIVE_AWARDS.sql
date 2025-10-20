-- 🎯 BULK RETROACTIVE GUM AWARDS - Award all 31 voters at once
-- This will automatically award 50 GUM to all existing voters who haven't received it

-- First, ensure the gum source exists
INSERT INTO gum_sources (source_name, base_reward, cooldown_minutes, daily_limit, description, is_active) VALUES
('picture_day_voting', 50, 0, 1, 'Reward for completing Picture Day voting objective - The Slacker (Chapter 3)', true)
ON CONFLICT (source_name) DO UPDATE SET
  base_reward = EXCLUDED.base_reward,
  updated_at = CURRENT_TIMESTAMP;

-- Bulk award GUM to all voters who haven't received it yet
-- This uses a DO block to loop through all the wallets
DO $$
DECLARE
    wallet_addr TEXT;
    award_result JSONB;
    success_count INTEGER := 0;
    error_count INTEGER := 0;
    total_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🎯 Starting bulk retroactive GUM awards for Picture Day voters...';
    
    -- Loop through all voters who need rewards
    FOR wallet_addr IN 
        SELECT DISTINCT user_wallet
        FROM picture_day_votes 
        WHERE user_wallet NOT IN (
            SELECT DISTINCT wallet_address 
            FROM gum_transactions 
            WHERE source = 'picture_day_voting'
        )
    LOOP
        total_count := total_count + 1;
        
        BEGIN
            -- Award GUM to this wallet
            SELECT award_gum(
                wallet_addr, 
                'picture_day_voting', 
                '{"retroactive": true, "objective": "slacker_chapter3", "reason": "Retroactive reward for Picture Day voting"}'::jsonb
            ) INTO award_result;
            
            -- Check if successful
            IF (award_result->>'success')::boolean = true THEN
                success_count := success_count + 1;
                RAISE NOTICE '✅ Awarded % GUM to %', 
                    (award_result->>'earned')::text, 
                    left(wallet_addr, 12) || '...';
            ELSE
                error_count := error_count + 1;
                RAISE NOTICE '❌ Failed to award GUM to %: %', 
                    left(wallet_addr, 12) || '...', 
                    (award_result->>'error')::text;
            END IF;
            
        EXCEPTION 
            WHEN OTHERS THEN
                error_count := error_count + 1;
                RAISE NOTICE '💥 Exception awarding GUM to %: %', 
                    left(wallet_addr, 12) || '...', 
                    SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 BULK AWARD RESULTS:';
    RAISE NOTICE '✅ Successful awards: %', success_count;
    RAISE NOTICE '❌ Failed awards: %', error_count;
    RAISE NOTICE '🎯 Total processed: %', total_count;
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Retroactive GUM awards complete!';
    
END $$;