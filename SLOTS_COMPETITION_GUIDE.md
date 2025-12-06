# Slots Graphics & Leaderboard System

## Why You're Seeing Graduation Hats (Emojis)

**The Real Deal:**
- The Slotopol server is an **open-source game engine** that provides the math/logic for slots
- It sends back **numeric symbol IDs** (like: [3, 5, 7]) not actual graphics
- Real casino sites (like the Gonzo's Quest you saw) use **licensed graphics from NetEnt, Novomatic, etc.**
- Those graphics cost $10,000s-$100,000s per game in licensing fees

**Your Options:**

### Option 1: Use Flunks-Themed Symbols (Recommended)
Replace emojis with your own Flunks characters:
```typescript
const SYMBOLS = [
  '/assets/slots/flunk-regular.png',   // Symbol 0
  '/assets/slots/flunk-evolved.png',   // Symbol 1
  '/assets/slots/gum-pile.png',        // Symbol 2
  '/assets/slots/diploma.png',         // Symbol 3
  '/assets/slots/backpack.png',        // Symbol 4
  '/assets/slots/trophy.png',          // Symbol 5
  '/assets/slots/keyhole.png',         // Symbol 6
  '/assets/slots/wild.png',            // Symbol 7
];
```

### Option 2: Generic Themed Symbols
Use free casino-style symbols:
- Fruits (cherries, lemons, watermelons)
- Lucky symbols (7s, bells, stars)
- Card suits (♠️ ♥️ ♦️ ♣️)
- Gems/jewels

### Option 3: Keep Emojis
They work fine for gameplay testing, just not as visually impressive.

## Leaderboard Competition System

**What I Built:**

### Database Tables
- `slots_leaderboard` - Records every spin with win multiplier
- User stats tracking (biggest win, total won, favorite game)

### Competition Features

**1. Multiple Time Periods:**
- Daily champions (reset every 24 hours)
- Weekly champions (reset every Monday)
- Monthly champions
- All-time legends

**2. Multiple Game Categories:**
- Overall biggest multiplier (any game)
- Per-game leaderboards (best at Double Diamond, etc.)
- Highest single win (GUM amount)
- Most consistent winner (win rate)

**3. Prizes You Could Award:**
- GUM rewards for top 10 daily
- Exclusive NFT badges for monthly champions
- Custom "Slot King" role on Discord
- Real prizes (if you want to go big)

### Usage

**Record a spin:**
```typescript
await fetch('/api/slots/record-spin', {
  method: 'POST',
  body: JSON.stringify({
    userId: user.id,
    gameId: 92,
    gameName: 'Double Diamond',
    bet: 10,
    win: 50,
    spinResult: { /* raw server data */ }
  })
});
```

**Get leaderboard:**
```typescript
// Daily top 100
const daily = await fetch('/api/slots/leaderboard?period=daily');

// All-time for specific game
const gameLeaders = await fetch('/api/slots/leaderboard?period=all_time&gameId=92');
```

### Competition Ideas

**1. Daily Races:**
- Who can get the biggest multiplier today?
- Prize: 100 GUM to winner

**2. Weekly Tournaments:**
- Play 100 spins, highest average multiplier wins
- Prize: Exclusive "Slot Champion" NFT

**3. Special Events:**
- "Lucky 777" - First person to hit 77.7x multiplier wins
- "High Roller" - Biggest single bet win over 1000 GUM
- "Comeback King" - Most comebacks from losses

**4. Social Competition:**
- Share wins on Discord/Twitter for bonus entries
- Screenshot verification for mega wins
- Community votes on best winning streak

## Next Steps

1. **Run the SQL migration:**
   ```bash
   # In Supabase SQL Editor
   # Copy contents of sql-migrations/add_slots_leaderboard.sql
   ```

2. **Create Flunks symbol graphics:**
   - 8 symbols at 256x256px
   - PNG with transparency
   - Flunks-themed (characters, items, etc.)

3. **Build leaderboard page:**
   - `/slots-leaderboard` to display rankings
   - Real-time updates when someone wins big
   - Confetti animation for new #1

4. **Set prize structure:**
   - Decide GUM rewards for top ranks
   - Create exclusive NFT badges
   - Schedule automated payouts

## The "Big Prize" Competition

**Example Setup:**
- Every user starts with 1000 GUM
- Play any slot game
- Whoever gets the **highest multiplier** in 7 days wins
- Grand prize: 10,000 GUM + Custom NFT + Discord role

**Leaderboard shows:**
- Your rank: #47
- Your best: 23.5x multiplier
- Current leader: "FlunksMaster" with 156.2x
- Time remaining: 3 days

**Makes it competitive because:**
- RTP is fair (95% average)
- Higher bets = bigger potential wins
- Risk/reward strategy matters
- Social sharing drives engagement

Ready to implement this?
