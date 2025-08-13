-- Fix the username column to allow NULL values
-- This removes the NOT NULL constraint that's causing the error

ALTER TABLE user_profiles 
ALTER COLUMN username DROP NOT NULL;
