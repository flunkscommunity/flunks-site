-- ============================================================================
-- NPC Events System - Supabase Schema
-- ============================================================================
-- This schema supports dynamic NPC events that can be loaded from the database
-- instead of static TypeScript files.
--
-- Run this migration in Supabase SQL Editor to create the tables.
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Main NPC Events Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.npc_events (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- NPC Identity
  npc_name text NOT NULL,
  npc_description text NOT NULL,
  npc_sprite text, -- Optional sprite/portrait identifier
  
  -- Dialogue
  dialogue text NOT NULL,
  
  -- Location & Gating
  room text NOT NULL, -- e.g. 'underground', 'arcade', 'paradise_motel'
  min_chapter integer,
  max_chapter integer,
  required_flags text[] DEFAULT '{}', -- Flags player must have
  exclude_flags text[] DEFAULT '{}',  -- Flags that prevent this event
  
  -- Selection
  weight integer NOT NULL DEFAULT 1, -- Higher = more likely
  
  -- Choices & Outcomes
  player_choices text[] NOT NULL,
  outcomes jsonb NOT NULL, -- Record<string, NpcEventOutcome>
  
  -- Repeatability
  is_repeatable boolean NOT NULL DEFAULT true,
  cooldown_seconds integer,
  
  -- Metadata
  is_active boolean NOT NULL DEFAULT true, -- For enabling/disabling events
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for room-based queries (most common query pattern)
CREATE INDEX IF NOT EXISTS idx_npc_events_room ON public.npc_events(room);
CREATE INDEX IF NOT EXISTS idx_npc_events_active ON public.npc_events(is_active);
CREATE INDEX IF NOT EXISTS idx_npc_events_room_active ON public.npc_events(room, is_active);

-- ============================================================================
-- Player NPC Event History
-- ============================================================================
-- Tracks which events players have seen, when, and outcomes
CREATE TABLE IF NOT EXISTS public.player_npc_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Player identification (wallet address)
  wallet_address text NOT NULL,
  
  -- Event reference
  event_id uuid NOT NULL REFERENCES public.npc_events(id) ON DELETE CASCADE,
  
  -- Interaction details
  choice_made text NOT NULL,
  outcome_result text NOT NULL, -- 'success' or 'fail'
  outcome_text text NOT NULL,
  effects_applied jsonb DEFAULT '[]', -- Record of effects that were applied
  
  -- Timing
  triggered_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for player history queries
CREATE INDEX IF NOT EXISTS idx_player_npc_history_wallet ON public.player_npc_history(wallet_address);
CREATE INDEX IF NOT EXISTS idx_player_npc_history_event ON public.player_npc_history(event_id);
CREATE INDEX IF NOT EXISTS idx_player_npc_history_wallet_event ON public.player_npc_history(wallet_address, event_id);

-- ============================================================================
-- Player Flags Table
-- ============================================================================
-- Stores persistent flags earned from NPC events and other game mechanics
CREATE TABLE IF NOT EXISTS public.player_flags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  flag_name text NOT NULL,
  source text, -- What granted this flag (e.g. event ID, achievement ID)
  granted_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(wallet_address, flag_name)
);

CREATE INDEX IF NOT EXISTS idx_player_flags_wallet ON public.player_flags(wallet_address);

-- ============================================================================
-- Player Items Table (for NPC-granted items)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.player_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  source text, -- Where the item came from
  acquired_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(wallet_address, item_name)
);

CREATE INDEX IF NOT EXISTS idx_player_items_wallet ON public.player_items(wallet_address);

-- ============================================================================
-- Player Reputation Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.player_reputation (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address text NOT NULL,
  faction text NOT NULL, -- e.g. 'underground', 'arcade', 'paradise_motel'
  reputation integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  UNIQUE(wallet_address, faction)
);

CREATE INDEX IF NOT EXISTS idx_player_reputation_wallet ON public.player_reputation(wallet_address);

-- ============================================================================
-- Trigger: Auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to npc_events
DROP TRIGGER IF EXISTS set_npc_events_updated_at ON public.npc_events;
CREATE TRIGGER set_npc_events_updated_at
  BEFORE UPDATE ON public.npc_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to player_reputation
DROP TRIGGER IF EXISTS set_player_reputation_updated_at ON public.player_reputation;
CREATE TRIGGER set_player_reputation_updated_at
  BEFORE UPDATE ON public.player_reputation
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get all events for a room that are active
CREATE OR REPLACE FUNCTION get_room_events(room_id text)
RETURNS SETOF public.npc_events AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.npc_events
  WHERE room = room_id
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Get player's last trigger time for an event
CREATE OR REPLACE FUNCTION get_last_event_trigger(
  p_wallet_address text,
  p_event_id uuid
)
RETURNS timestamptz AS $$
DECLARE
  last_time timestamptz;
BEGIN
  SELECT MAX(triggered_at) INTO last_time
  FROM public.player_npc_history
  WHERE wallet_address = p_wallet_address
    AND event_id = p_event_id;
  
  RETURN last_time;
END;
$$ LANGUAGE plpgsql;

-- Check if player has completed a non-repeatable event
CREATE OR REPLACE FUNCTION has_completed_event(
  p_wallet_address text,
  p_event_id uuid
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.player_npc_history
    WHERE wallet_address = p_wallet_address
      AND event_id = p_event_id
  );
END;
$$ LANGUAGE plpgsql;

-- Get player's flags as an array
CREATE OR REPLACE FUNCTION get_player_flags(p_wallet_address text)
RETURNS text[] AS $$
BEGIN
  RETURN ARRAY(
    SELECT flag_name
    FROM public.player_flags
    WHERE wallet_address = p_wallet_address
  );
END;
$$ LANGUAGE plpgsql;

-- Add a flag to a player (upsert)
CREATE OR REPLACE FUNCTION add_player_flag(
  p_wallet_address text,
  p_flag_name text,
  p_source text DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.player_flags (wallet_address, flag_name, source)
  VALUES (p_wallet_address, p_flag_name, p_source)
  ON CONFLICT (wallet_address, flag_name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Update player reputation (upsert with increment)
CREATE OR REPLACE FUNCTION update_player_reputation(
  p_wallet_address text,
  p_faction text,
  p_amount integer
)
RETURNS integer AS $$
DECLARE
  new_rep integer;
BEGIN
  INSERT INTO public.player_reputation (wallet_address, faction, reputation)
  VALUES (p_wallet_address, p_faction, p_amount)
  ON CONFLICT (wallet_address, faction) DO UPDATE
  SET reputation = public.player_reputation.reputation + p_amount
  RETURNING reputation INTO new_rep;
  
  RETURN new_rep;
END;
$$ LANGUAGE plpgsql;

-- Update player item quantity (upsert with increment)
CREATE OR REPLACE FUNCTION update_player_item(
  p_wallet_address text,
  p_item_name text,
  p_amount integer,
  p_source text DEFAULT NULL
)
RETURNS integer AS $$
DECLARE
  new_qty integer;
BEGIN
  INSERT INTO public.player_items (wallet_address, item_name, quantity, source)
  VALUES (p_wallet_address, p_item_name, GREATEST(0, p_amount), p_source)
  ON CONFLICT (wallet_address, item_name) DO UPDATE
  SET quantity = GREATEST(0, public.player_items.quantity + p_amount)
  RETURNING quantity INTO new_qty;
  
  RETURN new_qty;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.npc_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_npc_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_reputation ENABLE ROW LEVEL SECURITY;

-- NPC Events: Public read, admin write
CREATE POLICY "NPC events are viewable by everyone"
  ON public.npc_events FOR SELECT
  USING (true);

-- Player history: Players can read/write their own
CREATE POLICY "Players can view their own NPC history"
  ON public.player_npc_history FOR SELECT
  USING (true); -- In production, restrict to authenticated user's wallet

CREATE POLICY "Players can insert their own NPC history"
  ON public.player_npc_history FOR INSERT
  WITH CHECK (true); -- In production, restrict to authenticated user's wallet

-- Player flags: Players can read/write their own
CREATE POLICY "Players can view their own flags"
  ON public.player_flags FOR SELECT
  USING (true);

CREATE POLICY "Players can insert their own flags"
  ON public.player_flags FOR INSERT
  WITH CHECK (true);

-- Player items: Players can read/write their own
CREATE POLICY "Players can view their own items"
  ON public.player_items FOR SELECT
  USING (true);

CREATE POLICY "Players can manage their own items"
  ON public.player_items FOR ALL
  USING (true);

-- Player reputation: Players can read/write their own
CREATE POLICY "Players can view their own reputation"
  ON public.player_reputation FOR SELECT
  USING (true);

CREATE POLICY "Players can manage their own reputation"
  ON public.player_reputation FOR ALL
  USING (true);

-- ============================================================================
-- Sample Data: Insert Cornfield Psychic event
-- ============================================================================
INSERT INTO public.npc_events (
  npc_name,
  npc_description,
  dialogue,
  room,
  min_chapter,
  weight,
  player_choices,
  outcomes,
  is_repeatable,
  cooldown_seconds
) VALUES (
  'Cornfield Psychic',
  'A mysterious kid reading tarot cards made from old homework pages.',
  'The winds of Arcadia whisper a message... if you have gum for the spirits.',
  'underground',
  2,
  8,
  ARRAY[
    'Give 3 gum for a reading',
    'Ask what the spirits want',
    'Walk away slowly'
  ],
  '{
    "Give 3 gum for a reading": {
      "success": "You receive a real clue about a hidden room in Crystal Springs.",
      "fail": "You get a useless prophecy: \"Beware vending machines that hum at night.\"",
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
  }'::jsonb,
  true,
  3600
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- Verification Queries (for testing)
-- ============================================================================
-- SELECT * FROM public.npc_events WHERE room = 'underground';
-- SELECT get_room_events('underground');
-- SELECT get_player_flags('0x1234...');
