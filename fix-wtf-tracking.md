# Fix WTF Tracking in Supabase

## Issue Summary
The WTF command tracking was failing due to several issues:
1. **API Rejection**: The log-wtf-command API was rejecting requests with `null` wallet addresses
2. **Missing Table**: The `terminal_activities` table doesn't exist in Supabase
3. **Authentication Issues**: Anonymous users couldn't insert tracking data due to strict RLS policies

## Root Cause Found ✅
When users access the terminal without connecting a wallet (trial/anonymous mode), the code sends `wallet: null` to the API, but the original API required a non-null wallet address.

## Fixes Applied

### 1. Fixed API to Accept Null Wallets ✅
Modified `/src/pages/api/log-wtf-command.ts` to allow `null` wallet addresses for anonymous users.

### 2. Updated Database Schema ✅
- Modified `supabase/wtf_command_tracking.sql` to allow null wallet addresses
- Updated RLS policies to allow anonymous insertions
- Added permissions for anonymous users (`anon` role)

### 3. Created Missing Terminal Activities Schema ✅
Created `supabase/terminal_activities_schema.sql` for general terminal command tracking.

## Next Steps

### Apply Database Changes
Run these SQL files in your Supabase dashboard (SQL Editor):

1. **Update WTF tracking schema:**
```sql
-- Run the updated supabase/wtf_command_tracking.sql
```

2. **Create terminal activities table:**
```sql
-- Run the new supabase/terminal_activities_schema.sql
```

### Test the Fix
After applying the schema changes, test with:

```bash
curl -X POST "http://localhost:3000/api/log-wtf-command" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": null,
    "accessLevel": "BETA",
    "sessionId": "test-anonymous-user"
  }'
```

Should return: `{"success":true,"message":"WTF command usage logged",...}`

## Expected Results
- ✅ Anonymous users can now use WTF command without errors
- ✅ Connected wallet users continue to work as expected  
- ✅ All terminal activity is properly tracked
- ✅ Admin stats will show both anonymous and authenticated usage
