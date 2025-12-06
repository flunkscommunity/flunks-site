# Flunks Slot Machine - Asset Replacement Guide

## 🎨 Symbol Images Needed

Create **12 symbol images** at **256x256 pixels** (PNG with transparency):

### Low-Tier Symbols (2-4x payouts)
1. `pencil.png` - ✏️ Pencil (0.5x/1.0x/2.0x)
2. `notebook.png` - 📓 Notebook (0.8x/1.5x/3.0x)
3. `backpack.png` - 🎒 Backpack (1.0x/2.0x/4.0x)

### Mid-Tier Symbols (5-12x payouts)
4. `flunk_basic.png` - 🧑‍🎓 Basic Flunk (1.2x/2.5x/5.0x)
5. `diploma.png` - 📜 Diploma (1.5x/3.0x/7.0x)
6. `trophy.png` - 🏆 Trophy (2.0x/4.0x/9.0x)

### High-Tier Symbols (12-40x payouts)
7. `flunk_evolved.png` - 🎓 Evolved Flunk (2.5x/5.0x/12.0x)
8. `gum_pile.png` - 💰 GUM Pile (3.0x/7.0x/15.0x)
9. `golden_ticket.png` - 🎫 Golden Ticket (4.0x/10.0x/25.0x)

### Premium Symbols (40-80x payouts)
10. `wild_flunk.png` - ⭐ Wild Flunk (5.0x/15.0x/40.0x)
11. `flunks_logo.png` - 🏛️ Flunks Logo (8.0x/25.0x/80.0x)

### Special Symbol
12. `scatter_keyhole.png` - 🔑 Keyhole Scatter (triggers free spins)

---

## 📁 Where to Place Assets

Create this folder structure:
```
public/
  slots/
    symbols/
      pencil.png
      notebook.png
      backpack.png
      flunk_basic.png
      diploma.png
      trophy.png
      flunk_evolved.png
      gum_pile.png
      golden_ticket.png
      wild_flunk.png
      flunks_logo.png
      scatter_keyhole.png
    animations/
      (optional win celebration GIFs)
    sounds/
      (optional sound effects)
```

---

## 🔧 How to Update Code After Adding Images

### Step 1: Update the symbol display function

In `src/pages/slots-play.tsx`, replace the `SYMBOL_EMOJIS` mapping with image paths:

```typescript
// OLD (emojis):
const SYMBOL_EMOJIS: Record<string, string> = {
  pencil: '✏️',
  notebook: '📓',
  // ... etc
};

// NEW (images):
const SYMBOL_IMAGES: Record<string, string> = {
  pencil: '/slots/symbols/pencil.png',
  notebook: '/slots/symbols/notebook.png',
  backpack: '/slots/symbols/backpack.png',
  flunk_basic: '/slots/symbols/flunk_basic.png',
  diploma: '/slots/symbols/diploma.png',
  trophy: '/slots/symbols/trophy.png',
  flunk_evolved: '/slots/symbols/flunk_evolved.png',
  gum_pile: '/slots/symbols/gum_pile.png',
  golden_ticket: '/slots/symbols/golden_ticket.png',
  wild_flunk: '/slots/symbols/wild_flunk.png',
  flunks_logo: '/slots/symbols/flunks_logo.png',
  scatter_keyhole: '/slots/symbols/scatter_keyhole.png',
};
```

### Step 2: Update the JSX rendering

Find this part in the component (around line 670):

```tsx
// OLD:
<div key={rowIndex} style={{ fontSize: '2.5em', lineHeight: '1.2' }}>
  {SYMBOL_EMOJIS[symbolKey] || '❓'}
</div>

// NEW:
<img 
  key={rowIndex} 
  src={SYMBOL_IMAGES[symbolKey] || '/slots/symbols/pencil.png'}
  alt={symbolKey}
  style={{ 
    width: '80px', 
    height: '80px', 
    objectFit: 'contain',
    filter: spinning ? 'blur(2px)' : 'none',
    transition: 'filter 0.3s'
  }}
/>
```

---

## 🎨 Design Tips

### Style Guidelines:
- **Cartoon/Illustrative style** to match Flunks branding
- **Bright, saturated colors** for casino feel
- **Clear silhouettes** readable at small sizes
- **Glow/outline effects** optional for premium symbols
- **Transparent backgrounds** (PNG)
- **Consistent lighting direction** across all symbols

### Symbol Hierarchy (Visual Weight):
- **Low-tier**: Simple, flat colors
- **Mid-tier**: Add gradients, subtle effects
- **High-tier**: Shiny, metallic, particle effects
- **Premium**: Glowing, animated (if GIF), maximum detail

### Color Palette Suggestions:
- **Pencil**: Yellow/orange
- **Notebook**: Blue/purple
- **Backpack**: Green/teal
- **Flunks**: Your character colors
- **GUM**: Pink/purple (candy colors)
- **Golden Ticket**: Gold/yellow with shine
- **Wild/Logo**: Rainbow or multi-color

---

## 🎬 Optional: Win Animations

For extra polish, add celebration GIFs that play when symbols win:

```
public/slots/animations/
  pencil_win.gif
  notebook_win.gif
  trophy_win.gif
  wild_flunk_celebration.gif
  jackpot_burst.gif
```

These can be triggered in the code when `winningLines` contains matching symbols.

---

## 🔊 Optional: Sound Effects

Add audio files for immersion:

```
public/slots/sounds/
  spin.wav         - Reel spinning sound (loops)
  stop.wav         - Reel stopping sound
  win.wav          - Small win chime
  big_win.wav      - Big win fanfare
  jackpot.wav      - Jackpot celebration
  button_click.wav - UI button sounds
```

Implement using the Web Audio API or `<audio>` tags in React.

---

## 📊 Current Paytable (For Reference)

| Symbol | Tier | 3-of-a-kind | 4-of-a-kind | 5-of-a-kind |
|--------|------|-------------|-------------|-------------|
| Pencil | Low | 0.5x | 1.0x | 2.0x |
| Notebook | Low | 0.8x | 1.5x | 3.0x |
| Backpack | Low | 1.0x | 2.0x | 4.0x |
| Basic Flunk | Mid | 1.2x | 2.5x | 5.0x |
| Diploma | Mid | 1.5x | 3.0x | 7.0x |
| Trophy | Mid | 2.0x | 4.0x | 9.0x |
| Evolved Flunk | High | 2.5x | 5.0x | 12.0x |
| GUM Pile | High | 3.0x | 7.0x | 15.0x |
| Golden Ticket | High | 4.0x | 10.0x | 25.0x |
| Wild Flunk | Premium | 5.0x | 15.0x | 40.0x |
| Flunks Logo | Premium | **8.0x** | **25.0x** | **80x** |

**Scatter Keyhole**: 3+ anywhere = 10-15 free spins!

---

## 🚀 Testing Your Assets

1. Add images to `public/slots/symbols/`
2. Update code as shown above
3. Run `npm run dev`
4. Visit `/slots-play?gameId=92`
5. Click SPIN and watch your assets appear!

---

## 🎰 10 Paylines Visualized

```
Line 1: ═══════  (Middle straight)
Line 2: ───────  (Top straight)
Line 3: ───────  (Bottom straight)
Line 4: ╲     ╱  (V shape)
Line 5: ╱     ╲  (Inverted V)
Line 6: ──╲ ╱──  (Rising diagonal)
Line 7: ──╱ ╲──  (Falling diagonal)
Line 8: ──╱══╲   (Mountain)
Line 9: ──╲══╱   (Valley)
Line 10: ═╱═╲═   (W shape)
```

Each winning payline will be highlighted when it triggers!

---

**Questions?** The system is fully functional with emojis right now - just drop in your PNGs and update the code! 🎉
