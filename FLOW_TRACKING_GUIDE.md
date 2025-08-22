# Flow Command Tracking System

This system tracks when users input the "flow" command in the terminal, providing analytics and monitoring capabilities similar to the Magic Carpet tracking system.

## Database Setup

The Flow tracking schema is already applied and working! The system includes:

- `flow_logs` table for tracking command usage
- `log_flow_command()` RPC function for safe logging
- `get_flow_command_stats()` function for analytics
- `get_recent_flow_commands()` function for admin review

## API Endpoints

### 1. Log Flow Command Usage
**Endpoint:** `POST /api/log-flow-command`

**Request Body:**
```json
{
  "wallet": "0x123...",  // Can be null for anonymous users
  "username": "testuser", // Can be null
  "accessLevel": "BETA",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Flow command usage logged",
  "timestamp": "2025-08-22T17:21:39.709Z"
}
```

### 2. Admin Statistics
**Endpoint:** `GET /api/flow-admin?action=stats`

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_commands": 3,
    "unique_wallets": 1,
    "unique_usernames": 2,
    "commands_today": 3,
    "commands_this_week": 3,
    "commands_this_month": 3
  }
}
```

### 3. Recent Command Usage
**Endpoint:** `GET /api/flow-admin?action=recent&limit=20`

**Response:**
```json
{
  "success": true,
  "recent_commands": [
    {
      "id": 3,
      "wallet_address": null,
      "username": "testuser",
      "command_input": "flow",
      "access_level": "BETA",
      "created_at": "2025-08-22T17:21:39.765191+00:00",
      "session_id": "test-session",
      "user_agent": "curl/8.7.1",
      "ip_address": "::1"
    }
  ]
}
```

## Integration with Terminal

The Flow command tracking is already integrated into `FlunksTerminal.tsx` component. When users type "flow", it automatically:

1. Executes the command and shows the Flow blockchain response
2. Logs the usage to Supabase via `/api/log-flow-command` 
3. Tracks the user's wallet, username, access level, and session

## Database Tables

### flow_logs
- `id` - Primary key
- `wallet_address` - User's wallet address (can be null for anonymous users)
- `username` - User's profile username (can be null)
- `command_input` - Always "flow" for this tracking
- `access_level` - User's access level (ADMIN/BETA/COMMUNITY)
- `session_id` - Optional session identifier
- `user_agent` - Browser/client information
- `ip_address` - User's IP address
- `created_at` - When the command was executed
- `updated_at` - Last update timestamp

## Security Features

- **Row Level Security (RLS)** enabled
- Anonymous users can insert records (supports trial mode)
- Users can only view their own records
- Admins can view all records via RPC functions
- Service role key required for API operations

## Analytics Functions

### get_flow_command_stats()
Returns comprehensive usage statistics including:
- Total command uses
- Unique wallets who used it
- Unique usernames who used it
- Today's usage
- This week's usage
- This month's usage

### get_recent_flow_commands(limit, offset)
Returns recent command usage for admin review with pagination

### log_flow_command()
Safely logs a new Flow command usage with error handling

## Command Response

When users type "flow" in the terminal, they receive:
> 🌊 The Flow blockchain awakens! ⚡ Digital currents surge through the network, and your wallet resonates with the power of decentralized possibilities. You've tapped into the flow state... 💫

## Usage Examples

### Check Flow Command Statistics
```bash
curl "http://localhost:3000/api/flow-admin?action=stats"
```

### Get Recent Commands
```bash
curl "http://localhost:3000/api/flow-admin?action=recent&limit=10"
```

### Log a Flow Command Usage (automatic)
```bash
curl -X POST "http://localhost:3000/api/log-flow-command" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": null,
    "username": "testuser",
    "accessLevel": "BETA",
    "sessionId": "session-456"
  }'
```

## Environment Variables Required

Ensure these are set in your `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Status

✅ **WORKING** - Flow command tracking is now fully functional and working the same as Magic Carpet tracking!

The issue was that the Flow API was rejecting anonymous users (null wallet), while Magic Carpet allowed them. This has been fixed and both commands now support:
- Anonymous/trial users (null wallet)
- Authenticated users with wallets
- Username tracking when available
- Complete analytics and admin functions

Both "magic carpet" and "flow" commands are now tracking successfully in Supabase with identical functionality.
