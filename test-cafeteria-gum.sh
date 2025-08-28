#!/bin/bash
# Test script to add cafeteria gum source

echo "🏫 Testing Cafeteria Gum Integration"
echo "=================================="
echo ""
echo "Updated Settings:"
echo "- Reward: 50 gum (was 8)"
echo "- Cooldown: 0 minutes (was 240)"
echo "- Daily Limit: 1 click only (was 25)"
echo "- Source: cafeteria_visit"
echo ""
echo "To apply these changes to your database, run:"
echo "supabase db push --linked"
echo ""
echo "Then test the cafeteria button in the High School location!"
echo ""
echo "Current SQL configuration:"
cat supabase/add-cafeteria-gum-source.sql
