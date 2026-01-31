# 🎱 Pool Game Integration Guide

## Current Status
✅ Basic pool game component created with menu and scoring  
✅ Integrated into Four Thieves Bar → Back Room → Pool Room  
✅ GUM reward system connected  
🔄 Next: Add full physics engine from Classic-Pool-Game

## Phase 2: Full Game Integration

### Step 1: Clone the Classic Pool Game
```bash
cd /tmp
git clone https://github.com/henshmi/Classic-Pool-Game.git
```

### Step 2: Copy Assets to Flunks Site
Copy these folders from Classic-Pool-Game to our project:

```bash
# Copy assets
cp -r /tmp/Classic-Pool-Game/assets/sprites/* /Users/skeremy/Desktop/flunks-site/public/Games/pool-game/sprites/
cp -r /tmp/Classic-Pool-Game/assets/sounds/* /Users/skeremy/Desktop/flunks-site/public/Games/pool-game/sounds/

# Copy game scripts
cp -r /tmp/Classic-Pool-Game/script/* /Users/skeremy/Desktop/flunks-site/src/components/games/pool/engine/
```

### Step 3: Customize Assets for Bar Theme

Replace these sprites with bar-themed versions:

**Table Background** (`spr_background4.png`)
- Current: Generic green felt table
- Custom: Dark wood table with bar aesthetic, maybe worn edges
- Dimensions: Match original

**Ball Sprites**
- `spr_ball2.png` (white cue ball)
- `spr_redBall2.png` (solid red)
- `spr_yellowBall2.png` (solid yellow)  
- `spr_blackBall2.png` (8-ball)
- Can add custom designs while keeping physics the same

**Cue Stick** (`spr_stick.png`)
- Replace with vintage bar cue stick design

**Menu Backgrounds**
- `main_menu_background.png` - Replace with Four Thieves bar interior shot

### Step 4: Integrate Physics Engine

Update `PoolGame.tsx` to use the Classic Pool Game engine:

```typescript
// Import the game modules
import { Game } from './engine/Game';
import { GameWorld } from './engine/GameWorld';
import { AITrainer } from './engine/AI/AITrainer';

// Initialize in useEffect
useEffect(() => {
  if (canvasRef.current) {
    // Set AI difficulty training iterations
    const trainingIterations = {
      easy: 30,
      medium: 50,
      hard: 100
    };
    
    // Start game with AI opponent
    Game.start('pool-container', 'pool-canvas', 800, 600);
    AI.init(Game.gameWorld, Game.policy);
    // ... rest of setup
  }
}, []);
```

### Step 5: Strip Out Menu System

Remove or hide:
- Main menu screen (we handle this in React)
- 2-player mode (we only need Player vs CPU)
- Settings screens (we manage these separately)

Keep:
- AI difficulty selection (we handle in React)
- Game over screen (or replace with our design)
- Score tracking

### Step 6: GUM Reward Integration

Add to game end handler:

```typescript
// When player wins
if (winner === 'player') {
  const rewardAmount = 50; // Base reward
  onGumChange(rewardAmount);
  
  // Record win in database
  await fetch('/api/pool/record-win', {
    method: 'POST',
    body: JSON.stringify({
      walletAddress,
      difficulty: aiDifficulty,
      gumEarned: rewardAmount
    })
  });
}
```

## Asset Customization Ideas

### Bar Theme Colors
- **Table Felt**: Deep emerald green with subtle wear texture
- **Wood Rails**: Dark oak with brass corners
- **Pockets**: Black leather pocket covers
- **Lighting**: Overhead pool table lamp effect

### Custom Ball Designs
Could replace standard solids with:
- Flunks character faces on balls
- Semester Zero themed designs
- Keep physics identical, just visual changes

### Sound Effects
- Ball collisions → Replace with satisfying "clack"
- Pocket drop → Cash register "ching"
- Victory → Bar crowd cheer
- Background → Muffled bar ambiance

## File Structure
```
src/components/games/pool/
├── PoolGame.tsx           # Main React component (already created)
├── engine/                # Classic Pool Game code (to add)
│   ├── Game.js
│   ├── GameWorld.js
│   ├── GamePolicy.js
│   ├── AI/
│   │   ├── AITrainer.js
│   │   ├── AIPolicy.js
│   │   └── Opponent.js
│   ├── game_objects/
│   │   ├── Ball.js
│   │   ├── Stick.js
│   │   └── Player.js
│   └── ... (other modules)
└── POOL_GAME_SETUP.md     # This file

public/Games/pool-game/
├── sprites/               # Visual assets
│   ├── spr_background4.png
│   ├── spr_ball2.png
│   ├── spr_stick.png
│   └── ... (other sprites)
└── sounds/               # Audio assets
    ├── Strike.wav
    ├── BallsCollide.wav
    └── Hole.wav
```

## Next Steps

1. ✅ Test current basic implementation
2. Clone Classic-Pool-Game repo
3. Copy and integrate physics engine
4. Test AI opponent functionality
5. Customize assets for bar theme
6. Add GUM rewards system
7. Polish UI and transitions

## Notes

- The Classic Pool Game uses vanilla JS with Canvas2D
- We'll wrap it in our React component for state management
- Physics will run identically to the original
- All visual assets are easily swappable PNG files
- AI difficulty is controlled by training iterations (30-700)

## Testing

Access the pool game at:
1. Open Four Thieves Bar
2. Enter the bar interior (day or night)
3. Click "Back Room"
4. Click "🎱 Pool Room" button
5. Choose AI difficulty and play!
