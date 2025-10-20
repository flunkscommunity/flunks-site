# Zoltar Fortune Machine - Final Update

## ✅ Features Added

### 1. **Statistics Tracking** 📊
The Zoltar machine now tracks your gambling performance:
- **Games Played**: Total number of times you've consulted Zoltar
- **Win Rate**: Your percentage of wins (shown in green if you've won)
- **Total Spent**: How much GUM you've spent on fortune telling
- **Net Result**: Your profit/loss (green if positive, red if negative)

Stats are saved per wallet address in localStorage and persist across sessions!

### 2. **Scrollable Window** 📜
- The main container now has `overflow: 'auto'` for proper scrolling
- Content starts at the top with `justifyContent: 'flex-start'`
- All elements have proper z-index values for layering

### 3. **Crystal Ball Icon in Header** 🔮
- Updated header icon from `/images/icons/crystal-ball.png` to `/images/icons/zoltar-icon.png`
- Icon appears next to "Mystical Zoltar Fortune Machine" in the window title bar

### 4. **Enhanced Messages** ✨
- **5 Winning Messages** with lucky numbers:
  - "The spirits smile upon you! Fortune favors the bold! Your lucky numbers: 3, 7, 9, 1"
  - "The cosmic forces align! Great wealth awaits you! Your lucky numbers: 2, 5, 8, 4"
  - "The ancient prophecy comes true! You are chosen! Your lucky numbers: 1, 6, 3, 9"
  - "Destiny has spoken! The universe rewards your courage! Your lucky numbers: 4, 8, 2, 7"
  - "The fates have decided! Victory is yours, brave soul! Your lucky numbers: 5, 1, 6, 3"

- **35 Losing Messages** in mysterious gypsy tone
  - All messages encourage players to try again
  - Themes include: patience, cosmic alignment, prophecy, mystical forces, chakras, etc.

### 5. **Visual Layout** 🎨
The complete layout from top to bottom:
1. **Zoltar Image** - Golden ornate frame with corner decorations (✦)
2. **Title Section** - "☾ THE GREAT ZOLTAR ☽" with gradient text
3. **Subtitle** - "🔮 Mystic Oracle of Destiny 🔮"
4. **Fortune Machine** - Wooden cabinet with:
   - Purple crystal ball
   - Red glowing eyes
   - Golden "PLAY" button
   - Balance display
   - Win/loss result overlay
5. **Statistics Panel** - Your mystical journey stats

## 📈 Statistics Logic

```typescript
const winRate = (totalWins / totalPlays) * 100
const netResult = totalWon - totalSpent

// Updates happen after each game:
- totalPlays++
- totalSpent += 10
- If win: totalWins++, totalWon += 250
```

## 🎮 Game Flow

1. User clicks "🔮 PLAY (10 GUM)"
2. System deducts 10 GUM
3. Updates stats: totalPlays++, totalSpent += 10
4. 3-second animation/waiting period
5. Random outcome generated (1/30 chance to win)
6. If win:
   - Award 250 GUM
   - Update: totalWins++, totalWon += 250
   - Show gold message with lucky numbers
7. If lose:
   - Show pink message with mystical wisdom
8. Save stats to localStorage
9. Result displays for 5 seconds
10. Reset for next game

## 🎯 Current Settings

- **Cost to Play**: 10 GUM
- **Win Payout**: 250 GUM
- **Win Chance**: 1/30 (3.33%)
- **Expected Value**: -7.67 GUM per play (house edge)
- **Animation Time**: 3 seconds
- **Result Display**: 5 seconds

## 🔧 Technical Details

- Stats saved to: `localStorage['zoltar_stats_{walletAddress}']`
- GUM spend source: `'zoltar_fortune_machine'`
- GUM earn source: `'zoltar_fortune_machine_win'`
- Random generation: `crypto.getRandomValues()` for secure randomness
- Image path: `/images/backdrops/zoltar-background.png`
- Icon path: `/images/icons/zoltar-icon.png`

## 🎨 Color Scheme

- Background: Purple gradient (`#1a0033` → `#330066`)
- Machine: Brown/tan gradient (`#8B4513` → `#CD853F`)
- Border/Accents: Gold (`#FFD700`)
- Crystal Ball: Purple gradient with white highlight
- Eyes: Red gradient (`#FF4500` → `#8B0000`)
- Win Text: Gold (`#FFD700`)
- Lose Text: Hot Pink (`#FF69B4`)
- Stats: Lavender (`#E6E6FA`) with green/red highlights

Everything is now working and looks great! 🎰✨
