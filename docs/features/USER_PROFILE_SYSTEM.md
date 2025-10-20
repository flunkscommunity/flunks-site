# 👤 User Profile System Documentation

## Overview
The Flunks User Profile System allows users to create profiles linked to their wallet addresses with username, Discord ID, and email information. This enables better community identification and social features across the platform.

## 🗄️ Database Schema

### User Profiles Table (`user_profiles`)
```sql
- id (SERIAL PRIMARY KEY)
- wallet_address (VARCHAR(64) UNIQUE NOT NULL) 
- username (VARCHAR(32) UNIQUE NOT NULL)
- discord_id (VARCHAR(64))
- email (VARCHAR(255))
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Constraints & Validation
- Username: 3-32 characters, alphanumeric + hyphens/underscores only
- Email: Standard email format validation (optional)
- Discord ID: Optional, unique across platform
- Wallet Address: Unique, required

## 🔧 API Endpoints

### `POST /api/user-profile`
Create or update user profile
```typescript
// Request Body
{
  wallet_address: string;
  username: string;
  discord_id?: string;
  email?: string;
}

// Response
{
  success: boolean;
  profile: UserProfile;
}
```

### `GET /api/get-user-profile?wallet={address}`
Fetch user profile by wallet address
```typescript
// Response (200)
{
  id: number;
  wallet_address: string;
  username: string;
  discord_id?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

// Response (404)
{
  error: "Profile not found"
}
```

### `GET /api/check-username?username={username}`
Check username availability
```typescript
// Response
{
  available: boolean;
  reason: string;
}
```

## ⚛️ React Components

### Context Provider
```typescript
import { UserProfileProvider, useUserProfile } from 'contexts/UserProfileContext';

// Wrap your app with UserProfileProvider
<UserProfileProvider>
  <YourApp />
</UserProfileProvider>

// Use in components
const { 
  profile, 
  hasProfile, 
  createProfile, 
  updateProfile,
  checkUsername 
} = useUserProfile();
```

### Core Components

#### `UserProfileForm`
Form for creating/editing profiles with real-time validation
- Username availability checking
- Email format validation
- Discord ID linking
- Wallet address display

#### `UserProfileDisplay`
Read-only profile display component
- Compact and full view modes
- Social links display
- Edit button for own profile

#### `UserProfileWindow`
Complete profile management window
- Integrated form and display
- Handles create/edit modes
- Draggable/resizable window

#### `UserProfileBadge`
Compact profile display for use in lists/comments
- Wallet address truncation
- Username display
- Clickable for profile viewing

## 🔐 Security Features

### Row Level Security (RLS)
- Public read access for username checks
- Users can only modify their own profiles
- JWT-based access control ready

### Validation
- Server-side username format validation
- Email format checking
- Duplicate prevention (username, Discord ID)
- SQL injection protection

## 📱 Integration Points

### Existing Systems
- **Dynamic Wallet**: Automatic wallet address detection
- **Supabase**: Database backend integration
- **Windows System**: Profile window management
- **Start Menu**: Profile access point

### Usage Examples

#### Check if User Has Profile
```typescript
const { hasProfile, profile } = useUserProfile();

if (!hasProfile) {
  // Show profile creation prompt
} else {
  // Display username: profile.username
}
```

#### Create Profile
```typescript
const { createProfile } = useUserProfile();

const handleCreateProfile = async () => {
  const success = await createProfile({
    username: 'FlunkMaster2024',
    discord_id: '123456789012345678',
    email: 'user@example.com'
  });
  
  if (success) {
    // Profile created successfully
  }
};
```

#### Display Profile Badge
```typescript
import UserProfileBadge from 'components/UserProfile/UserProfileBadge';

<UserProfileBadge
  walletAddress="0x1234...5678"
  username="FlunkMaster2024"
  compact={true}
  onClick={() => openProfileWindow()}
/>
```

## 🚀 Setup Instructions

### 1. Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Database Setup
Run the SQL schema in Supabase:
```sql
-- See /supabase/user_profiles_schema.sql for complete schema
CREATE TABLE user_profiles (
  -- ... table definition
);
```

### 3. Application Integration
```typescript
// In _app.tsx
import { UserProfileProvider } from 'contexts/UserProfileContext';

<UserProfileProvider>
  <YourApp />
</UserProfileProvider>
```

### 4. Start Menu Integration
Profile access is automatically added to the Windows 95 start menu under "My Locker".

## 🎯 Future Enhancements

### Planned Features
- Profile avatars/NFT profile pictures
- Friend system linking profiles
- Activity feed integration
- Profile verification badges
- Social stats (Flunks owned, games played, etc.)

### Scalability Considerations
- Database indexing for performance
- Caching layer for frequent lookups
- Rate limiting on username checks
- Profile picture storage optimization

## 🐛 Troubleshooting

### Common Issues

1. **"Username already taken" Error**
   - Check username availability before submission
   - Ensure unique username across platform

2. **Profile Not Loading**
   - Verify wallet connection
   - Check Supabase environment variables
   - Confirm database table exists

3. **Discord ID Already Used**
   - Each Discord ID can only link to one wallet
   - Users must unlink from previous account first

### Debug Commands
```typescript
// Check current profile state
console.log(useUserProfile());

// Test API endpoints
fetch('/api/check-username?username=test');
fetch('/api/get-user-profile?wallet=0x123...');
```

## 📊 Analytics Integration

The profile system automatically tracks:
- Profile creation events
- Profile update events
- Username availability checks
- Profile view counts

Integration with existing Vercel Analytics for user behavior insights.

---

*This profile system provides the foundation for enhanced social features and community building within the Flunks ecosystem.*
