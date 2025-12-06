# Flow Randomness Strategy for Flunks Games

## Overview

This document outlines the randomness strategies available for Flunks' NPC events and casino games, with recommendations for when to use each approach.

## The Problem with `Math.random()`

JavaScript's `Math.random()` is:
- **Pseudo-random**: Deterministic based on seed
- **Client-side**: Users can manipulate it with browser extensions
- **Not verifiable**: No proof the outcome wasn't rigged
- **Predictable**: Sophisticated attackers can predict future values

For a **play-for-fun** game with no real stakes, this is fine. For anything involving real value (GUM economy, NFT rewards), we need better.

---

## Three Tiers of Randomness

### Tier 1: Client-Side (Math.random)
**Use for:** Low-stakes, cosmetic, non-economic outcomes

| Pros | Cons |
|------|------|
| Instant (no network) | Manipulable |
| Works offline | Not verifiable |
| Simple | Predictable |

**Examples:**
- UI animations
- Which NPC says what
- Cosmetic variations
- Sound effect selection

### Tier 2: On-Chain Scripts (revertibleRandom)
**Use for:** Medium-stakes, economic but recoverable outcomes

| Pros | Cons |
|------|------|
| Cryptographically secure | Requires network call |
| Verifiable on-chain | ~1-2 second latency |
| Cannot be predicted | Transaction reversion attack possible |
| Free (read-only scripts) | |

**Examples:**
- NPC event success/fail
- Slot machine spins
- Scratch card generation
- Video poker draws
- Daily rewards

**Implementation:** `src/lib/flowRandomness.ts`

```typescript
import { flowPercentageCheck, flowSlotSpin, flowPokerDraw } from "@/lib/flowRandomness";

// NPC success check (70% chance)
const result = await flowPercentageCheck(70);
if (result.success) { /* ... */ }

// Slot machine
const spin = await flowSlotSpin(3, 8); // 3 reels, 8 symbols
console.log(spin.reels); // [2, 5, 2]

// Video poker draw
const draw = await flowPokerDraw(3, [0, 5, 12]); // Need 3 cards, exclude indices 0, 5, 12
console.log(draw.cardIndices); // [7, 23, 41]
```

### Tier 3: Commit-Reveal Pattern
**Use for:** High-stakes, irreversible, or real-value outcomes

| Pros | Cons |
|------|------|
| Completely tamper-proof | Requires 2 transactions |
| Neither player nor house can cheat | ~10-15 second total time |
| Legally defensible | More complex UX |
| Prevents reversion attacks | Gas costs |

**Examples:**
- High-stakes bets (>100 GUM)
- NFT lotteries
- Tournament placements
- Any outcome affecting real value

**Implementation:** `cadence/contracts/GamblingRandomness.cdc`

---

## Current NPC Settings

```typescript
// npcEventEngine.ts

// How often NPCs appear on room entry
const ROOM_NPC_CONFIGS = {
  underground: {
    triggerChance: 0.4,  // 40% chance
    globalCooldown: 45,   // 45 seconds between events
  },
  arcade: {
    triggerChance: 0.25, // 25% chance
    globalCooldown: 90,
  },
  paradise_motel: {
    triggerChance: 0.35, // 35% chance
    globalCooldown: 60,
  },
};

// Default success chance for choices
const DEFAULT_SUCCESS_CHANCE = 0.7; // 70%
```

### Per-Event Weights

Each NPC event has a `weight` field (1-10) that affects selection probability:

```typescript
// Higher weight = more likely to be selected
{
  "npcName": "Slick Eddie",
  "weight": 10,  // Very common
},
{
  "npcName": "Twitchy Mike",
  "weight": 5,   // Less common (story event)
}
```

---

## Recommended Approach by Game

### 1. NPC Events
**Recommendation:** Tier 2 (On-Chain Scripts)

NPC events affect GUM balance and unlock flags/lore. Using on-chain randomness ensures:
- Players can't cheat to always win
- Results are verifiable if disputed
- Adds credibility to the economy

```typescript
// hooks/useNpcEvents.ts - Updated to use Flow

const makeChoice = async (choice: string) => {
  const { resolveNpcChoiceOnChain } = await import("@/game/npcEvents");
  const result = await resolveNpcChoiceOnChain(activeEvent, choice, 70);
  // result.isOnChain tells you if it was truly random
};
```

### 2. Slot Machine
**Recommendation:** Tier 2 (On-Chain Scripts)

```typescript
import { flowSlotSpin } from "@/lib/flowRandomness";

const spin = async () => {
  const result = await flowSlotSpin(3, 8);
  setReels(result.reels);
  // result.isOnChain for verification badge
};
```

### 3. Video Poker
**Recommendation:** Tier 2 (On-Chain Scripts)

```typescript
import { flowShuffleDeck, flowPokerDraw } from "@/lib/flowRandomness";

// Initial deal
const { indices } = await flowShuffleDeck(52);
const hand = indices.slice(0, 5);

// Draw replacements
const { cardIndices } = await flowPokerDraw(
  discardCount,
  hand, // Cards to exclude
);
```

### 4. Scratch Cards
**Recommendation:** Tier 2 (On-Chain Scripts)

```typescript
import { flowScratchCardGenerate } from "@/lib/flowRandomness";

// Pre-generate all 9 spots when card is purchased
const { prizes } = await flowScratchCardGenerate(9, [
  100,  // Tier 0: No prize (100 weight)
  50,   // Tier 1: 2x (50 weight)
  20,   // Tier 2: 5x (20 weight)
  5,    // Tier 3: 10x (5 weight)
  1,    // Tier 4: 100x jackpot (1 weight)
]);
```

### 5. High-Stakes Betting (Future)
**Recommendation:** Tier 3 (Commit-Reveal)

When/if we add:
- Head-to-head betting
- Tournament entries
- NFT lotteries

---

## Adjustable Parameters

### NPC Trigger Frequency

To make NPCs more/less common, adjust in `npcEventEngine.ts`:

```typescript
// Make Underground more eventful
underground: {
  triggerChance: 0.6,  // Up from 0.4 (60% on entry)
  globalCooldown: 30,  // Down from 45 (more frequent)
}
```

### Success/Fail Balance

Default is 70% success. To adjust per-event:

```typescript
// In the event data, add a custom success rate
{
  "id": "slick-eddie",
  "customSuccessRate": 40, // Only 40% chance to beat Eddie
}
```

Then in resolution:
```typescript
const successRate = event.customSuccessRate ?? 70;
const result = await flowPercentageCheck(successRate);
```

### House Edge for Games

The Cadence contract has:
```cadence
access(all) let houseEdgeBps: UInt64 = 200 // 2% house edge
```

This affects payout multipliers:
- Coin flip: 1.96x (instead of 2x)
- Even odds: pays 0.98 to win (not 1:1)

---

## Verification UI

Show users when outcomes are on-chain:

```tsx
{outcome.isOnChain && (
  <div className="verified-badge">
    ✓ Verified on Flow blockchain
  </div>
)}
```

---

## Migration Path

### Phase 1 (Now)
- Keep `Math.random()` for UI/cosmetic
- Add on-chain scripts as option
- Test with `debug: true`

### Phase 2 (Soon)
- Enable on-chain for all NPC choices
- Enable on-chain for slot machine
- Add verification badges

### Phase 3 (When Needed)
- Deploy commit-reveal contract
- Use for high-stakes features
- Add bet history on-chain

---

## Testing Flow Randomness

```bash
# Test the Cadence scripts locally
flow scripts execute ./scripts/test-random.cdc

# Or in the app, check console for:
[FlowRandom] On-chain randomness: true
```

If Flow is unavailable, all functions gracefully fall back to `Math.random()` with a console warning.
