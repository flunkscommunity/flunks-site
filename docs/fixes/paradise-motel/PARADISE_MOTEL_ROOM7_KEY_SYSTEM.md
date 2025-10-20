# Paradise Motel Room 7 Access System - Implementation Summary

## Overview
Users must complete a dialogue tree with the maid during DAYTIME in the 'Round Back section to obtain a key. Only with this key can they access Room 7 at NIGHT to get the overachiever objective reward.

## Flow

### 1. DAYTIME - 'Round Back (6 AM - 8 PM)
- **Location**: Paradise Motel → 'Round Back button
- **NPC**: Maid (friend's mom) is present
- **Dialogue**: 8-step conversation tree with one correct path
- **Reward**: Room 7 Key (digital, tracked in database)
- **Wrong Answers**: Send user back to start of conversation

### 2. NIGHTTIME - 'Round Back (8 PM - 6 AM)
- **No Maid**: She only works during the day
- **Visual**: Shows `round-back-night.png` with trash and cigarette butts
- **Message**: "Nobody's here... The maid must work during the day."

### 3. Room 7 Access Check (NIGHTTIME ONLY)
- **Without Key**: Door is locked, message: "Maybe someone around back during the day could help you get in..."
- **With Key**: Access granted, overachiever objective reward given

## Database Tracking

### Table: `paradise_motel_room7_keys`
```sql
- wallet_address (unique)
- obtained_at (timestamp)
- user_agent
- ip_address
```

### API Endpoints
1. **POST /api/record-room7-key** - Automatically called when user gets key
2. **GET /api/check-room7-key?walletAddress=...** - Checks if user has key before Room 7 access

## Dialogue Tree Path (All "Yes" choices required)

1. "He said you might be able to help us."
2. "So you know he checked in."
3. "That must be hard on you."
4. "I understand completely."
5. "I just need to know if he left any clues."
6. "So after dark is safer?"
7. "You got it. Thanks."
8. "Close" (exits dialogue)

## Technical Details

### Key Features
- ✅ Maid only appears during day (6 AM - 8 PM local time)
- ✅ Key required for Room 7 night access
- ✅ Key obtainment auto-tracked in database
- ✅ Wrong dialogue choices restart conversation
- ✅ One correct path through 8 nodes
- ✅ Retro 90s Sega Genesis aesthetic (orange/blue)
- ✅ Mobile responsive with no overflow
- ✅ Single "Close" button at end that exits window

### Files Modified
1. `/src/components/MaidDialogue.tsx` - Dialogue component with tracking
2. `/src/lib/dialogue.ts` - Dialogue engine types
3. `/src/lib/maidGraph.ts` - Conversation tree data
4. `/src/hooks/useDialogue.ts` - React hook for dialogue state
5. `/src/windows/Locations/ParadiseMotelMain.tsx` - Day/night logic and key checking
6. `/src/pages/api/record-room7-key.ts` - Records key obtainment
7. `/src/pages/api/check-room7-key.ts` - Checks if user has key

### SQL Files
1. `create-paradise-motel-room7-keys-table.sql` - Creates tracking table
2. `query-room7-key-holders.sql` - Queries for airdrop lists

## Airdrop Process
1. Run SQL table creation script in Supabase
2. Users complete dialogue and get keys (auto-tracked)
3. Use `query-room7-key-holders.sql` to export wallet addresses
4. Airdrop to those addresses

## Future Enhancements
- Create actual `round-back-night.png` image with trash/cigarettes
- Add sound effects for key pickup
- Add animation when key is obtained
- Track Room 7 entry analytics separately from key obtainment
