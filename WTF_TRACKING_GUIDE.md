# WTF Command Tracking System

This system tracks when users input the "WTF" command in the terminal, providing analytics and monitoring capabilities.

## Database Setup

Run the SQL file to set up the tracking system:
```bash
# Apply the schema to your Supabase database
psql -h [your-supabase-host] -d [your-database] -f supabase/wtf_command_tracking.sql
```

## API Endpoints

### 1. Log WTF Command Usage
**Endpoint:** `POST /api/log-wtf-command`

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
  "message": "WTF command usage logged",
  "timestamp": "2025-08-19T15:30:00.000Z"
}
```

### 2. Admin Statistics
**Endpoint:** `GET /api/wtf-admin?wallet=0x123...&action=stats`

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
**Endpoint:** `GET /api/wtf-admin?wallet=0x123...&action=recent&limit=20`

**Response:**
```json
{
  "success": true,
  "recent_commands": [
    {
      "wallet_address": "0x456...",
      "access_level": "BETA",
      "created_at": "2025-08-19T15:30:00.000Z",
      "session_id": "session-123",
      "user_agent": "Mozilla/5.0...",
      "ip_address": "192.168.1.1"
    }
  ]
}
```

## Integration with Terminal

To integrate with your terminal component, add this to the WTF command handler:

```typescript
// In your terminal component
const handleWtfCommand = async () => {
  // Log the command usage
  try {
    await fetch('/api/log-wtf-command', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet: userWallet,
        accessLevel: userAccessLevel, // ADMIN, BETA, or COMMUNITY
        sessionId: sessionStorage.getItem('sessionId') // optional
      })
    });
  } catch (error) {
    console.error('Failed to log WTF command:', error);
  }

  // Show the WTF response
  return "What's This Feature? The terminal lets you run commands like a real computer!";
};
```

## Database Tables

### wtf_command_logs
- `id` - Primary key
- `wallet_address` - User's wallet address
- `command_input` - Always "wtf" for this tracking
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

## Analytics Functions

### get_wtf_command_stats()
Returns comprehensive usage statistics including:
- Total command uses
- Unique users who used it
- Breakdown by access level
- Today's usage
- This week's usage

### get_recent_wtf_commands(limit)
Returns recent command usage for admin review (admin-only function)

### log_wtf_command()
Safely logs a new WTF command usage with error handling

## Usage Examples

### Check WTF Command Statistics (Admin Only)
```bash
curl "http://localhost:3000/api/wtf-admin?wallet=0xADMIN_WALLET&action=stats"
```

### Get Recent Commands (Admin Only)
```bash
curl "http://localhost:3000/api/wtf-admin?wallet=0xADMIN_WALLET&action=recent&limit=10"
```

### Log a WTF Command Usage
```bash
curl -X POST "http://localhost:3000/api/log-wtf-command" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "0x123...",
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

This system provides complete tracking of WTF command usage while maintaining user privacy and security through proper access controls.
