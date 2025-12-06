// src/game/npcEventEngine.ts
// Room-level NPC event orchestration and trigger logic

import {
  NpcEvent,
  NpcEffect,
  PlayerContext,
  ResolvedNpcOutcome,
  MutablePlayerState,
  pickWeightedNpcEvent,
  resolveNpcChoice,
  resolveNpcChoiceOnChain,
  applyNpcEffects,
  calculateSuccessChance,
  isNpcEventEligible,
} from "./npcEvents";

/**
 * Configuration for NPC event triggering
 */
export interface NpcEventConfig {
  /** Base chance for an NPC event to trigger on room entry (0-1) */
  triggerChance: number;
  /** Minimum time between any NPC events (seconds) */
  globalCooldown: number;
  /** Default success chance for choices (0-100 as percentage) */
  defaultSuccessChance: number;
  /** Whether to use Flow blockchain randomness */
  useOnChainRandomness: boolean;
  /** Whether to show debug logs */
  debug?: boolean;
  /** Variance range for success chance (+/- this percentage) */
  successVariance: number;
  /** Time-of-day modifiers (hour 0-23 -> multiplier) */
  timeModifiers?: Record<number, number>;
}

/**
 * Default configuration
 */
export const DEFAULT_NPC_CONFIG: NpcEventConfig = {
  triggerChance: 0.3, // 30% chance on room entry
  globalCooldown: 60, // 1 minute between any events
  defaultSuccessChance: 70, // 70% success rate
  useOnChainRandomness: false, // Off by default, enable for production
  debug: false,
  successVariance: 10, // +/- 10% variance
};

/**
 * Room-specific configurations (can override defaults)
 */
export const ROOM_NPC_CONFIGS: Record<string, Partial<NpcEventConfig>> = {
  underground: {
    triggerChance: 0.4, // Underground is more eventful
    globalCooldown: 45,
    defaultSuccessChance: 65, // Slightly harder in the underground
    successVariance: 15, // More unpredictable
  },
  arcade: {
    triggerChance: 0.25,
    globalCooldown: 90,
    defaultSuccessChance: 75, // Arcade is more forgiving
    successVariance: 5,
  },
  paradise_motel: {
    triggerChance: 0.35,
    globalCooldown: 60,
    defaultSuccessChance: 60, // Motel is mysterious and dangerous
    successVariance: 20, // Very unpredictable
  },
};

/**
 * Time-of-day luck modifiers
 * Some hours are luckier than others...
 */
export const TIME_LUCK_MODIFIERS: Record<number, number> = {
  0: 1.1,   // Midnight is lucky
  1: 1.05,
  2: 1.0,
  3: 0.95,  // Dead of night, unlucky
  4: 0.9,
  5: 0.95,
  6: 1.0,
  7: 1.0,
  8: 1.0,
  9: 1.0,
  10: 1.0,
  11: 1.0,
  12: 1.0,  // Noon
  13: 0.95, // After lunch slump
  14: 0.95,
  15: 1.0,
  16: 1.0,
  17: 1.05, // Happy hour starts
  18: 1.1,  // Prime time luck
  19: 1.1,
  20: 1.05,
  21: 1.0,
  22: 1.0,
  23: 1.05,
};

/**
 * Get config for a specific room
 */
export function getRoomConfig(room: string): NpcEventConfig {
  const roomOverrides = ROOM_NPC_CONFIGS[room] || {};
  return { ...DEFAULT_NPC_CONFIG, ...roomOverrides };
}

/**
 * State tracking for the event engine
 */
export interface NpcEventEngineState {
  /** Last time any NPC event was triggered (unix ms) */
  lastGlobalEventTime: number;
  /** Currently active event (if any) */
  activeEvent: NpcEvent | null;
  /** Whether we're in the middle of an interaction */
  isInteracting: boolean;
}

/**
 * Given all events and a room, pick one eligible event for this player.
 */
export function getRandomNpcEventForRoom(
  allEvents: NpcEvent[],
  room: string,
  player: PlayerContext,
  now: number = Date.now()
): NpcEvent | null {
  const roomEvents = allEvents.filter((e) => e.room === room);
  return pickWeightedNpcEvent(roomEvents, player, now);
}

/**
 * Check if we should trigger an NPC event on room entry
 */
export function shouldTriggerNpcEvent(
  room: string,
  engineState: NpcEventEngineState,
  now: number = Date.now()
): boolean {
  const config = getRoomConfig(room);

  // Check global cooldown
  if (engineState.lastGlobalEventTime) {
    const diffSeconds = (now - engineState.lastGlobalEventTime) / 1000;
    if (diffSeconds < config.globalCooldown) {
      return false;
    }
  }

  // Don't trigger if already interacting
  if (engineState.isInteracting) {
    return false;
  }

  // Roll against trigger chance
  return Math.random() < config.triggerChance;
}

/**
 * Result of attempting to trigger an NPC event
 */
export interface TriggerResult {
  triggered: boolean;
  event: NpcEvent | null;
  reason?: string;
}

/**
 * Attempt to trigger an NPC event for a room
 */
export function attemptTriggerNpcEvent(
  allEvents: NpcEvent[],
  room: string,
  player: PlayerContext,
  engineState: NpcEventEngineState,
  forceTrigger: boolean = false,
  now: number = Date.now()
): TriggerResult {
  const config = getRoomConfig(room);

  // Check if we should even try
  if (!forceTrigger && !shouldTriggerNpcEvent(room, engineState, now)) {
    return { triggered: false, event: null, reason: "Trigger check failed" };
  }

  // Try to pick an event
  const event = getRandomNpcEventForRoom(allEvents, room, player, now);
  
  if (!event) {
    return { triggered: false, event: null, reason: "No eligible events" };
  }

  if (config.debug) {
    console.log(`[NPC] Triggered event: ${event.id} (${event.npcName})`);
  }

  return { triggered: true, event };
}

/**
 * Full interaction result including player state changes
 */
export interface InteractionResult {
  event: NpcEvent;
  choice: string;
  outcome: ResolvedNpcOutcome;
  /** Timestamp of this interaction */
  timestamp: number;
  /** Whether on-chain randomness was used */
  isOnChain?: boolean;
  /** The success chance that was used */
  successChanceUsed?: number;
}

/**
 * Calculate success chance with time-of-day and variance modifiers
 */
export function calculateAdjustedSuccessChance(
  baseChance: number,
  room: string,
  variance: number = 10
): number {
  const config = getRoomConfig(room);
  
  // Get time-of-day modifier
  const hour = new Date().getHours();
  const timeModifier = TIME_LUCK_MODIFIERS[hour] ?? 1.0;
  
  // Add random variance within range
  const varianceAmount = (Math.random() * variance * 2) - variance;
  
  // Calculate final chance
  let adjustedChance = (baseChance + varianceAmount) * timeModifier;
  
  // Clamp between 5% and 95%
  adjustedChance = Math.max(5, Math.min(95, adjustedChance));
  
  return Math.round(adjustedChance);
}

/**
 * Orchestrates a complete NPC interaction (synchronous, client-side random)
 */
export function runNpcInteraction(
  event: NpcEvent,
  choice: string,
  player: PlayerContext,
  baseSuccessChance?: number
): InteractionResult | null {
  const room = event.room;
  const config = getRoomConfig(room);
  
  // Calculate adjusted success chance
  const rawChance = baseSuccessChance ?? config.defaultSuccessChance;
  const adjustedChance = calculateAdjustedSuccessChance(
    rawChance,
    room,
    config.successVariance
  );
  
  const outcome = resolveNpcChoice(event, choice, adjustedChance / 100);
  
  if (!outcome) {
    console.warn(`[NPC] Invalid choice "${choice}" for event ${event.id}`);
    return null;
  }

  if (config.debug) {
    console.log(`[NPC] Success chance: ${adjustedChance}% (base: ${rawChance}%, variance: ±${config.successVariance}%)`);
  }

  return {
    event,
    choice,
    outcome,
    timestamp: Date.now(),
    isOnChain: false,
    successChanceUsed: adjustedChance,
  };
}

/**
 * Orchestrates a complete NPC interaction with on-chain randomness
 * Use this for production to ensure verifiable, tamper-proof outcomes
 */
export async function runNpcInteractionOnChain(
  event: NpcEvent,
  choice: string,
  player: PlayerContext,
  baseSuccessChance?: number
): Promise<InteractionResult | null> {
  const room = event.room;
  const config = getRoomConfig(room);
  
  // Calculate adjusted success chance
  const rawChance = baseSuccessChance ?? config.defaultSuccessChance;
  const adjustedChance = calculateAdjustedSuccessChance(
    rawChance,
    room,
    config.successVariance
  );
  
  try {
    const outcome = await resolveNpcChoiceOnChain(event, choice, adjustedChance);
    
    if (!outcome) {
      console.warn(`[NPC] Invalid choice "${choice}" for event ${event.id}`);
      return null;
    }

    if (config.debug) {
      console.log(`[NPC] On-chain success chance: ${adjustedChance}% (base: ${rawChance}%)`);
      console.log(`[NPC] On-chain verified: ${outcome.isOnChain}`);
    }

    return {
      event,
      choice,
      outcome,
      timestamp: Date.now(),
      isOnChain: outcome.isOnChain,
      successChanceUsed: adjustedChance,
    };
  } catch (error) {
    console.warn(`[NPC] On-chain resolution failed, falling back to client:`, error);
    return runNpcInteraction(event, choice, player, baseSuccessChance);
  }
}

/**
 * Apply interaction results to mutable player state
 */
export function applyInteractionResult(
  result: InteractionResult,
  playerState: MutablePlayerState
): void {
  applyNpcEffects(result.outcome.effects, playerState);
}

/**
 * Update player context after an interaction (timestamps, completions)
 */
export function updatePlayerContextAfterInteraction(
  player: PlayerContext,
  result: InteractionResult
): void {
  // Update last trigger timestamp
  player.lastNpcEventTimestamps[result.event.id] = result.timestamp;

  // If not repeatable, mark as completed
  if (!result.event.isRepeatable) {
    player.completedNpcEvents.add(result.event.id);
  }

  // Add any flags from the outcome
  for (const effect of result.outcome.effects) {
    if (effect.flagsToSet) {
      for (const flag of effect.flagsToSet) {
        player.flags.add(flag);
      }
    }
  }
}

/**
 * Create initial engine state
 */
export function createNpcEngineState(): NpcEventEngineState {
  return {
    lastGlobalEventTime: 0,
    activeEvent: null,
    isInteracting: false,
  };
}

/**
 * Get summary stats about available events for a room
 */
export function getRoomEventStats(
  allEvents: NpcEvent[],
  room: string,
  player: PlayerContext,
  now: number = Date.now()
): {
  total: number;
  eligible: number;
  onCooldown: number;
  completed: number;
} {
  const roomEvents = allEvents.filter((e) => e.room === room);
  
  let eligible = 0;
  let onCooldown = 0;
  let completed = 0;

  for (const event of roomEvents) {
    if (isNpcEventEligible(event, player, now)) {
      eligible++;
    } else {
      // Check why not eligible
      if (!event.isRepeatable && player.completedNpcEvents.has(event.id)) {
        completed++;
      } else if (event.cooldownSeconds) {
        const last = player.lastNpcEventTimestamps[event.id];
        if (last) {
          const diffSeconds = (now - last) / 1000;
          if (diffSeconds < event.cooldownSeconds) {
            onCooldown++;
          }
        }
      }
    }
  }

  return {
    total: roomEvents.length,
    eligible,
    onCooldown,
    completed,
  };
}

/**
 * Debug helper: list all events for a room with eligibility
 */
export function debugRoomEvents(
  allEvents: NpcEvent[],
  room: string,
  player: PlayerContext
): void {
  const roomEvents = allEvents.filter((e) => e.room === room);
  const now = Date.now();

  console.group(`[NPC Debug] Room: ${room}`);
  console.log(`Total events: ${roomEvents.length}`);
  
  for (const event of roomEvents) {
    const eligible = isNpcEventEligible(event, player, now);
    const status = eligible ? "✅ Eligible" : "❌ Ineligible";
    console.log(`  ${status} - ${event.id} (${event.npcName}) - Weight: ${event.weight}`);
  }
  
  console.groupEnd();
}
