# 🎰 Flunks Slots Integration Setup Guide

## Overview
This integration connects your Flunks app with the Slotopol slot machine server, allowing users to gamble their GUM on real slot games with proper RTP calculations.

## Features Implemented

### ✅ 1. Docker Slot Server
- Slotopol server running in Docker container
- 305+ games from major providers (Novomatic, NetEnt, CT Interactive, AGT, BetSoft)
- SQLite database for user wallets and game state
- JWT authentication
- RTP (Return to Player) calculations

### ✅ 2. API Wrapper
- TypeScript client for slot server API
- Automatic user registration and authentication
- Game creation, spinning, double-up, and collect functions
- Token caching for performance

### ✅ 3. GUM Integration
- Convert GUM to slot credits (1:1 ratio)
- Automatic balance syncing
- Transaction logging in Supabase
- Win/loss tracking

### ✅ 4. Flunks-Themed Slot Machine Component
- Custom React component with styled-components
- Animated reel spinning
- Flunks-themed symbols (🎓📚🏆⭐💎🔥🎯🎪)
- Real-time balance updates
- Win celebrations
- Bet controls

## Installation

### Step 1: Start the Slot Server

```bash
# Start the Slotopol server with Docker
docker-compose -f docker-compose.slots.yml up -d

# Check logs
docker-compose -f docker-compose.slots.yml logs -f

# Server should be running at http://localhost:8080
```

### Step 2: Configure Environment

```bash
# Copy the example env file
cp .env.slots.example .env.local

# Add to your .env.local:
NEXT_PUBLIC_SLOTS_API_URL=http://localhost:8080
JWT_SECRET=your-super-secret-jwt-key
NEXT_PUBLIC_SLOTS_ENABLED=true
```

### Step 3: Test the API

```bash
# Ping the server
curl http://localhost:8080/ping

# Get list of games
curl http://localhost:8080/game/algs

# You should see JSON response with game info
```

### Step 4: Add Slot Machine to Your App

Create a new page or add to existing location:

```tsx
// src/app/slots/page.tsx
'use client';

import { useUnifiedWallet } from '@/contexts/UnifiedWalletContext';
import FlunksSlotMachine from '@/components/slots/FlunksSlotMachine';

export default function SlotsPage() {
  const { walletAddress } = useUnifiedWallet();

  if (!walletAddress) {
    return <div>Please connect your wallet to play slots!</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Flunks Casino</h1>
      <FlunksSlotMachine 
        walletAddress={walletAddress}
        gameAlias="Novomatic/Book of Ra Deluxe"
      />
    </div>
  );
}
```

## Available Games

The server includes 305+ slot games. Popular ones:

### Novomatic
- `Novomatic/Book of Ra Deluxe` - Egyptian themed with expanding symbols
- `Novomatic/Dolphin's Pearl` - Underwater adventure
- `Novomatic/Lucky Lady's Charm` - Magic themed
- `Novomatic/Sizzling Hot` - Classic fruit slot

### NetEnt
- `NetEnt/Gonzo's Quest` - Cascade style gameplay
- `NetEnt/Starburst` - Space themed
- `NetEnt/Fruit Shop` - Free spins on every win
- `NetEnt/Dead or Alive` - Western themed

### CT Interactive
- `CT Interactive/Burning Hot` - Modern fruit slot
- `CT Interactive/Clover Party` - Lucky clover themed
- `CT Interactive/Mighty Kraken` - Sea monster adventure

### AGT
- `AGT/Sun City` - Free games continuation
- `AGT/Egypt` - Minislot for wild multipliers
- `AGT/Panda` - Asian themed

## API Usage Examples

### Get Game List
```typescript
import { slotopolClient } from '@/lib/slots/slotopolClient';

// Get all games
const allGames = await slotopolClient.getGameList();

// Filter by provider
const novomaticGames = await slotopolClient.getGameList('novomatic');
```

### Create and Play Game
```typescript
// Create game instance
const game = await slotopolClient.createGame(
  walletAddress,
  'Novomatic/Book of Ra Deluxe',
  10 // initial bet
);

// Spin!
const result = await slotopolClient.spin(walletAddress, game.gid);

// Check winnings
if (result.gain > 0) {
  console.log(`You won ${result.gain}!`);
}
```

### GUM Integration
```typescript
import { processSlotSpin } from '@/lib/slots/gumIntegration';

// Process a spin with GUM
const result = await processSlotSpin(
  walletAddress,
  betAmount, // GUM will be deducted
  gameId
);

if (result.success && result.winAmount) {
  console.log(`Won ${result.winAmount} GUM!`);
}
```

## Database Schema

The GUM integration uses your existing Supabase tables:

- `user_gum_balances` - User GUM balances
- `gum_transactions` - Transaction history (slot_bet, slot_win)

New transaction types added:
- `slot_bet` - GUM deducted for bet
- `slot_win` - GUM awarded for win

## Configuration

### Slot Server Config (`slots-config/slot-app.yaml`)

```yaml
club:
  default_club_id: 1
  default_bank: 1000000  # Club bankroll
  default_fund: 100000   # Jackpot fund
  jackpot_rate: 2.0      # 2% of bets go to jackpot

game:
  default_mrtp: 95.0     # 95% Return to Player
  max_spin_attempts: 1000
  min_jackpot: 1000
```

### Docker Config (`docker-compose.slots.yml`)

- Server runs on port 8080
- SQLite database stored in `./slots-data`
- Configuration in `./slots-config`

## Advanced Features

### Double Up Gambling
```typescript
// After a win, gamble it on red/black
const doubleUpResult = await slotopolClient.doubleUp(
  walletAddress,
  gameId,
  2 // multiplier (2x for red/black)
);
```

### Set Bet Lines
```typescript
// Change number of active paylines
await slotopolClient.setLines(walletAddress, gameId, 20);
```

### Game Info
```typescript
// Get current game state
const info = await slotopolClient.getGameInfo(walletAddress, gameId);
console.log(info.screen); // Current reel positions
console.log(info.wallet); // Current balance
```

## Security Notes

1. **JWT Secret**: Change the JWT_SECRET in production
2. **CORS**: Update allowed_origins in slot-app.yaml for production domains
3. **Rate Limiting**: Consider adding rate limiting for API calls
4. **Balance Validation**: Server validates all bets against user balance

## Troubleshooting

### Server won't start
```bash
# Check if port 8080 is in use
lsof -i :8080

# View logs
docker-compose -f docker-compose.slots.yml logs
```

### Connection errors
```bash
# Test server is responding
curl http://localhost:8080/ping

# Should return: {"server":"slotopol/v0.12.0"}
```

### GUM balance not updating
- Check Supabase connection
- Verify wallet_address matches exactly
- Check browser console for errors

## Next Steps

1. **Add More Games**: Browse the 305+ available games
2. **Tournament Mode**: Create slot tournaments with leaderboards
3. **Jackpot System**: Enable progressive jackpots
4. **Social Features**: Share big wins, spectator mode
5. **Mobile Optimization**: Test and optimize for mobile
6. **Sound Effects**: Add slot machine sounds
7. **Animations**: Enhance win animations
8. **Analytics**: Track RTP, popular games, whale activity

## Support

For issues:
- Slotopol Server: https://github.com/slotopol/server
- Flunks Integration: Check your codebase or Discord

## License

- Slotopol Server: MIT License
- Flunks Integration: Your project license

---

**Happy Spinning! 🎰💰**
