// src/components/NpcEventModal.tsx
// Modal component for displaying NPC events and interactions

import React, { useState, useEffect } from "react";
import { NpcEvent, ResolvedNpcOutcome, NpcEffect } from "../game/npcEvents";

/**
 * Props for NpcEventModal
 */
interface NpcEventModalProps {
  /** The current NPC event to display */
  event: NpcEvent | null;
  /** The resolved outcome (if player has made a choice) */
  outcome: ResolvedNpcOutcome | null;
  /** Whether we're waiting for the player to choose */
  awaitingChoice: boolean;
  /** Loading state while resolving choice */
  isLoading: boolean;
  /** Player's current GUM balance */
  gumBalance: number;
  /** Callback when player makes a choice */
  onChoice: (choice: string) => void;
  /** Callback when player dismisses the modal */
  onDismiss: () => void;
  /** Check if player can afford a choice */
  canAfford: (choice: string) => boolean;
  /** Get the cost of a choice */
  getChoiceCost: (choice: string) => number;
  /** Error message to display */
  error?: string | null;
}

/**
 * Format effect for display
 */
function formatEffect(effect: NpcEffect): string {
  switch (effect.type) {
    case "currency":
      if (effect.target === "gum" && effect.amount) {
        return effect.amount > 0 ? `+${effect.amount} GUM` : `${effect.amount} GUM`;
      }
      return `${effect.target}: ${effect.amount}`;
    case "item":
      return `Received: ${effect.target}`;
    case "reputation":
      if (effect.amount) {
        return effect.amount > 0 
          ? `+${effect.amount} ${effect.target} rep` 
          : `${effect.amount} ${effect.target} rep`;
      }
      return `${effect.target} reputation changed`;
    case "stat":
      if (effect.amount) {
        return effect.amount > 0 
          ? `+${effect.amount} ${effect.target}` 
          : `${effect.amount} ${effect.target}`;
      }
      return `${effect.target} changed`;
    case "lore":
    case "flag":
      if (effect.flagsToSet && effect.flagsToSet.length > 0) {
        return `🔓 Unlocked: ${effect.flagsToSet.join(", ")}`;
      }
      return "Something was unlocked...";
    default:
      return "Unknown effect";
  }
}

/**
 * NPC Event Modal Component
 */
export function NpcEventModal({
  event,
  outcome,
  awaitingChoice,
  isLoading,
  gumBalance,
  onChoice,
  onDismiss,
  canAfford,
  getChoiceCost,
  error,
}: NpcEventModalProps) {
  const [showEffects, setShowEffects] = useState(false);

  // Show effects after a delay when outcome is revealed
  useEffect(() => {
    if (outcome && outcome.effects.length > 0) {
      const timer = setTimeout(() => setShowEffects(true), 800);
      return () => clearTimeout(timer);
    } else {
      setShowEffects(false);
    }
  }, [outcome]);

  if (!event) return null;

  return (
    <div style={styles.overlay} onClick={onDismiss}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* NPC Header */}
        <div style={styles.header}>
          <div style={styles.npcAvatar}>
            {event.npcSprite ? (
              <span style={styles.avatarEmoji}>👤</span>
            ) : (
              <span style={styles.avatarEmoji}>🎭</span>
            )}
          </div>
          <div style={styles.npcInfo}>
            <h2 style={styles.npcName}>{event.npcName}</h2>
            <p style={styles.npcDescription}>{event.npcDescription}</p>
          </div>
        </div>

        {/* Dialogue */}
        <div style={styles.dialogueBox}>
          <p style={styles.dialogue}>
            {awaitingChoice ? (
              <TypewriterText text={event.dialogue} speed={30} />
            ) : (
              event.dialogue
            )}
          </p>
        </div>

        {/* Outcome Display */}
        {outcome && (
          <div style={{
            ...styles.outcomeBox,
            backgroundColor: outcome.result === "success" 
              ? "rgba(34, 197, 94, 0.2)" 
              : "rgba(239, 68, 68, 0.2)",
            borderColor: outcome.result === "success" 
              ? "#22c55e" 
              : "#ef4444",
          }}>
            <div style={styles.outcomeHeader}>
              <span style={styles.outcomeIcon}>
                {outcome.result === "success" ? "✨" : "💨"}
              </span>
              <span style={{
                ...styles.outcomeLabel,
                color: outcome.result === "success" ? "#22c55e" : "#ef4444",
              }}>
                {outcome.result === "success" ? "SUCCESS!" : "FAILED..."}
              </span>
            </div>
            <p style={styles.outcomeText}>{outcome.text}</p>
            
            {/* Effects */}
            {showEffects && outcome.effects.length > 0 && (
              <div style={styles.effectsList}>
                {outcome.effects.map((effect, i) => (
                  <div key={i} style={styles.effectItem}>
                    {formatEffect(effect)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={styles.errorBox}>
            ⚠️ {error}
          </div>
        )}

        {/* Choices */}
        {awaitingChoice && !isLoading && (
          <div style={styles.choicesContainer}>
            <p style={styles.choicesLabel}>What do you do?</p>
            {event.playerChoices.map((choice, index) => {
              const cost = getChoiceCost(choice);
              const affordable = canAfford(choice);
              
              return (
                <button
                  key={index}
                  style={{
                    ...styles.choiceButton,
                    opacity: affordable ? 1 : 0.5,
                    cursor: affordable ? "pointer" : "not-allowed",
                  }}
                  onClick={() => affordable && onChoice(choice)}
                  disabled={!affordable}
                >
                  <span style={styles.choiceText}>{choice}</span>
                  {cost > 0 && (
                    <span style={{
                      ...styles.choiceCost,
                      color: affordable ? "#fbbf24" : "#ef4444",
                    }}>
                      💎 {cost} GUM
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}>🎲</div>
            <p style={styles.loadingText}>Resolving fate...</p>
          </div>
        )}

        {/* Continue Button (after outcome) */}
        {outcome && !isLoading && (
          <button style={styles.continueButton} onClick={onDismiss}>
            Continue →
          </button>
        )}

        {/* GUM Balance */}
        <div style={styles.gumBalance}>
          💎 {gumBalance} GUM
        </div>
      </div>
    </div>
  );
}

/**
 * Typewriter effect component
 */
function TypewriterText({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  return <>{displayedText}<span style={styles.cursor}>▌</span></>;
}

/**
 * Styles
 */
const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "#1a1a2e",
    border: "3px solid #4a4a6a",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "90%",
    maxHeight: "80vh",
    overflow: "auto",
    boxShadow: "0 0 40px rgba(138, 43, 226, 0.3)",
    position: "relative",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "20px",
    borderBottom: "2px solid #4a4a6a",
    paddingBottom: "16px",
  },
  npcAvatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#2a2a4e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #6366f1",
  },
  avatarEmoji: {
    fontSize: "32px",
  },
  npcInfo: {
    flex: 1,
  },
  npcName: {
    margin: 0,
    color: "#e2e8f0",
    fontSize: "24px",
    fontFamily: "'Press Start 2P', monospace",
    textShadow: "2px 2px 0 #4a4a6a",
  },
  npcDescription: {
    margin: "8px 0 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    fontStyle: "italic",
  },
  dialogueBox: {
    backgroundColor: "#0f0f1a",
    border: "2px solid #4a4a6a",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
  },
  dialogue: {
    color: "#e2e8f0",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: 0,
  },
  cursor: {
    animation: "blink 0.7s infinite",
    color: "#6366f1",
  },
  outcomeBox: {
    border: "2px solid",
    borderRadius: "8px",
    padding: "16px",
    marginBottom: "20px",
  },
  outcomeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
  },
  outcomeIcon: {
    fontSize: "24px",
  },
  outcomeLabel: {
    fontSize: "18px",
    fontWeight: "bold",
    fontFamily: "'Press Start 2P', monospace",
  },
  outcomeText: {
    color: "#e2e8f0",
    fontSize: "15px",
    lineHeight: "1.5",
    margin: 0,
  },
  effectsList: {
    marginTop: "16px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  effectItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#fbbf24",
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    border: "2px solid #ef4444",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    color: "#ef4444",
    fontSize: "14px",
  },
  choicesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  choicesLabel: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: "0 0 8px 0",
  },
  choiceButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a4e",
    border: "2px solid #4a4a6a",
    borderRadius: "8px",
    padding: "14px 16px",
    color: "#e2e8f0",
    fontSize: "15px",
    textAlign: "left",
    transition: "all 0.2s ease",
  },
  choiceText: {
    flex: 1,
  },
  choiceCost: {
    fontSize: "13px",
    marginLeft: "12px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px",
  },
  loadingSpinner: {
    fontSize: "48px",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: "12px",
  },
  continueButton: {
    width: "100%",
    backgroundColor: "#6366f1",
    border: "none",
    borderRadius: "8px",
    padding: "16px",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "16px",
    transition: "all 0.2s ease",
  },
  gumBalance: {
    position: "absolute",
    top: "16px",
    right: "16px",
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    border: "2px solid #fbbf24",
    borderRadius: "20px",
    padding: "6px 12px",
    fontSize: "14px",
    color: "#fbbf24",
    fontWeight: "bold",
  },
};

// Add keyframes for animations (inject into document)
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .npc-choice-button:hover {
      background-color: #3a3a5e !important;
      border-color: #6366f1 !important;
      transform: translateX(4px);
    }
    .npc-continue-button:hover {
      background-color: #4f46e5 !important;
      transform: scale(1.02);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default NpcEventModal;
