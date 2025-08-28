#!/bin/bash
# Test the profile icon migration API

echo "🚀 Testing profile icon migration..."

# Wait for server to be ready
sleep 2

# Call the migration API
curl -X POST http://localhost:3001/api/migrate-profile-icons \
  -H "Content-Type: application/json" \
  -d '{"admin_key": "flunks_admin_2025"}' \
  --silent \
  | jq .

echo "✅ Migration test completed!"
