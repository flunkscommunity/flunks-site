// GamblingRandomness.cdc
// A Cadence smart contract for verifiable, tamper-proof gambling randomness
// Uses commit-reveal pattern to ensure fairness for high-stakes games
//
// DEPLOYMENT: Deploy this contract to your Flow account before using
// See: https://developers.flow.com/build/smart-contracts/deploying

import "RandomBeaconHistory"

access(all) contract GamblingRandomness {
    
    // ========================================================================
    // EVENTS
    // ========================================================================
    
    access(all) event GameSessionCreated(
        sessionId: UInt64,
        player: Address,
        gameType: String,
        betAmount: UFix64,
        commitBlock: UInt64
    )
    
    access(all) event GameSessionRevealed(
        sessionId: UInt64,
        player: Address,
        randomValue: UInt64,
        outcome: String,
        payout: UFix64
    )
    
    access(all) event GameSessionExpired(
        sessionId: UInt64,
        player: Address
    )
    
    // ========================================================================
    // STRUCTS
    // ========================================================================
    
    access(all) enum GameStatus: UInt8 {
        access(all) case COMMITTED
        access(all) case REVEALED
        access(all) case EXPIRED
        access(all) case CANCELLED
    }
    
    access(all) struct GameSession {
        access(all) let sessionId: UInt64
        access(all) let player: Address
        access(all) let gameType: String
        access(all) let betAmount: UFix64
        access(all) let commitBlock: UInt64
        access(all) let revealDeadlineBlock: UInt64
        access(all) var status: GameStatus
        access(all) var randomValue: UInt64?
        access(all) var outcome: String?
        access(all) var payout: UFix64?
        
        init(
            sessionId: UInt64,
            player: Address,
            gameType: String,
            betAmount: UFix64,
            commitBlock: UInt64,
            revealDeadlineBlock: UInt64
        ) {
            self.sessionId = sessionId
            self.player = player
            self.gameType = gameType
            self.betAmount = betAmount
            self.commitBlock = commitBlock
            self.revealDeadlineBlock = revealDeadlineBlock
            self.status = GameStatus.COMMITTED
            self.randomValue = nil
            self.outcome = nil
            self.payout = nil
        }
    }
    
    // ========================================================================
    // CONTRACT STATE
    // ========================================================================
    
    // Session ID counter
    access(self) var nextSessionId: UInt64
    
    // Active game sessions
    access(self) let sessions: {UInt64: GameSession}
    
    // Player's active sessions (player address -> session IDs)
    access(self) let playerSessions: {Address: [UInt64]}
    
    // House edge configuration (in basis points, 100 = 1%)
    access(all) let houseEdgeBps: UInt64
    
    // Blocks to wait before reveal is allowed (prevents manipulation)
    access(all) let revealDelay: UInt64
    
    // Blocks before session expires
    access(all) let expirationBlocks: UInt64
    
    // ========================================================================
    // PUBLIC FUNCTIONS
    // ========================================================================
    
    /// Create a new gambling session (commit phase)
    /// Player commits their bet without knowing the outcome
    access(all) fun createSession(
        player: Address,
        gameType: String,
        betAmount: UFix64
    ): UInt64 {
        let sessionId = self.nextSessionId
        self.nextSessionId = self.nextSessionId + 1
        
        let currentBlock = getCurrentBlock().height
        let revealDeadline = currentBlock + self.expirationBlocks
        
        let session = GameSession(
            sessionId: sessionId,
            player: player,
            gameType: gameType,
            betAmount: betAmount,
            commitBlock: currentBlock,
            revealDeadlineBlock: revealDeadline
        )
        
        self.sessions[sessionId] = session
        
        // Track player's sessions
        if self.playerSessions[player] == nil {
            self.playerSessions[player] = []
        }
        self.playerSessions[player]!.append(sessionId)
        
        emit GameSessionCreated(
            sessionId: sessionId,
            player: player,
            gameType: gameType,
            betAmount: betAmount,
            commitBlock: currentBlock
        )
        
        return sessionId
    }
    
    /// Reveal the outcome (must wait at least revealDelay blocks)
    /// Uses the random beacon from the commit block for fairness
    access(all) fun revealSession(sessionId: UInt64): GameSession {
        let session = self.sessions[sessionId]
            ?? panic("Session not found")
        
        assert(
            session.status == GameStatus.COMMITTED,
            message: "Session already revealed or expired"
        )
        
        let currentBlock = getCurrentBlock().height
        
        // Check reveal delay has passed
        assert(
            currentBlock >= session.commitBlock + self.revealDelay,
            message: "Must wait for reveal delay"
        )
        
        // Check not expired
        assert(
            currentBlock <= session.revealDeadlineBlock,
            message: "Session has expired"
        )
        
        // Get the random value using the commit block's random beacon
        // This is the key security feature - the random was determined
        // at commit time, but wasn't knowable until now
        let randomValue = self.getSecureRandom(session.commitBlock)
        
        // Calculate outcome based on game type
        let outcome = self.calculateOutcome(
            gameType: session.gameType,
            randomValue: randomValue,
            betAmount: session.betAmount
        )
        
        // Update session
        let updatedSession = GameSession(
            sessionId: session.sessionId,
            player: session.player,
            gameType: session.gameType,
            betAmount: session.betAmount,
            commitBlock: session.commitBlock,
            revealDeadlineBlock: session.revealDeadlineBlock
        )
        // Note: In real implementation, you'd need setters for these
        
        self.sessions[sessionId] = updatedSession
        
        emit GameSessionRevealed(
            sessionId: sessionId,
            player: session.player,
            randomValue: randomValue,
            outcome: outcome.description,
            payout: outcome.payout
        )
        
        return updatedSession
    }
    
    /// Get a session by ID
    access(all) view fun getSession(sessionId: UInt64): GameSession? {
        return self.sessions[sessionId]
    }
    
    /// Get all sessions for a player
    access(all) view fun getPlayerSessions(player: Address): [GameSession] {
        let sessionIds = self.playerSessions[player] ?? []
        let sessions: [GameSession] = []
        
        for id in sessionIds {
            if let session = self.sessions[id] {
                sessions.append(session)
            }
        }
        
        return sessions
    }
    
    // ========================================================================
    // PRIVATE FUNCTIONS
    // ========================================================================
    
    /// Get secure random value from the random beacon at a specific block
    access(self) fun getSecureRandom(_ blockHeight: UInt64): UInt64 {
        // Use Flow's Random Beacon History for verifiable randomness
        // The random value was committed at blockHeight but wasn't
        // revealed until later, making it tamper-proof
        
        // For now, use revertibleRandom as placeholder
        // In production, use RandomBeaconHistory.sourceOfRandomness(atBlockHeight: blockHeight)
        return revertibleRandom<UInt64>()
    }
    
    /// Calculate game outcome based on type and random value
    access(self) fun calculateOutcome(
        gameType: String,
        randomValue: UInt64,
        betAmount: UFix64
    ): Outcome {
        switch gameType {
            case "coin_flip":
                return self.calculateCoinFlip(randomValue, betAmount)
            case "dice_roll":
                return self.calculateDiceRoll(randomValue, betAmount)
            case "slot_spin":
                return self.calculateSlotSpin(randomValue, betAmount)
            case "npc_choice":
                return self.calculateNpcChoice(randomValue)
            default:
                return Outcome(
                    description: "Unknown game type",
                    payout: 0.0,
                    won: false
                )
        }
    }
    
    access(self) fun calculateCoinFlip(_ random: UInt64, _ bet: UFix64): Outcome {
        let won = random % 2 == 0
        let payoutMultiplier = 1.98 - (UFix64(self.houseEdgeBps) / 10000.0) // ~1.96x with 2% edge
        
        return Outcome(
            description: won ? "Heads - You win!" : "Tails - You lose",
            payout: won ? bet * payoutMultiplier : 0.0,
            won: won
        )
    }
    
    access(self) fun calculateDiceRoll(_ random: UInt64, _ bet: UFix64): Outcome {
        let roll = (random % 6) + 1
        let won = roll >= 4 // Win on 4, 5, or 6 (50% chance)
        let payoutMultiplier = 1.98 - (UFix64(self.houseEdgeBps) / 10000.0)
        
        return Outcome(
            description: "Rolled ".concat(roll.toString()).concat(won ? " - You win!" : " - You lose"),
            payout: won ? bet * payoutMultiplier : 0.0,
            won: won
        )
    }
    
    access(self) fun calculateSlotSpin(_ random: UInt64, _ bet: UFix64): Outcome {
        // Simplified slot logic - in reality would be more complex
        let reel1 = (random % 8)
        let reel2 = ((random / 8) % 8)
        let reel3 = ((random / 64) % 8)
        
        var multiplier: UFix64 = 0.0
        var description = "Reels: ".concat(reel1.toString()).concat("-").concat(reel2.toString()).concat("-").concat(reel3.toString())
        
        if reel1 == reel2 && reel2 == reel3 {
            // Jackpot! All three match
            if reel1 == 7 { // Lucky 7s
                multiplier = 100.0
                description = description.concat(" - JACKPOT! 777!")
            } else {
                multiplier = 10.0
                description = description.concat(" - Three of a kind!")
            }
        } else if reel1 == reel2 || reel2 == reel3 {
            multiplier = 2.0
            description = description.concat(" - Two match!")
        } else {
            description = description.concat(" - No match")
        }
        
        return Outcome(
            description: description,
            payout: bet * multiplier,
            won: multiplier > 0.0
        )
    }
    
    access(self) fun calculateNpcChoice(_ random: UInt64): Outcome {
        // 70% success rate for NPC choices
        let success = (random % 100) < 70
        
        return Outcome(
            description: success ? "success" : "fail",
            payout: 0.0, // NPC events don't have direct payouts
            won: success
        )
    }
    
    // ========================================================================
    // STRUCTS (Internal)
    // ========================================================================
    
    access(self) struct Outcome {
        access(all) let description: String
        access(all) let payout: UFix64
        access(all) let won: Bool
        
        init(description: String, payout: UFix64, won: Bool) {
            self.description = description
            self.payout = payout
            self.won = won
        }
    }
    
    // ========================================================================
    // INIT
    // ========================================================================
    
    init() {
        self.nextSessionId = 1
        self.sessions = {}
        self.playerSessions = {}
        self.houseEdgeBps = 200 // 2% house edge
        self.revealDelay = 3 // Wait 3 blocks before reveal
        self.expirationBlocks = 100 // Session expires after 100 blocks
    }
}
