# 🎰 3-REEL SLOT MACHINE - ASSET GUIDE

## ✅ Desktop Apps Removed
- ❌ Report Card (hidden from desktop)
- ❌ Bulletin Board (hidden from desktop)

## 🎰 NEW: 3-Reel Configuration

Your slot machine is now a **classic 3-reel style** like those handheld games in your photo!

### Layout:
```
┌─────┬─────┬─────┐
│  A  │  B  │  C  │  ← Top row
├─────┼─────┼─────┤
│  D  │  E  │  F  │  ← Middle row (main payline)
├─────┼─────┼─────┤
│  G  │  H  │  I  │  ← Bottom row
└─────┴─────┴─────┘
  Reel  Reel  Reel
   1     2     3
```

### 5 Paylines:
1. **Middle row** (straight) - 🟡🟡🟡
2. **Top row** (straight) - 🟡🟡🟡
3. **Bottom row** (straight) - 🟡🟡🟡
4. **Diagonal down** (↘️) - 🟡🟡🟡
5. **Diagonal up** (↗️) - 🟡🟡🟡

### Win Requirement:
**All 3 symbols must match** on a payline to win!

---

## 📦 ASSETS YOU NEED (Simplified!)

### **ONLY 6 SYMBOLS NEEDED!** 

Since 3-reel slots are simpler, you can reduce to just 6 unique symbols:

#### **Tier 1: Common (0.5-2x payout)**
1. **Pencil** ✏️ - 0.5x (appears most often)
2. **Notebook** 📓 - 0.8x

#### **Tier 2: Uncommon (1.2-4x payout)**
3. **Backpack** 🎒 - 1.0x
4. **Basic Flunk** 🧑‍🎓 - 1.2x

#### **Tier 3: Rare (2-9x payout)**
5. **Trophy** 🏆 - 2.0x

#### **Tier 4: JACKPOT (8x payout)**
6. **Flunks Logo** 🏛️ - 8.0x (super rare!)

---

## 🎨 Required Static Images (PNG)

### Slot Symbols - **6 PNGs at 256x256px:**
```
public/slots/images/
  ├── pencil.png          (common)
  ├── notebook.png        (common)
  ├── backpack.png        (uncommon)
  ├── flunk_basic.png     (uncommon)
  ├── trophy.png          (rare)
  └── flunks_logo.png     (JACKPOT!)
```

### Background:
```
public/slots/images/
  └── your_background.png  (1920x1080 recommended)
```

**Total Static Images: 7** (6 symbols + 1 background)

---

## 🎬 Optional Celebration GIFs

### Minimal Set (6 GIFs):
One celebration per symbol when you win:
```
public/slots/animations/
  ├── pencil_win.gif
  ├── notebook_win.gif
  ├── backpack_win.gif
  ├── flunk_basic_win.gif
  ├── trophy_win.gif
  └── flunks_logo_win.gif  ← Big jackpot animation!
```

### Full Set (12 GIFs):
Two animations per symbol (small win + big win):
```
public/slots/animations/
  ├── pencil_win.gif
  ├── pencil_celebration.gif
  ├── notebook_win.gif
  ├── notebook_celebration.gif
  ├── backpack_win.gif
  ├── backpack_celebration.gif
  ├── flunk_basic_win.gif
  ├── flunk_basic_celebration.gif
  ├── trophy_win.gif
  ├── trophy_celebration.gif
  ├── flunks_logo_win.gif
  └── flunks_logo_celebration.gif
```

---

## 🎯 Asset Comparison

| Configuration | Static PNGs | GIFs (Optional) | Total |
|---------------|-------------|-----------------|-------|
| **5-Reel (Complex)** | 13 symbols + 1 bg | 24-26 | 38-40 |
| **3-Reel (Simple)** | 6 symbols + 1 bg | 6-12 | 13-19 |

**You saved 50% of the work by going 3-reel!** 🎉

---

## 📝 Current Symbol Mapping

Right now your slots use these Halloween assets:
```javascript
pencil      → beetle.png
notebook    → spider.png
backpack    → bat.png
flunk_basic → ghost.png
trophy      → skeleton.png
flunks_logo → haunted_house.png
```

Just replace those 6 files with your Flunks-themed versions!

---

## ⚡ Quick Setup Steps

1. **Create 6 symbol PNGs** (256x256, transparent)
2. **Copy to** `public/slots/images/`
3. **Name them exactly:**
   - pencil.png
   - notebook.png
   - backpack.png
   - flunk_basic.png
   - trophy.png
   - flunks_logo.png
4. **Add background** as `your_background.png`
5. **Update code** to point to new image names
6. **Done!** 🎰

---

## 🎮 Gameplay Example

**Spin Result:**
```
┌──────────┬──────────┬──────────┐
│  Pencil  │  Trophy  │  Pencil  │
├──────────┼──────────┼──────────┤
│  Trophy  │  Trophy  │  Trophy  │ ← WIN! 2.0x bet
├──────────┼──────────┼──────────┤
│  Logo    │  Logo    │  Backpack│
└──────────┴──────────┴──────────┘
```
**Result:** Middle row has 3 trophies = **2.0x payout!** 🏆

**JACKPOT:**
```
┌──────────┬──────────┬──────────┐
│  Logo    │  Logo    │  Logo    │ ← JACKPOT! 8.0x bet
├──────────┼──────────┼──────────┤
│  Pencil  │  Trophy  │  Backpack│
└──────────┴──────────┴──────────┘
```
**Result:** Top row all logos = **8.0x MEGA WIN!** 💰💰💰

---

## 🚀 Why 3-Reel is Better

✅ **Fewer assets needed** (6 vs 12 symbols)
✅ **Easier to win** (3 matches vs 3-5 matches)
✅ **Faster gameplay** (1.5s spin vs 2s)
✅ **Classic arcade feel** (like the handhelds in your photo!)
✅ **Better mobile experience** (fits on smaller screens)
✅ **Higher win frequency** (players stay engaged)

---

**Your slot machine is now configured for 3 reels! Just add your 6 symbol PNGs and background, and you're ready to launch!** 🎉
