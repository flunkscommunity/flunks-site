# Magic Carpet Command Tracking System

This system tracks when users input the "magic carpet" command in the terminal, providing analytics and monitoring capabilities. This is a replacement for the WTF tracking that was having Supabase connection issues.

## Database Setup

Run the SQL file to set up the tracking system:
```bash
# Apply the schema to your Supabase database
# Copy and paste the contents of supabase/magic_carpet_tracking.sql into your Supabase SQL Editor
```

## API Endpoints

### 1. Log Magic Carpet Command Usage
**Endpoint:** `POST /api/log-magic-carpet-command`

**Request Body:**
```json
{
  "wallet": "0x123...",
  "accessLevel": "BETA",
  "sessionId": "optional-session-id",
  "userAgent": "optional-user-agent-override"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic Carpet command usage logged",
  "timestamp": "2025-08-21T15:30:00.000Z"
}
```

### 2. Admin Statistics
**Endpoint:** `GET /api/magic-carpet-admin?wallet=0x123...&action=stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_uses": 45,
    "unique_users": 12,
    "admin_uses": 3,
    "beta_uses": 35,
    "community_uses": 7,
    "today_uses": 8,
    "this_week_uses": 25
  }
}
```

### 3. Recent Command Usage
**Endpoint:** `GET /api/magic-carpet-admin?wallet=0x123...&action=recent&limit=20`

**Response:**
```json
{
  "success": true,
  "recent_commands": [
    {
      "wallet_address": "0x456...",
      "access_level": "BETA",
      "created_at": "2025-08-21T15:30:00.000Z",
      "session_id": "session-123",
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1"
    }
  ]
}
```

## Integration with Terminal

The terminal automatically tracks "magic carpet" command usage when users type it. No additional integration needed - it's already built into `FlunksTerminal.tsx`.

## Database Tables

### magic_carpet_logs
- `id` - Primary key
- `wallet_address` - User's wallet address (can be null for anonymous users)
- `command_input` - Always "magic carpet" for this tracking
- `access_level` - User's access level (ADMIN/BETA/COMMUNITY)
- `session_id` - Optional session identifier
- `user_agent` - Browser/client information
- `ip_address` - User's IP address
- `created_at` - When the command was executed
- `updated_at` - Last update timestamp

## Security Features

- **Row Level Security (RLS)** enabled
- Users can only insert their own records
- Users can only view their own records
- Admins can view all records
- Service role key required for API operations
- Anonymous users can use the command (trial mode support)

## Analytics Functions

### get_magic_carpet_stats()
Returns comprehensive usage statistics including:
- Total command uses
- Unique users who used it
- Breakdown by access level
- Today's usage
- This week's usage

### get_recent_magic_carpet_commands(limit)
Returns recent command usage for admin review

### log_magic_carpet_command()
Safely logs a new Magic Carpet command usage with error handling

## Usage Examples

### Check Magic Carpet Command Statistics (Admin Only)
```bash
curl "http://localhost:3000/api/magic-carpet-admin?wallet=0xe327216d843357f1&action=stats"
```

### Get Recent Commands (Admin Only)
```bash
curl "http://localhost:3000/api/magic-carpet-admin?wallet=0xe327216d843357f1&action=recent&limit=10"
```

### Log a Magic Carpet Command Usage (automatic)
```bash
curl -X POST "http://localhost:3000/api/log-magic-carpet-command" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x123...",
    "accessLevel": "BETA",
    "sessionId": "session-456"
  }'
```

## Command Response

When users type "magic carpet" in the terminal, they receive:
> 🧞‍♂️ Whoosh! You've summoned the magic carpet! ✨ You're now floating above Flunks High School, getting a bird's eye view of all the chaos below. The carpet whispers ancient secrets of the digital realm... 🪐

## Environment Variables Required

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Setup Steps

1. **Database**: Run `supabase/magic_carpet_tracking.sql` in your Supabase SQL Editor
2. **Test Command**: Type "magic carpet" in the terminal
3. **Check Logs**: Use admin API to verify tracking is working
4. **Monitor Usage**: View statistics through admin endpoints

This system provides complete tracking of Magic Carpet command usage while maintaining user privacy and security through proper access controls.
