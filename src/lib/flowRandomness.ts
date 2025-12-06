// src/lib/flowRandomness.ts
// Flow blockchain randomness integration using Cadence's revertibleRandom()
// 
// Flow provides cryptographically secure, verifiable randomness that:
// - Cannot be predicted or manipulated by users
// - Is verifiable on-chain
// - Uses commit-reveal pattern for true fairness
//
// IMPORTANT: For high-stakes gambling, use the commit-reveal pattern.
// For low-stakes NPC events, simpler on-chain random is sufficient.

import * as fcl from "@onflow/fcl";

// ============================================================================
// TYPES
// ============================================================================

export interface RandomnessResult {
  /** The random value (0-255 for single byte, or larger for multi-byte) */
  value: number;
  /** Transaction ID for verification */
  transactionId?: string;
  /** Block height where randomness was generated */
  blockHeight?: number;
  /** Whether this was on-chain (true) or client fallback (false) */
  isOnChain: boolean;
}

export interface RandomRangeResult extends RandomnessResult {
  /** The random number within the requested range */
  result: number;
  /** The min value requested */
  min: number;
  /** The max value requested */
  max: number;
}

export interface WeightedPickResult<T> extends RandomnessResult {
  /** The selected item */
  selected: T;
  /** Index of selected item */
  index: number;
}

// ============================================================================
// CADENCE SCRIPTS - Read random values (no transaction needed)
// ============================================================================

/**
 * Cadence script to get a random number using revertibleRandom()
 * This is suitable for low-stakes randomness (NPC events, minor rewards)
 * 
 * NOTE: revertibleRandom() can technically be "gamed" by reverting transactions,
 * but for NPC events this is acceptable. For gambling, use commit-reveal.
 */
const GET_RANDOM_SCRIPT = `
  access(all) fun main(): UInt64 {
    // Get a random 64-bit unsigned integer from Flow's secure randomness
    return revertibleRandom<UInt64>()
  }
`;

/**
 * Cadence script to get random bytes
 */
const GET_RANDOM_BYTES_SCRIPT = `
  access(all) fun main(count: UInt8): [UInt8] {
    let bytes: [UInt8] = []
    var i: UInt8 = 0
    while i < count {
      bytes.append(UInt8(revertibleRandom<UInt64>() % 256))
      i = i + 1
    }
    return bytes
  }
`;

/**
 * Cadence script to get a random number in a range [min, max]
 */
const GET_RANDOM_IN_RANGE_SCRIPT = `
  access(all) fun main(min: UInt64, max: UInt64): UInt64 {
    // Ensure valid range
    if min >= max {
      return min
    }
    
    let range = max - min + 1
    let randomValue = revertibleRandom<UInt64>()
    
    // Use modulo to get value in range, then add min
    return min + (randomValue % range)
  }
`;

/**
 * Cadence script to pick from weighted options
 * Returns the index of the selected option
 */
const WEIGHTED_RANDOM_PICK_SCRIPT = `
  access(all) fun main(weights: [UInt64]): UInt64 {
    // Calculate total weight
    var totalWeight: UInt64 = 0
    for weight in weights {
      totalWeight = totalWeight + weight
    }
    
    if totalWeight == 0 {
      return 0
    }
    
    // Get random value in range [0, totalWeight)
    let roll = revertibleRandom<UInt64>() % totalWeight
    
    // Find which bucket the roll falls into
    var cumulative: UInt64 = 0
    var index: UInt64 = 0
    
    for weight in weights {
      cumulative = cumulative + weight
      if roll < cumulative {
        return index
      }
      index = index + 1
    }
    
    // Fallback to last item
    return UInt64(weights.length - 1)
  }
`;

/**
 * Cadence script for dice roll (1 to sides)
 */
const DICE_ROLL_SCRIPT = `
  access(all) fun main(sides: UInt64): UInt64 {
    if sides == 0 {
      return 0
    }
    return (revertibleRandom<UInt64>() % sides) + 1
  }
`;

/**
 * Cadence script for coin flip (0 or 1)
 */
const COIN_FLIP_SCRIPT = `
  access(all) fun main(): Bool {
    return revertibleRandom<UInt64>() % 2 == 0
  }
`;

/**
 * Cadence script for percentage check (1-100)
 */
const PERCENTAGE_CHECK_SCRIPT = `
  access(all) fun main(successChance: UInt64): Bool {
    // successChance is 1-100
    if successChance >= 100 {
      return true
    }
    if successChance == 0 {
      return false
    }
    
    // Roll 1-100
    let roll = (revertibleRandom<UInt64>() % 100) + 1
    return roll <= successChance
  }
`;

/**
 * Cadence script for shuffling a deck (returns shuffled indices)
 * Uses Fisher-Yates shuffle
 */
const SHUFFLE_DECK_SCRIPT = `
  access(all) fun main(deckSize: UInt64): [UInt64] {
    // Create array of indices
    var deck: [UInt64] = []
    var i: UInt64 = 0
    while i < deckSize {
      deck.append(i)
      i = i + 1
    }
    
    // Fisher-Yates shuffle
    var j: UInt64 = deckSize
    while j > 1 {
      j = j - 1
      let randomIndex = revertibleRandom<UInt64>() % (j + 1)
      
      // Swap
      let temp = deck[j]
      deck[j] = deck[randomIndex]
      deck[randomIndex] = temp
    }
    
    return deck
  }
`;

// ============================================================================
// CLIENT FUNCTIONS
// ============================================================================

/**
 * Get a random UInt64 from Flow blockchain
 */
export async function getFlowRandom(): Promise<RandomnessResult> {
  try {
    const result = await fcl.query({
      cadence: GET_RANDOM_SCRIPT,
    });
    
    return {
      value: parseInt(result),
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] On-chain randomness failed, using fallback:", error);
    return {
      value: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      isOnChain: false,
    };
  }
}

/**
 * Get random bytes from Flow blockchain
 */
export async function getFlowRandomBytes(count: number): Promise<number[]> {
  try {
    const result = await fcl.query({
      cadence: GET_RANDOM_BYTES_SCRIPT,
      args: (arg: any, t: any) => [arg(count, t.UInt8)],
    });
    return result.map((b: string) => parseInt(b));
  } catch (error) {
    console.warn("[FlowRandom] On-chain random bytes failed, using fallback:", error);
    return Array.from({ length: count }, () => Math.floor(Math.random() * 256));
  }
}

/**
 * Get a random number in a specific range [min, max] (inclusive)
 */
export async function getFlowRandomInRange(
  min: number,
  max: number
): Promise<RandomRangeResult> {
  try {
    const result = await fcl.query({
      cadence: GET_RANDOM_IN_RANGE_SCRIPT,
      args: (arg: any, t: any) => [
        arg(min.toString(), t.UInt64),
        arg(max.toString(), t.UInt64),
      ],
    });
    
    return {
      value: parseInt(result),
      result: parseInt(result),
      min,
      max,
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] On-chain range random failed, using fallback:", error);
    const fallbackResult = Math.floor(Math.random() * (max - min + 1)) + min;
    return {
      value: fallbackResult,
      result: fallbackResult,
      min,
      max,
      isOnChain: false,
    };
  }
}

/**
 * Pick a random item from weighted options using Flow randomness
 */
export async function flowWeightedPick<T>(
  items: T[],
  weights: number[]
): Promise<WeightedPickResult<T>> {
  if (items.length === 0) {
    throw new Error("Cannot pick from empty array");
  }
  
  if (items.length !== weights.length) {
    throw new Error("Items and weights arrays must have same length");
  }
  
  try {
    const result = await fcl.query({
      cadence: WEIGHTED_RANDOM_PICK_SCRIPT,
      args: (arg: any, t: any) => [
        arg(weights.map(w => w.toString()), t.Array(t.UInt64)),
      ],
    });
    
    const index = parseInt(result);
    return {
      value: index,
      selected: items[index],
      index,
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] On-chain weighted pick failed, using fallback:", error);
    
    // Fallback to client-side weighted random
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let roll = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        return {
          value: i,
          selected: items[i],
          index: i,
          isOnChain: false,
        };
      }
    }
    
    const lastIndex = items.length - 1;
    return {
      value: lastIndex,
      selected: items[lastIndex],
      index: lastIndex,
      isOnChain: false,
    };
  }
}

/**
 * Roll a die with N sides (1 to N)
 */
export async function flowDiceRoll(sides: number): Promise<RandomRangeResult> {
  try {
    const result = await fcl.query({
      cadence: DICE_ROLL_SCRIPT,
      args: (arg: any, t: any) => [arg(sides.toString(), t.UInt64)],
    });
    
    const value = parseInt(result);
    return {
      value,
      result: value,
      min: 1,
      max: sides,
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] On-chain dice roll failed, using fallback:", error);
    const fallbackResult = Math.floor(Math.random() * sides) + 1;
    return {
      value: fallbackResult,
      result: fallbackResult,
      min: 1,
      max: sides,
      isOnChain: false,
    };
  }
}

/**
 * Flip a coin (true = heads, false = tails)
 */
export async function flowCoinFlip(): Promise<{ result: boolean; isOnChain: boolean }> {
  try {
    const result = await fcl.query({
      cadence: COIN_FLIP_SCRIPT,
    });
    
    return {
      result: result === true || result === "true",
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] On-chain coin flip failed, using fallback:", error);
    return {
      result: Math.random() < 0.5,
      isOnChain: false,
    };
  }
}

/**
 * Check if a percentage chance succeeds
 * @param successChance - Percentage from 1-100
 */
export async function flowPercentageCheck(
  successChance: number
): Promise<{ success: boolean; isOnChain: boolean }> {
  try {
    const result = await fcl.query({
      cadence: PERCENTAGE_CHECK_SCRIPT,
      args: (arg: any, t: any) => [arg(Math.round(successChance).toString(), t.UInt64)],
    });
    
    return {
      success: result === true || result === "true",
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] On-chain percentage check failed, using fallback:", error);
    return {
      success: Math.random() * 100 < successChance,
      isOnChain: false,
    };
  }
}

/**
 * Shuffle a deck of cards (or any array) using Flow randomness
 * Returns the indices in shuffled order
 */
export async function flowShuffleDeck(deckSize: number): Promise<{
  indices: number[];
  isOnChain: boolean;
}> {
  try {
    const result = await fcl.query({
      cadence: SHUFFLE_DECK_SCRIPT,
      args: (arg: any, t: any) => [arg(deckSize.toString(), t.UInt64)],
    });
    
    return {
      indices: result.map((i: string) => parseInt(i)),
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] On-chain shuffle failed, using fallback:", error);
    
    // Fisher-Yates shuffle fallback
    const indices = Array.from({ length: deckSize }, (_, i) => i);
    for (let i = deckSize - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    
    return {
      indices,
      isOnChain: false,
    };
  }
}

/**
 * Apply shuffled indices to an array
 */
export function applyShuffleIndices<T>(items: T[], indices: number[]): T[] {
  return indices.map(i => items[i]);
}

// ============================================================================
// GAME-SPECIFIC HELPERS
// ============================================================================

/**
 * Slot machine spin result
 */
export interface SlotSpinResult {
  reels: number[];
  isOnChain: boolean;
}

/**
 * Generate slot machine reel results using Flow randomness
 * @param reelCount - Number of reels (usually 3 or 5)
 * @param symbolCount - Number of possible symbols per reel
 */
export async function flowSlotSpin(
  reelCount: number = 3,
  symbolCount: number = 8
): Promise<SlotSpinResult> {
  try {
    const bytes = await getFlowRandomBytes(reelCount);
    return {
      reels: bytes.map(b => b % symbolCount),
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] Slot spin failed, using fallback:", error);
    return {
      reels: Array.from({ length: reelCount }, () => 
        Math.floor(Math.random() * symbolCount)
      ),
      isOnChain: false,
    };
  }
}

/**
 * Video poker draw - get random cards from remaining deck
 */
export async function flowPokerDraw(
  cardsNeeded: number,
  excludeIndices: number[] = [],
  deckSize: number = 52
): Promise<{ cardIndices: number[]; isOnChain: boolean }> {
  // Build available cards
  const available = Array.from({ length: deckSize }, (_, i) => i)
    .filter(i => !excludeIndices.includes(i));
  
  if (cardsNeeded > available.length) {
    throw new Error("Not enough cards in deck");
  }
  
  try {
    // Get random bytes and use them to pick cards
    const bytes = await getFlowRandomBytes(cardsNeeded);
    const picked: number[] = [];
    const remaining = [...available];
    
    for (let i = 0; i < cardsNeeded; i++) {
      const index = bytes[i] % remaining.length;
      picked.push(remaining[index]);
      remaining.splice(index, 1);
    }
    
    return {
      cardIndices: picked,
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] Poker draw failed, using fallback:", error);
    
    const picked: number[] = [];
    const remaining = [...available];
    
    for (let i = 0; i < cardsNeeded; i++) {
      const index = Math.floor(Math.random() * remaining.length);
      picked.push(remaining[index]);
      remaining.splice(index, 1);
    }
    
    return {
      cardIndices: picked,
      isOnChain: false,
    };
  }
}

/**
 * Scratch card reveal - pre-generate all prizes
 */
export async function flowScratchCardGenerate(
  spotCount: number,
  prizeWeights: number[] // Index = prize tier, value = weight
): Promise<{ prizes: number[]; isOnChain: boolean }> {
  try {
    const bytes = await getFlowRandomBytes(spotCount);
    const totalWeight = prizeWeights.reduce((a, b) => a + b, 0);
    
    const prizes = bytes.map(byte => {
      const roll = byte % totalWeight;
      let cumulative = 0;
      for (let i = 0; i < prizeWeights.length; i++) {
        cumulative += prizeWeights[i];
        if (roll < cumulative) return i;
      }
      return prizeWeights.length - 1;
    });
    
    return {
      prizes,
      isOnChain: true,
    };
  } catch (error) {
    console.warn("[FlowRandom] Scratch card generation failed, using fallback:", error);
    
    const totalWeight = prizeWeights.reduce((a, b) => a + b, 0);
    const prizes = Array.from({ length: spotCount }, () => {
      const roll = Math.floor(Math.random() * totalWeight);
      let cumulative = 0;
      for (let i = 0; i < prizeWeights.length; i++) {
        cumulative += prizeWeights[i];
        if (roll < cumulative) return i;
      }
      return prizeWeights.length - 1;
    });
    
    return {
      prizes,
      isOnChain: false,
    };
  }
}

// ============================================================================
// COMMIT-REVEAL PATTERN (For High-Stakes Gambling)
// ============================================================================
// 
// For truly tamper-proof gambling with real stakes, use the commit-reveal pattern:
//
// 1. Player commits to their bet (transaction 1)
// 2. System generates commitment hash with secret
// 3. After commitment is on-chain, player reveals (transaction 2)
// 4. Outcome is determined based on block hash + secret
//
// This prevents:
// - Players from seeing outcome before betting
// - Operators from manipulating results after bet
// - Transaction reversion attacks
//
// Implementation requires a Cadence smart contract - see:
// cadence/contracts/GamblingRandomness.cdc (TODO)
// ============================================================================

export interface CommitRevealSession {
  sessionId: string;
  commitmentHash: string;
  betAmount: number;
  gameType: string;
  status: "committed" | "revealed" | "expired";
}

// Placeholder for commit-reveal implementation
export async function createGamblingCommitment(
  walletAddress: string,
  betAmount: number,
  gameType: string
): Promise<CommitRevealSession> {
  // TODO: Implement on-chain commit-reveal pattern
  // This requires a deployed Cadence contract
  throw new Error("Commit-reveal pattern not yet implemented. Use simpler randomness for now.");
}
