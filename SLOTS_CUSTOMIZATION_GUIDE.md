# Flunks Slot Machine - Asset Customization Guide

## Overview
The slot machine is now built with a full casino facade including:
- Golden cabinet with 3D effects
- Digital screen display
- Big red spin button with lever
- Bet controls
- Payout display
- Win lines overlay

## Customizing Symbols

### Current Symbols (Emoji-based)
Located in `/src/pages/slots-play.tsx`:
```typescript
const SYMBOLS = ['🎓', '📚', '🏆', '⭐', '💎', '🔥', '🎯', '🎪'];
```

### Option 1: Use Image Assets
Replace emojis with Flunks character images:

```typescript
const SYMBOLS = [
  '/assets/slots/flunk-regular.png',
  '/assets/slots/flunk-evolved.png',
  '/assets/slots/flunk-golden.png',
  '/assets/slots/gum-pile.png',
  '/assets/slots/diploma.png',
  '/assets/slots/backpack.png',
  '/assets/slots/keyhole.png',
  '/assets/slots/wild-symbol.png',
];
```

Then update the Reel component to display images:
```typescript
<Reel key={index} spinning={spinning}>
  {symbol.endsWith('.png') ? (
    <img src={symbol} alt="symbol" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
  ) : (
    symbol
  )}
</Reel>
```

### Option 2: Use Flunks NFT Metadata
Pull symbols from your Semester Zero NFTs:

```typescript
const FLUNKS_SYMBOLS = [
  { img: '/nfts/flunk-1.png', name: 'Regular Flunk', value: 10 },
  { img: '/nfts/flunk-evolved.png', name: 'Evolved Flunk', value: 50 },
  { img: '/nfts/golden-gum.png', name: 'Golden Gum', value: 100 },
  // ... more
];
```

### Option 3: Use SVG Icons
Create custom Flunks-styled SVG symbols for crisp rendering at any size.

## Customizing Colors/Theme

### Cabinet Colors
```typescript
const SlotMachine = styled.div\`
  background: linear-gradient(180deg, 
    #YOUR_PRIMARY_COLOR 0%, 
    #YOUR_SECONDARY_COLOR 50%, 
    #YOUR_PRIMARY_COLOR 100%
  );
  border: 8px solid #YOUR_ACCENT_COLOR;
\`;
```

### Brand the Top Banner
```typescript
&::after {
  content: '🎰 YOUR CUSTOM TEXT 🎰';
  // ... styling
}
```

## Asset Folders Structure

Recommended folder structure:
```
public/
  assets/
    slots/
      symbols/
        flunk-regular.png
        flunk-evolved.png
        gum-pile.png
        diploma.png
        wild.png
        scatter.png
      sounds/
        spin.mp3
        win.mp3
        jackpot.mp3
      animations/
        particle-effects.json
```

## Symbol Values & Payouts

Configure payout multipliers:
```typescript
const SYMBOL_VALUES = {
  '🎓': 2,   // Regular symbol - 2x bet
  '📚': 2,
  '🏆': 5,   // Medium symbol - 5x bet
  '⭐': 5,
  '💎': 10,  // High symbol - 10x bet
  '🔥': 20,  // Wild - 20x bet
  '🎯': 50,  // Scatter - 50x bet
  '🎪': 100, // Jackpot - 100x bet
};
```

## Adding Sound Effects

```typescript
const playSound = (type: 'spin' | 'win' | 'jackpot') => {
  const audio = new Audio(\`/assets/slots/sounds/\${type}.mp3\`);
  audio.play();
};

// In spinReels function:
playSound('spin');

// On win:
if (win > 0) {
  playSound(win > 50 ? 'jackpot' : 'win');
}
```

## Reel Configuration

### Change Number of Reels
```typescript
// Change from 3 to 5 reels:
const [reels, setReels] = useState(['🎓', '📚', '🏆', '⭐', '💎']);

// Update ReelsContainer width in styled component
```

### Add More Symbols Per Reel
```typescript
// Show 3 symbols per reel instead of 1:
const [reels, setReels] = useState([
  ['🎓', '📚', '🏆'], // Reel 1
  ['⭐', '💎', '🔥'], // Reel 2
  ['🎯', '🎪', '🎓'], // Reel 3
]);
```

## Animation Customization

### Spin Speed
```typescript
const spinDuration = 2000; // Change to 1000 for faster, 3000 for slower
```

### Reel Animation
```css
@keyframes spinReel {
  0% { transform: translateY(0); }
  100% { transform: translateY(-20px); } // Change -20px to -40px for more movement
}
```

## Next Steps

1. **Create Symbol Assets**: Design 8-10 Flunks-themed symbols (PNG, 256x256px recommended)
2. **Place in /public/assets/slots/symbols/**: Add your image files
3. **Update SYMBOLS array**: Replace emoji with image paths
4. **Update Reel component**: Add image rendering logic
5. **Test**: Play some spins to see your custom symbols!

## Example: Full Custom Implementation

```typescript
// Custom Flunks symbols with metadata
const FLUNKS_SYMBOLS = [
  { id: 'regular', img: '/assets/slots/symbols/flunk-regular.png', multiplier: 2 },
  { id: 'evolved', img: '/assets/slots/symbols/flunk-evolved.png', multiplier: 5 },
  { id: 'golden', img: '/assets/slots/symbols/flunk-golden.png', multiplier: 10 },
  { id: 'gum', img: '/assets/slots/symbols/gum.png', multiplier: 3 },
  { id: 'diploma', img: '/assets/slots/symbols/diploma.png', multiplier: 7 },
  { id: 'wild', img: '/assets/slots/symbols/wild.png', multiplier: 20 },
  { id: 'scatter', img: '/assets/slots/symbols/scatter.png', multiplier: 50 },
  { id: 'jackpot', img: '/assets/slots/symbols/jackpot.png', multiplier: 100 },
];

// Calculate wins based on symbol multipliers
const calculateWin = (reelResults: typeof FLUNKS_SYMBOLS[]) => {
  // Check for matching symbols
  if (reelResults[0].id === reelResults[1].id && reelResults[1].id === reelResults[2].id) {
    return bet * reelResults[0].multiplier;
  }
  return 0;
};
```

## Support
Need help customizing? Check the styled-components in `/src/pages/slots-play.tsx` and adjust colors, sizes, animations to match your Flunks brand!
