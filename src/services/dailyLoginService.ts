import { awardGum, checkGumCooldown } from '../utils/gumAPI';

export interface DailyLoginResult {
  success: boolean;
  earned: number;
  alreadyClaimed?: boolean;
  error?: string;
}

/**
 * Check if user can claim daily login bonus
 */
export async function canClaimDailyLogin(walletAddress: string): Promise<boolean> {
  try {
    const cooldownCheck = await checkGumCooldown(walletAddress, 'daily_login');
    return cooldownCheck.canEarn;
  } catch (error) {
    console.error('Error checking daily login eligibility:', error);
    return false;
  }
}

/**
 * Attempt to award daily login bonus
 */
export async function claimDailyLogin(walletAddress: string): Promise<DailyLoginResult> {
  try {
    // Check if already claimed today
    const canClaim = await canClaimDailyLogin(walletAddress);
    if (!canClaim) {
      return {
        success: false,
        earned: 0,
        alreadyClaimed: true,
        error: 'Daily login bonus already claimed today'
      };
    }

    // Award the daily login bonus
    const result = await awardGum(walletAddress, 'daily_login', {
      login_time: new Date().toISOString(),
      source_type: 'automatic_daily_login'
    });

    if (result.success) {
      return {
        success: true,
        earned: result.earned
      };
    } else {
      return {
        success: false,
        earned: 0,
        error: result.error || 'Failed to claim daily login bonus'
      };
    }
  } catch (error) {
    console.error('Error claiming daily login:', error);
    return {
      success: false,
      earned: 0,
      error: 'Failed to claim daily login bonus'
    };
  }
}

/**
 * Auto-claim daily login on user login/wallet connection
 * This should be called when a user connects their wallet
 */
export async function autoClaimDailyLogin(walletAddress: string): Promise<void> {
  try {
    // Check if we've already attempted today (to avoid spam)
    const lastAttempt = localStorage.getItem(`daily_login_attempt_${walletAddress}`);
    const today = new Date().toDateString();
    
    if (lastAttempt === today) {
      console.log('🎁 Daily login already attempted today for', walletAddress.slice(0, 8) + '...');
      return;
    }

    console.log('🎁 Attempting automatic daily login for', walletAddress.slice(0, 8) + '...');
    
    const result = await claimDailyLogin(walletAddress);
    
    // Store that we attempted today regardless of success
    localStorage.setItem(`daily_login_attempt_${walletAddress}`, today);
    
    if (result.success && result.earned > 0) {
      console.log(`🎉 Daily login bonus claimed: ${result.earned} GUM!`);
      
      // Dispatch events to update UI
      window.dispatchEvent(new CustomEvent('dailyLoginClaimed', {
        detail: { 
          earned: result.earned,
          walletAddress 
        }
      }));
      
      // Also dispatch the generic gum balance update event
      window.dispatchEvent(new CustomEvent('gumBalanceUpdated', {
        detail: { 
          earned: result.earned,
          walletAddress,
          source: 'daily_login'
        }
      }));
      
      // Show notification if user wants
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Daily Bonus Claimed!', {
            body: `You earned ${result.earned} GUM!`,
            icon: '/images/icons/gum-active.png'
          });
        }
      }
    } else if (result.alreadyClaimed) {
      console.log('🎁 Daily login bonus already claimed today');
    } else {
      console.log('❌ Failed to claim daily login bonus:', result.error);
    }
  } catch (error) {
    console.error('Error in autoClaimDailyLogin:', error);
  }
}
