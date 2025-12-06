# Flunks NPC Event System – The Underground

This document defines the structure, tone, and implementation details for **RANDOM NPC INTERACTIONS** in the Flunks universe. These events fire in places like the Underground (Four Thieves Bar), Arcade, Paradise Motel, and other interactive spaces.

## Tone & World Rules

- **Setting**: Small-town Arcadia, Midwest, 90s nostalgia.
- **Vibes**: Playful, weird, occasionally mysterious. Light humor, never mean.
- **Economy**: Gum, stickers, soda, tokens, small items, and lore as rewards.
- **Lore**: Don't contradict Flunks canon (Arcadia, Flunks High, Paradise Motel, etc.).

NPCs should feel like:
- Background characters that stepped into the spotlight for a moment.
- People with small problems, scams, favors, or secrets.
- A mix of helpful, neutral, and lightly scammy.

---

## Data Model Overview

Each NPC event is a structured object that the game engine can:

- **Choose** (based on room, chapter, and weights)
- **Display** (dialogue + choices)
- **Resolve** (success/fail outcomes, rewards, flags, cooldowns)

### Core `NpcEvent` Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID or unique identifier |
| `npcName` | string | Short, memorable label (e.g. `"Cornfield Psychic"`) |
| `npcDescription` | string | 1-line description of the NPC's vibe |
| `dialogue` | string | Main text shown when event triggers |
| `room` | string | Location identifier (e.g. `"underground"`, `"arcade"`, `"paradise_motel"`) |
| `minChapter` / `maxChapter` | number? | Optional story gating |
| `weight` | number | How likely this event is to be chosen vs others |
| `playerChoices` | string[] | List of choice labels shown to user |
| `outcomes` | Record | Map of `choice -> { success, fail, effects }` |
| `isRepeatable` | boolean | Whether this event can happen more than once |
| `cooldownSeconds` | number? | Min seconds before the same player can see it again |

---

## NPC Event JSON Shape

```jsonc
{
  "id": "cornfield-psychic-01",
  "npcName": "Cornfield Psychic",
  "npcDescription": "A mysterious kid reading tarot cards made from old homework pages.",
  "dialogue": "The winds of Arcadia whisper a message... if you have gum for the spirits.",
  "room": "underground",
  "minChapter": 2,
  "maxChapter": null,
  "weight": 8,
  "playerChoices": [
    "Give 3 gum for a reading",
    "Ask what the spirits want",
    "Walk away slowly"
  ],
  "outcomes": {
    "Give 3 gum for a reading": {
      "success": "You receive a real clue about a hidden room in Crystal Springs.",
      "fail": "You get a useless prophecy: 'Beware vending machines that hum at night.'",
      "successEffects": [
        { "type": "currency", "target": "gum", "amount": -3 },
        { "type": "lore", "target": "crystal_springs_clue", "flagsToSet": ["has_crystal_springs_hint"] }
      ],
      "failEffects": [
        { "type": "currency", "target": "gum", "amount": -3 }
      ]
    },
    "Ask what the spirits want": {
      "success": "The psychic gives you a gum wrapper map with cryptic markings.",
      "fail": "They stare at you unblinking until you leave.",
      "successEffects": [
        { "type": "item", "target": "gum_wrapper_map", "amount": 1 }
      ],
      "failEffects": []
    },
    "Walk away slowly": {
      "success": "You find 1 gum on the floor.",
      "fail": "You trip over a rake. No damage, just embarrassment.",
      "successEffects": [
        { "type": "currency", "target": "gum", "amount": 1 }
      ],
      "failEffects": []
    }
  },
  "isRepeatable": true,
  "cooldownSeconds": 3600
}
```

---

## Effect Types

`NpcEffect` is small but flexible:

| Property | Description |
|----------|-------------|
| `type` | `"currency"` \| `"item"` \| `"stat"` \| `"lore"` \| `"reputation"` \| `"flag"` |
| `target` | Specific stat/item/flag name (e.g. `"gum"`, `"luck"`, `"underground_rep"`) |
| `amount` | Positive or negative number (optional) |
| `flagsToSet` | Array of strings for one-off flags (`"met_rug_doctor"`, `"has_arcade_debt"`) |

---

## Using AI (Copilot / LLM) to Generate NPC Events

When generating NPC events with AI, always specify:

1. **World**: Flunks, Arcadia, 90s small town, gum economy.
2. **Location**: e.g. `"underground"` or `"paradise_motel"`.
3. **Output format**: Must match `NpcEvent` JSON schema.
4. **Count**: How many events you need at once (e.g. 3–5).

### Suggested Prompt

```
Generate 3 new Flunks NpcEvent objects in JSON format.
Room: "underground".
Use the schema from the npc-events.md document.
Keep NPCs quirky, small-town weird, and tied to gum, rumors, or small favors.
Theme: underground gambling den vibes - hustlers, fortune tellers, loan sharks, regulars with tips.
```

You can paste one or two canonical examples into the prompt so the AI mimics your style.

---

## Event Selection Flow (High Level)

```
1. Collect candidates filtered by:
   - room
   - chapter range
   - player flags (optional)

2. Filter out events that:
   - are not repeatable and already completed
   - are on cooldown for this player

3. Weighted random pick based on `weight`

4. Display `dialogue` + `playerChoices`

5. Resolve chosen outcome (success/fail)

6. Apply effects and update flags/history
```

See `src/game/npcEvents.ts` for code-level helpers.

---

## Room Identifiers

| Room ID | Location Name | Description |
|---------|--------------|-------------|
| `underground` | The Underground (Four Thieves Bar) | Gambling den, hustlers, degens |
| `arcade` | Arcade | Classic games, token economy |
| `paradise_motel` | Paradise Motel | Mysterious guests, room secrets |
| `snack_shack` | Snack Shack | Food, gossip, rumors |
| `treehouse` | Treehouse | Mystery club HQ |

---

## Implementation Files

| File | Purpose |
|------|---------|
| `src/game/npcEvents.ts` | TypeScript types, interfaces, core helpers |
| `src/game/npcEventEngine.ts` | Room-level trigger logic, orchestration |
| `src/game/npcEventsData.ts` | Static NPC event data (can be extended) |
| `src/hooks/useNpcEvents.ts` | React hook for component integration |
| `src/components/NpcEventModal.tsx` | UI component for displaying events |
| `sql-migrations/npc_events.sql` | Supabase schema for dynamic events |

---

## Future Considerations

- **Flow Blockchain Integration**: Store player flags/achievements on-chain
- **Dynamic Events**: Load events from Supabase instead of static data
- **Event Chains**: Multi-step NPC storylines that span sessions
- **Reputation System**: Underground rep affects NPC interactions
- **Time-Based Events**: Certain NPCs only appear at specific times
