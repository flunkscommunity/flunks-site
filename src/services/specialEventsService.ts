import { awardGum, checkGumCooldown } from '../utils/gumAPI';

export interface SpecialEvent {
  id: string;
  name: string;
  description: string;
  gum_reward: number;
  start_time: Date;
  end_time: Date;
  is_active: boolean;
  max_claims_per_user?: number;
  cooldown_minutes?: number;
}

export interface SpecialEventResult {
  success: boolean;
  earned: number;
  event_name?: string;
  error?: string;
}

// Mock special events - in production these would come from database/API
const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    id: 'weekend_bonus_2025_08',
    name: 'Weekend Bonus',
    description: 'Extra gum for weekend warriors!',
    gum_reward: 25,
    start_time: new Date('2025-08-16T00:00:00Z'), // Saturday
    end_time: new Date('2025-08-18T23:59:59Z'), // Sunday
    is_active: true,
    max_claims_per_user: 1,
    cooldown_minutes: 1440 // 24 hours
  },
  {
    id: 'new_user_bonus',
    name: 'New User Welcome',
    description: 'Welcome to Flunks! Here\'s some starter gum!',
    gum_reward: 100,
    start_time: new Date('2025-01-01T00:00:00Z'),
    end_time: new Date('2026-01-01T00:00:00Z'),
    is_active: true,
    max_claims_per_user: 1,
    cooldown_minutes: 0
  }
];

/**
 * Get currently active special events
 */
export function getActiveSpecialEvents(): SpecialEvent[] {
  const now = new Date();
  
  return SPECIAL_EVENTS.filter(event => 
    event.is_active && 
    now >= event.start_time && 
    now <= event.end_time
  );
}

/**
 * Check if user can participate in a special event
 */
export async function canParticipateInEvent(
  walletAddress: string, 
  eventId: string
): Promise<{ canParticipate: boolean; reason?: string }> {
  try {
    const event = SPECIAL_EVENTS.find(e => e.id === eventId);
    if (!event) {
      return { canParticipate: false, reason: 'Event not found' };
    }

    const now = new Date();
    if (!event.is_active || now < event.start_time || now > event.end_time) {
      return { canParticipate: false, reason: 'Event not active' };
    }

    // Check if user has already claimed (stored in localStorage for now)
    const claimKey = `special_event_${eventId}_${walletAddress}`;
    const lastClaim = localStorage.getItem(claimKey);
    
    if (lastClaim && event.max_claims_per_user === 1) {
      return { canParticipate: false, reason: 'Already claimed this event' };
    }

    // Check cooldown if applicable
    if (event.cooldown_minutes && event.cooldown_minutes > 0 && lastClaim) {
      const lastClaimTime = new Date(lastClaim);
      const cooldownEndTime = new Date(lastClaimTime.getTime() + event.cooldown_minutes * 60 * 1000);
      
      if (now < cooldownEndTime) {
        const remainingMinutes = Math.ceil((cooldownEndTime.getTime() - now.getTime()) / (1000 * 60));
        return { 
          canParticipate: false, 
          reason: `Cooldown active, ${remainingMinutes} minutes remaining` 
        };
      }
    }

    return { canParticipate: true };
  } catch (error) {
    console.error('Error checking event participation:', error);
    return { canParticipate: false, reason: 'Error checking eligibility' };
  }
}

/**
 * Claim special event reward
 */
export async function claimSpecialEvent(
  walletAddress: string, 
  eventId: string
): Promise<SpecialEventResult> {
  try {
    const event = SPECIAL_EVENTS.find(e => e.id === eventId);
    if (!event) {
      return {
        success: false,
        earned: 0,
        error: 'Event not found'
      };
    }

    // Check if user can participate
    const eligibilityCheck = await canParticipateInEvent(walletAddress, eventId);
    if (!eligibilityCheck.canParticipate) {
      return {
        success: false,
        earned: 0,
        error: eligibilityCheck.reason || 'Cannot participate in event'
      };
    }

    // Award the special event gum
    const result = await awardGum(walletAddress, 'special_event', {
      event_id: eventId,
      event_name: event.name,
      event_reward: event.gum_reward,
      claim_time: new Date().toISOString()
    });

    if (result.success) {
      // Mark as claimed
      const claimKey = `special_event_${eventId}_${walletAddress}`;
      localStorage.setItem(claimKey, new Date().toISOString());

      return {
        success: true,
        earned: result.earned,
        event_name: event.name
      };
    } else {
      return {
        success: false,
        earned: 0,
        error: result.error || 'Failed to claim special event reward'
      };
    }
  } catch (error) {
    console.error('Error claiming special event:', error);
    return {
      success: false,
      earned: 0,
      error: 'Failed to claim special event reward'
    };
  }
}

/**
 * Auto-check for available special events on login
 */
export async function checkForSpecialEvents(walletAddress: string): Promise<void> {
  try {
    const activeEvents = getActiveSpecialEvents();
    
    for (const event of activeEvents) {
      const eligibilityCheck = await canParticipateInEvent(walletAddress, event.id);
      
      if (eligibilityCheck.canParticipate) {
        console.log(`🎉 Special event available: ${event.name} - ${event.gum_reward} GUM`);
        
        // Dispatch event to show UI notification
        window.dispatchEvent(new CustomEvent('specialEventAvailable', {
          detail: { 
            event,
            walletAddress 
          }
        }));
      }
    }
  } catch (error) {
    console.error('Error checking special events:', error);
  }
}

/**
 * Get user's claimed special events
 */
export function getUserClaimedEvents(walletAddress: string): string[] {
  const claimedEvents: string[] = [];
  
  for (const event of SPECIAL_EVENTS) {
    const claimKey = `special_event_${event.id}_${walletAddress}`;
    if (localStorage.getItem(claimKey)) {
      claimedEvents.push(event.id);
    }
  }
  
  return claimedEvents;
}
