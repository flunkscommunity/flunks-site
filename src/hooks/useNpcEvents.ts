// src/hooks/useNpcEvents.ts
// React hook for integrating NPC events into components

import { useState, useEffect, useCallback, useRef } from "react";
import {
  NpcEvent,
  PlayerContext,
  ResolvedNpcOutcome,
  NpcEffect,
  canAffordChoice,
  getChoiceCost,
} from "../game/npcEvents";
import {
  NpcEventEngineState,
  createNpcEngineState,
  attemptTriggerNpcEvent,
  runNpcInteraction,
  runNpcInteractionOnChain,
  updatePlayerContextAfterInteraction,
  getRoomEventStats,
  getRoomConfig,
} from "../game/npcEventEngine";
import { ALL_NPC_EVENTS, getEventsForRoom } from "../game/npcEventsData";

/**
 * Hook configuration
 */
export interface UseNpcEventsConfig {
  /** Current room the player is in */
  room: string;
  /** Player's wallet address */
  walletAddress: string;
  /** Current story chapter */
  currentChapter?: number;
  /** Player's current GUM balance */
  gumBalance: number;
  /** Whether to auto-trigger events on room entry */
  autoTrigger?: boolean;
  /** Force trigger an event (for testing) */
  forceTrigger?: boolean;
  /** Use Flow blockchain randomness for outcomes */
  useOnChainRandomness?: boolean;
  /** Callback when GUM changes from an event */
  onGumChange?: (delta: number, newBalance: number) => void;
  /** Callback when an effect is applied */
  onEffectApplied?: (effect: NpcEffect) => void;
  /** Callback with verification info after outcome */
  onOutcomeVerified?: (isOnChain: boolean, successChance: number) => void;
  /** Debug mode */
  debug?: boolean;
}

/**
 * Hook state
 */
export interface NpcEventState {
  /** Currently active event (null if none) */
  activeEvent: NpcEvent | null;
  /** Whether an event modal should be shown */
  isEventActive: boolean;
  /** The resolved outcome after player makes a choice */
  currentOutcome: ResolvedNpcOutcome | null;
  /** Whether we're waiting for player choice */
  awaitingChoice: boolean;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Whether last outcome used on-chain randomness */
  isOnChainVerified: boolean;
  /** Success chance that was used */
  successChanceUsed: number | null;
}

/**
 * Hook actions
 */
export interface NpcEventActions {
  /** Manually trigger an event check */
  triggerEventCheck: () => void;
  /** Force trigger a specific event (for testing) */
  triggerSpecificEvent: (eventId: string) => void;
  /** Player makes a choice */
  makeChoice: (choice: string) => void;
  /** Dismiss the current event/outcome */
  dismissEvent: () => void;
  /** Get stats about events for current room */
  getRoomStats: () => ReturnType<typeof getRoomEventStats>;
  /** Check if player can afford a choice */
  canAfford: (choice: string) => boolean;
  /** Get the cost of a choice */
  getChoiceCost: (choice: string) => number;
}

/**
 * Main hook for NPC event system
 */
export function useNpcEvents(
  config: UseNpcEventsConfig
): [NpcEventState, NpcEventActions] {
  const {
    room,
    walletAddress,
    currentChapter = 1,
    gumBalance,
    autoTrigger = true,
    forceTrigger = false,
    useOnChainRandomness = false,
    onGumChange,
    onEffectApplied,
    onOutcomeVerified,
    debug = false,
  } = config;

  // State
  const [activeEvent, setActiveEvent] = useState<NpcEvent | null>(null);
  const [currentOutcome, setCurrentOutcome] = useState<ResolvedNpcOutcome | null>(null);
  const [awaitingChoice, setAwaitingChoice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOnChainVerified, setIsOnChainVerified] = useState(false);
  const [successChanceUsed, setSuccessChanceUsed] = useState<number | null>(null);

  // Refs for engine state (persists across renders)
  const engineStateRef = useRef<NpcEventEngineState>(createNpcEngineState());
  const playerContextRef = useRef<PlayerContext>({
    id: walletAddress,
    currentChapter,
    flags: new Set<string>(),
    lastNpcEventTimestamps: {},
    completedNpcEvents: new Set<string>(),
    gumBalance,
  });

  // Update player context when props change
  useEffect(() => {
    playerContextRef.current.id = walletAddress;
    playerContextRef.current.currentChapter = currentChapter;
    playerContextRef.current.gumBalance = gumBalance;
  }, [walletAddress, currentChapter, gumBalance]);

  // Load player context from localStorage on mount
  useEffect(() => {
    const storageKey = `npc_player_context_${walletAddress}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        playerContextRef.current.flags = new Set(parsed.flags || []);
        playerContextRef.current.lastNpcEventTimestamps = parsed.lastNpcEventTimestamps || {};
        playerContextRef.current.completedNpcEvents = new Set(parsed.completedNpcEvents || []);
        if (debug) console.log('[NPC] Loaded player context:', parsed);
      }
    } catch (e) {
      console.error('[NPC] Failed to load player context:', e);
    }
  }, [walletAddress, debug]);

  // Save player context to localStorage on changes
  const savePlayerContext = useCallback(() => {
    const storageKey = `npc_player_context_${walletAddress}`;
    try {
      const toSave = {
        flags: Array.from(playerContextRef.current.flags),
        lastNpcEventTimestamps: playerContextRef.current.lastNpcEventTimestamps,
        completedNpcEvents: Array.from(playerContextRef.current.completedNpcEvents),
      };
      localStorage.setItem(storageKey, JSON.stringify(toSave));
      if (debug) console.log('[NPC] Saved player context');
    } catch (e) {
      console.error('[NPC] Failed to save player context:', e);
    }
  }, [walletAddress, debug]);

  // Trigger event check
  const triggerEventCheck = useCallback(() => {
    if (debug) console.log('[NPC] Triggering event check for room:', room);
    
    const result = attemptTriggerNpcEvent(
      ALL_NPC_EVENTS,
      room,
      playerContextRef.current,
      engineStateRef.current,
      forceTrigger
    );

    if (result.triggered && result.event) {
      if (debug) console.log('[NPC] Event triggered:', result.event.npcName);
      setActiveEvent(result.event);
      setAwaitingChoice(true);
      setCurrentOutcome(null);
      engineStateRef.current.lastGlobalEventTime = Date.now();
      engineStateRef.current.activeEvent = result.event;
      engineStateRef.current.isInteracting = true;
    } else {
      if (debug) console.log('[NPC] No event triggered:', result.reason);
    }
  }, [room, forceTrigger, debug]);

  // Trigger specific event (for testing/debugging)
  const triggerSpecificEvent = useCallback((eventId: string) => {
    const event = ALL_NPC_EVENTS.find(e => e.id === eventId);
    if (event) {
      if (debug) console.log('[NPC] Force triggering event:', event.npcName);
      setActiveEvent(event);
      setAwaitingChoice(true);
      setCurrentOutcome(null);
      engineStateRef.current.activeEvent = event;
      engineStateRef.current.isInteracting = true;
    } else {
      setError(`Event not found: ${eventId}`);
    }
  }, [debug]);

  // Make a choice
  const makeChoice = useCallback(async (choice: string) => {
    if (!activeEvent) {
      setError("No active event");
      return;
    }

    // Check affordability
    if (!canAffordChoice(activeEvent, choice, gumBalance)) {
      setError("Not enough GUM for this choice");
      return;
    }

    if (debug) console.log('[NPC] Making choice:', choice, useOnChainRandomness ? '(on-chain)' : '(client)');
    setIsLoading(true);
    setIsOnChainVerified(false);
    setSuccessChanceUsed(null);

    try {
      // Use on-chain or client-side randomness
      const result = useOnChainRandomness
        ? await runNpcInteractionOnChain(activeEvent, choice, playerContextRef.current)
        : runNpcInteraction(activeEvent, choice, playerContextRef.current);

      if (result) {
        setCurrentOutcome(result.outcome);
        setAwaitingChoice(false);
        setIsOnChainVerified(result.isOnChain || false);
        setSuccessChanceUsed(result.successChanceUsed || null);

        // Update player context
        updatePlayerContextAfterInteraction(playerContextRef.current, result);
        savePlayerContext();

        // Apply effects and notify parent
        for (const effect of result.outcome.effects) {
          if (effect.type === "currency" && effect.target === "gum" && effect.amount) {
            onGumChange?.(effect.amount, gumBalance + effect.amount);
          }
          onEffectApplied?.(effect);
        }

        // Notify about verification
        onOutcomeVerified?.(result.isOnChain || false, result.successChanceUsed || 70);

        if (debug) {
          console.log('[NPC] Outcome:', result.outcome.result);
          console.log('[NPC] Effects:', result.outcome.effects);
          console.log('[NPC] On-chain:', result.isOnChain);
          console.log('[NPC] Success chance used:', result.successChanceUsed);
        }
      } else {
        setError("Failed to resolve choice");
      }
    } catch (err) {
      console.error('[NPC] Error resolving choice:', err);
      setError("Error resolving choice");
    }

    setIsLoading(false);
  }, [activeEvent, gumBalance, useOnChainRandomness, onGumChange, onEffectApplied, onOutcomeVerified, savePlayerContext, debug]);

  // Dismiss event
  const dismissEvent = useCallback(() => {
    if (debug) console.log('[NPC] Dismissing event');
    setActiveEvent(null);
    setCurrentOutcome(null);
    setAwaitingChoice(false);
    setError(null);
    engineStateRef.current.activeEvent = null;
    engineStateRef.current.isInteracting = false;
  }, [debug]);

  // Get room stats
  const getRoomStats = useCallback(() => {
    return getRoomEventStats(ALL_NPC_EVENTS, room, playerContextRef.current);
  }, [room]);

  // Check affordability for a choice
  const canAfford = useCallback((choice: string): boolean => {
    if (!activeEvent) return true;
    return canAffordChoice(activeEvent, choice, gumBalance);
  }, [activeEvent, gumBalance]);

  // Get choice cost
  const getChoiceCostFn = useCallback((choice: string): number => {
    if (!activeEvent) return 0;
    return getChoiceCost(activeEvent, choice);
  }, [activeEvent]);

  // Auto-trigger on room entry
  useEffect(() => {
    if (autoTrigger && room && walletAddress) {
      // Delay to let the room render first
      const timer = setTimeout(() => {
        triggerEventCheck();
      }, 1500); // 1.5 second delay after entering room

      return () => clearTimeout(timer);
    }
  }, [room, walletAddress, autoTrigger, triggerEventCheck]);

  const state: NpcEventState = {
    activeEvent,
    isEventActive: activeEvent !== null,
    currentOutcome,
    awaitingChoice,
    isLoading,
    error,
    isOnChainVerified,
    successChanceUsed,
  };

  const actions: NpcEventActions = {
    triggerEventCheck,
    triggerSpecificEvent,
    makeChoice,
    dismissEvent,
    getRoomStats,
    canAfford,
    getChoiceCost: getChoiceCostFn,
  };

  return [state, actions];
}

/**
 * Simple hook for testing NPC events in development
 */
export function useNpcEventDebug(room: string) {
  const [state, actions] = useNpcEvents({
    room,
    walletAddress: "debug-wallet",
    gumBalance: 1000,
    autoTrigger: false,
    debug: true,
  });

  return {
    ...state,
    ...actions,
    allEvents: getEventsForRoom(room),
  };
}
