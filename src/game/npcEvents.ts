// src/game/npcEvents.ts
// Core types and helpers for the Flunks NPC Event System

/**
 * Effect types that can be applied from NPC interactions
 */
export type NpcEffectType =
  | "currency"
  | "item"
  | "stat"
  | "lore"
  | "reputation"
  | "flag";

/**
 * Represents a single effect from an NPC interaction outcome
 */
export interface NpcEffect {
  type: NpcEffectType;
  /**
   * What this effect applies to:
   * e.g. "gum", "luck", "underground_rep", "crystal_springs_clue"
   */
  target: string;
  /**
   * Optional numeric delta (can be negative).
   * Not all effect types need this (e.g. lore/flag).
   */
  amount?: number;
  /**
   * Optional flags to set when this effect is applied.
   * e.g. ["met_rug_doctor", "has_arcade_debt"]
   */
  flagsToSet?: string[];
}

/**
 * Outcome structure for each player choice
 */
export interface NpcEventOutcome {
  /** Text shown on successful outcome */
  success: string;
  /** Text shown on failed outcome */
  fail: string;
  /** Effects applied on success */
  successEffects?: NpcEffect[];
  /** Effects applied on failure */
  failEffects?: NpcEffect[];
}

/**
 * Room identifiers for NPC events
 */
export type NpcEventRoom =
  | "underground"    // Four Thieves Bar / The Underground
  | "arcade"         // Arcade
  | "paradise_motel" // Paradise Motel
  | "snack_shack"    // Snack Shack
  | "treehouse"      // Treehouse
  | "high_school"    // High School
  | "junkyard";      // Junkyard

/**
 * Complete NPC Event definition
 */
export interface NpcEvent {
  /** Unique identifier for this event */
  id: string;
  /** Short, memorable name for the NPC */
  npcName: string;
  /** 1-line description of the NPC's vibe */
  npcDescription: string;
  /** Main dialogue text shown when event triggers */
  dialogue: string;
  /** Location where this event can occur */
  room: NpcEventRoom | string;
  /** Minimum chapter required (inclusive) */
  minChapter?: number | null;
  /** Maximum chapter allowed (inclusive) */
  maxChapter?: number | null;
  /** Weight for random selection (higher = more likely) */
  weight: number;
  /** Available choices for the player */
  playerChoices: string[];
  /** Map of choice label to outcome */
  outcomes: Record<string, NpcEventOutcome>;
  /** Whether this event can happen more than once */
  isRepeatable: boolean;
  /** Minimum seconds before same player can see it again */
  cooldownSeconds?: number | null;
  /** Optional: required flags for this event to appear */
  requiredFlags?: string[];
  /** Optional: flags that prevent this event from appearing */
  excludeFlags?: string[];
  /** Optional: NPC portrait/sprite identifier */
  npcSprite?: string;
}

/**
 * Minimal player context needed for NPC logic.
 * Extend this to match your actual player model.
 */
export interface PlayerContext {
  /** Player's unique identifier (wallet address) */
  id: string;
  /** Current story chapter */
  currentChapter: number;
  /** Set of flags the player has earned */
  flags: Set<string>;
  /** Map of eventId -> unix timestamp of last trigger */
  lastNpcEventTimestamps: Record<string, number>;
  /** Set of event IDs that are permanently completed */
  completedNpcEvents: Set<string>;
  /** Current GUM balance (for checking affordability) */
  gumBalance?: number;
}

/**
 * Check if an event is eligible to trigger for this player.
 */
export function isNpcEventEligible(
  event: NpcEvent,
  player: PlayerContext,
  now: number = Date.now()
): boolean {
  const { 
    minChapter, 
    maxChapter, 
    isRepeatable, 
    cooldownSeconds, 
    id,
    requiredFlags,
    excludeFlags 
  } = event;

  // Chapter gating
  if (minChapter != null && player.currentChapter < minChapter) return false;
  if (maxChapter != null && player.currentChapter > maxChapter) return false;

  // Non-repeatable event already completed
  if (!isRepeatable && player.completedNpcEvents.has(id)) return false;

  // Cooldown check
  if (cooldownSeconds && cooldownSeconds > 0) {
    const last = player.lastNpcEventTimestamps[id];
    if (last) {
      const diffSeconds = (now - last) / 1000;
      if (diffSeconds < cooldownSeconds) return false;
    }
  }

  // Required flags check
  if (requiredFlags && requiredFlags.length > 0) {
    for (const flag of requiredFlags) {
      if (!player.flags.has(flag)) return false;
    }
  }

  // Exclude flags check
  if (excludeFlags && excludeFlags.length > 0) {
    for (const flag of excludeFlags) {
      if (player.flags.has(flag)) return false;
    }
  }

  return true;
}

/**
 * Pick a random event using weights.
 * Returns null if no events are eligible.
 */
export function pickWeightedNpcEvent(
  events: NpcEvent[],
  player: PlayerContext,
  now: number = Date.now()
): NpcEvent | null {
  const eligible = events.filter((e) => isNpcEventEligible(e, player, now));
  if (eligible.length === 0) return null;

  const totalWeight = eligible.reduce((sum, e) => sum + (e.weight || 1), 0);
  let roll = Math.random() * totalWeight;

  for (const e of eligible) {
    roll -= e.weight || 1;
    if (roll <= 0) return e;
  }

  // Fallback to last eligible event
  return eligible[eligible.length - 1];
}

/**
 * Result of resolving an NPC choice
 */
export interface ResolvedNpcOutcome {
  /** Whether the outcome was success or fail */
  result: "success" | "fail";
  /** The text to display to the player */
  text: string;
  /** Effects to apply to player state */
  effects: NpcEffect[];
  /** Whether on-chain randomness was used */
  isOnChain?: boolean;
}

/**
 * Resolve a player's choice for a given event.
 * Returns the outcome text and effects to apply.
 *
 * You can customize success chance based on:
 * - Fixed chance (default 70%)
 * - Player's luck stat
 * - Specific items or traits
 * - Underground reputation
 */
export function resolveNpcChoice(
  event: NpcEvent,
  choice: string,
  successChance: number = 0.7
): ResolvedNpcOutcome | null {
  const outcome = event.outcomes[choice];
  if (!outcome) return null;

  const roll = Math.random();
  const success = roll < successChance;

  if (success) {
    return {
      result: "success",
      text: outcome.success,
      effects: outcome.successEffects || [],
      isOnChain: false,
    };
  } else {
    return {
      result: "fail",
      text: outcome.fail,
      effects: outcome.failEffects || [],
      isOnChain: false,
    };
  }
}

/**
 * Resolve a player's choice using Flow blockchain randomness
 * This provides verifiable, tamper-proof outcomes
 */
export async function resolveNpcChoiceOnChain(
  event: NpcEvent,
  choice: string,
  successChance: number = 70 // Percentage 1-100
): Promise<ResolvedNpcOutcome | null> {
  const outcome = event.outcomes[choice];
  if (!outcome) return null;

  try {
    // Dynamic import to avoid loading FCL if not needed
    const { flowPercentageCheck } = await import("../lib/flowRandomness");
    const result = await flowPercentageCheck(successChance);

    if (result.success) {
      return {
        result: "success",
        text: outcome.success,
        effects: outcome.successEffects || [],
        isOnChain: result.isOnChain,
      };
    } else {
      return {
        result: "fail",
        text: outcome.fail,
        effects: outcome.failEffects || [],
        isOnChain: result.isOnChain,
      };
    }
  } catch (error) {
    console.warn("[NPC] On-chain resolution failed, falling back to client:", error);
    return resolveNpcChoice(event, choice, successChance / 100);
  }
}

/**
 * Calculate success chance based on player context
 * Can be extended for more complex luck/reputation systems
 */
export function calculateSuccessChance(
  event: NpcEvent,
  player: PlayerContext,
  baseChance: number = 0.7
): number {
  let chance = baseChance;

  // Future: modify based on reputation, items, etc.
  // if (player.flags.has('lucky_charm')) chance += 0.1;
  // if (player.reputation?.underground > 50) chance += 0.05;

  // Clamp between 5% and 95%
  return Math.max(0.05, Math.min(0.95, chance));
}

/**
 * Mutable player state for effect application
 */
export interface MutablePlayerState {
  gum: number;
  stats: Record<string, number>;
  flags: Set<string>;
  items: Record<string, number>;
  reputation: Record<string, number>;
}

/**
 * Apply NPC effects to player state.
 * In production, wire this to Supabase / state updates.
 */
export function applyNpcEffects(
  effects: NpcEffect[],
  playerState: MutablePlayerState
): void {
  for (const effect of effects) {
    switch (effect.type) {
      case "currency":
        if (effect.target === "gum" && typeof effect.amount === "number") {
          playerState.gum += effect.amount;
        }
        break;

      case "stat":
        if (typeof effect.amount === "number") {
          playerState.stats[effect.target] =
            (playerState.stats[effect.target] || 0) + effect.amount;
        }
        break;

      case "item":
        if (typeof effect.amount === "number") {
          playerState.items[effect.target] =
            (playerState.items[effect.target] || 0) + effect.amount;
        }
        break;

      case "reputation":
        if (typeof effect.amount === "number") {
          playerState.reputation[effect.target] =
            (playerState.reputation[effect.target] || 0) + effect.amount;
        }
        break;

      case "lore":
      case "flag":
        if (effect.flagsToSet) {
          for (const flag of effect.flagsToSet) {
            playerState.flags.add(flag);
          }
        }
        break;

      default:
        // no-op for unknown types
        console.warn(`Unknown NPC effect type: ${effect.type}`);
        break;
    }
  }
}

/**
 * Check if player can afford a choice's cost
 */
export function canAffordChoice(
  event: NpcEvent,
  choice: string,
  playerGum: number
): boolean {
  const outcome = event.outcomes[choice];
  if (!outcome) return true;

  // Check both success and fail effects for costs
  const allEffects = [
    ...(outcome.successEffects || []),
    ...(outcome.failEffects || []),
  ];

  for (const effect of allEffects) {
    if (
      effect.type === "currency" &&
      effect.target === "gum" &&
      effect.amount &&
      effect.amount < 0
    ) {
      // This choice costs gum
      if (playerGum < Math.abs(effect.amount)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Extract the GUM cost from a choice (if any)
 */
export function getChoiceCost(
  event: NpcEvent,
  choice: string
): number {
  const outcome = event.outcomes[choice];
  if (!outcome) return 0;

  // Check success effects for gum cost (costs are typically in successEffects)
  const effects = outcome.successEffects || [];
  
  for (const effect of effects) {
    if (
      effect.type === "currency" &&
      effect.target === "gum" &&
      effect.amount &&
      effect.amount < 0
    ) {
      return Math.abs(effect.amount);
    }
  }

  return 0;
}
