# 🎰 Slot Game Visual Preview Guide

## Where to See Slot Visuals Before Installing

### 1. **SlotsMate** (Best Resource)
Website: https://www.slotsmate.com

#### Browse by Provider:
- **Novomatic**: https://www.slotsmate.com/software/novomatic
  - Book of Ra Deluxe (Egyptian theme)
  - Dolphin's Pearl (Underwater)
  - Lucky Lady's Charm (Magic/Crystal Ball)
  - Sizzling Hot (Classic Fruits)

- **NetEnt**: https://www.slotsmate.com/software/netent
  - Gonzo's Quest (Aztec Adventure)
  - Starburst (Space Gems)
  - Dead or Alive (Wild West)
  - Fruit Shop (Modern Fruits)

- **CT Interactive**: https://www.slotsmate.com/software/ct-interactive
  - Burning Hot (Fruits)
  - Mighty Kraken (Sea Monster)
  - Clover Party (Lucky Clovers)

- **AGT Software**: https://agtsoftware.com/games/agt
  - Sun City
  - Egypt
  - Panda

### 2. **Direct Preview Links**

#### Popular Novomatic Games:
```
Book of Ra Deluxe: https://www.slotsmate.com/software/novomatic/book-of-ra-deluxe
Dolphin's Pearl: https://www.slotsmate.com/software/novomatic/dolphins-pearl
Lucky Lady's Charm: https://www.slotsmate.com/software/novomatic/lucky-ladys-charm
Sizzling Hot: https://www.slotsmate.com/software/novomatic/sizzling-hot
Lord of the Ocean: https://www.slotsmate.com/software/novomatic/lord-of-the-ocean
Columbus Deluxe: https://www.slotsmate.com/software/novomatic/columbus-deluxe
```

#### Popular NetEnt Games:
```
Gonzo's Quest: https://www.slotsmate.com/software/netent/gonzos-quest
Starburst: https://www.slotsmate.com/software/netent/starburst
Dead or Alive: https://www.slotsmate.com/software/netent/dead-or-alive
Fruit Shop: https://www.slotsmate.com/software/netent/fruit-shop
Jack Hammer: https://www.slotsmate.com/software/netent/jack-hammer
```

### 3. **YouTube Gameplay Videos**

Search YouTube for:
- "Book of Ra Deluxe gameplay"
- "Gonzo's Quest slot machine"
- "NetEnt slots compilation"
- "Novomatic slots big win"

### 4. **Slotopol GitHub Documentation**

Check the actual game list from the server:
https://github.com/slotopol/server/blob/main/docs/list-all.md

This shows ALL 305 games with their aliases that you'll use in the code.

### 5. **Casino Review Sites**

These sites have screenshots and videos:
- https://www.casinomeister.com/
- https://www.askgamblers.com/
- https://www.casinoguide.com/

## Game Recommendations by Theme

### 🏆 Best for Flunks Community

#### Academic/School Theme:
- **Book of Ra Deluxe** (Novomatic) - Ancient learning
- **Pyramid of Gold** (CT Interactive) - Egyptian knowledge
- **Cleopatra** (IGT) - Historical education

#### Achievement/Trophy Theme:
- **Champagne** (Megajack) - Celebration
- **Lucky Lady's Charm** (Novomatic) - Fortune
- **Shining Stars** (AGT) - Excellence

#### Adventure/Quest Theme:
- **Gonzo's Quest** (NetEnt) - Exploration
- **Columbus Deluxe** (Novomatic) - Discovery
- **Captain's Treasure** (Playtech) - Treasure hunting

#### Colorful/Fun Theme:
- **Fruit Shop** (NetEnt) - Bright colors
- **Starburst** (NetEnt) - Cosmic visuals
- **Dolphin's Pearl** (Novomatic) - Ocean beauty

### 🎮 Game Features to Look For

**Free Spins Games** (Good for player retention):
- Book of Ra Deluxe
- Lucky Lady's Charm
- Dead or Alive
- Gonzo's Quest

**Expanding Wilds** (Exciting visuals):
- Book of Ra series
- Lord of the Ocean
- Aztec Gold

**Cascade/Avalanche Mechanics** (Modern feel):
- Gonzo's Quest
- Sugar Town
- Dancing Bananas

**Jackpot Games** (Big win potential):
- Champagne (Megajack)
- Ultra Sevens (Novomatic)

## Quick Visual Reference

### Symbol Types You'll See:

**High Value Symbols** (Big payouts):
- 👑 Royal characters (pharaohs, explorers, heroes)
- 💎 Special items (books, treasures, artifacts)
- 🎰 Game-specific symbols

**Medium Value Symbols**:
- 🎴 Picture symbols (animals, objects)
- 🔔 Classic symbols (bells, lucky 7s)

**Low Value Symbols**:
- 🅰️ Card symbols (A, K, Q, J, 10)

**Special Symbols**:
- ⭐ Scatter (triggers bonuses)
- 🌟 Wild (substitutes for others)
- 💫 Bonus (special features)

## Install Docker & Start Server

Once you've picked games you like, install Docker:

### macOS Installation:
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Docker Desktop
brew install --cask docker

# Or download directly: https://www.docker.com/products/docker-desktop/

# Start Docker Desktop from Applications folder
# Then run:
docker compose -f docker-compose.slots.yml up -d
```

### Verify Installation:
```bash
# Check Docker is running
docker --version

# Start the slot server
docker compose -f docker-compose.slots.yml up -d

# Test the API
curl http://localhost:8080/ping

# Get full game list
curl http://localhost:8080/game/algs
```

## Testing Individual Games

Once server is running, test a game:

```bash
# Sign in (creates account automatically)
curl -H "Content-Type: application/json" -d '{"email":"test@flunks.net","secret":"test123"}' -X POST http://localhost:8080/signin

# Use the token from response to create a game
curl -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{"cid":1,"uid":"test@flunks.net","alias":"novomatic/book of ra deluxe"}' -X POST http://localhost:8080/game/new
```

## My Top 10 Recommendations for Flunks

Based on visual appeal and gameplay:

1. **Book of Ra Deluxe** - Classic, proven, Egyptian theme
2. **Gonzo's Quest** - Modern cascade mechanics
3. **Lucky Lady's Charm** - Magical, colorful
4. **Starburst** - Simple, beautiful, fast-paced
5. **Dolphin's Pearl** - Calming ocean theme
6. **Sizzling Hot** - Retro fruit classic
7. **Dead or Alive** - High volatility excitement
8. **Fruit Shop** - Clean, modern fruit slot
9. **Lord of the Ocean** - Underwater Atlantis theme
10. **Columbus Deluxe** - Adventure exploration

Start with 3-5 of these and expand based on user feedback!
