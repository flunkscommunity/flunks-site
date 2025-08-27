# Chat Room Access Fix

## Problem
Users with connected wallets couldn't see the "Chat Rooms" icon on the desktop, even when logged in to a wallet. The "enter chat" button would not appear after clicking the chat icon.

## Root Cause
The issue was in the app permissions system:

1. **ConditionalAppIcon** component filters which desktop apps are visible based on user access level
2. **getUserAccessLevel()** reads from `sessionStorage['flunks-access-level']` 
3. Access level is only set when users enter an access code via the **AccessGate** component
4. Users connecting wallets directly bypass the AccessGate, leaving no access level in session storage
5. Without an access level, **hasAppPermission()** returns false for all apps including chat-rooms
6. ConditionalAppIcon returns null, making the Chat Rooms icon invisible

## Solution
Created an automatic access grant system for wallet-connected users:

### 1. AutoWalletAccessGrant Component (`src/components/AutoWalletAccessGrant.tsx`)
- Monitors wallet connection status via Dynamic context
- Automatically grants COMMUNITY access level when wallet connects
- Sets required session storage values:
  - `flunks-access-granted: 'true'`
  - `flunks-access-level: 'COMMUNITY'` 
  - `flunks-access-code: 'AUTO_WALLET_GRANT'`
- Dispatches custom event to trigger icon re-renders

### 2. Enhanced ConditionalAppIcon (`src/components/ConditionalAppIcon.tsx`)
- Added state management for access level updates
- Listens for `flunks-access-updated` events
- Automatically re-renders when access level changes
- Provides real-time icon visibility updates

### 3. Integration in Main App (`src/pages/_app.tsx`)
- Added AutoWalletAccessGrant to the app component tree
- Positioned after Dynamic context provider for proper hook access

## Chat Rooms App Permission
The chat-rooms app requires these access levels (already configured):
```typescript
{
  id: 'chat-rooms',
  title: 'Chat Rooms', 
  requiredLevel: ['ADMIN', 'BETA', 'COMMUNITY'],
  description: 'Join community chat rooms'
}
```

## Files Modified
- `src/components/AutoWalletAccessGrant.tsx` (new)
- `src/components/ConditionalAppIcon.tsx` (enhanced) 
- `src/pages/_app.tsx` (integration)

## Testing
1. Connect a wallet through Dynamic Labs
2. Chat Rooms icon should automatically appear on desktop
3. Double-click Chat Rooms icon to open messenger
4. Should show "Welcome to Flunks Messenger" interface

## Access Levels
- **COMMUNITY**: Automatic grant for all wallet connections  
- **BETA**: Manual code required via AccessGate
- **ADMIN**: Manual code required via AccessGate

This fix ensures all wallet-connected users get immediate access to community features like chat rooms without requiring additional access codes.
