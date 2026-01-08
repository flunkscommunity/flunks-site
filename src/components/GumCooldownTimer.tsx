import { useState, useEffect, useRef, useCallback } from 'react';
import { checkGumCooldown } from '../utils/gumAPI';

interface GumCooldownTimerProps {
  walletAddress: string;
  source: string;
  onCanClaim: (canClaim: boolean) => void;
}

export const GumCooldownTimer: React.FC<GumCooldownTimerProps> = ({
  walletAddress,
  source,
  onCanClaim
}) => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [canClaim, setCanClaim] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState<string>('');
  const lastCheckRef = useRef<number>(0);
  const checkingRef = useRef<boolean>(false);
  // Store the callback in a ref to avoid re-running the effect when it changes
  const onCanClaimRef = useRef(onCanClaim);
  
  // Keep the ref up to date
  useEffect(() => {
    onCanClaimRef.current = onCanClaim;
  }, [onCanClaim]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let mounted = true;

    const checkCooldown = async () => {
      console.log(`🕐 [GumCooldownTimer] checkCooldown START - source: ${source}, wallet: ${walletAddress?.slice(0,10)}...`);
      
      if (!walletAddress || !mounted) {
        console.log(`🕐 [GumCooldownTimer] EARLY RETURN - walletAddress: ${!!walletAddress}, mounted: ${mounted}`);
        return;
      }
      
      // Prevent concurrent checks
      if (checkingRef.current) {
        console.log(`🕐 [GumCooldownTimer] EARLY RETURN - already checking`);
        return;
      }
      
      // Rate limit: minimum 30 seconds between checks
      const now = Date.now();
      if (now - lastCheckRef.current < 30000 && lastCheckRef.current > 0) {
        console.log(`🕐 [GumCooldownTimer] EARLY RETURN - rate limited`);
        return;
      }
      
      checkingRef.current = true;
      lastCheckRef.current = now;

      try {
        console.log(`🕐 [GumCooldownTimer] calling checkGumCooldown...`);
        const cooldownCheck = await checkGumCooldown(walletAddress, source);
        
        console.log(`🕐 [GumCooldownTimer] checkGumCooldown RETURNED:`, cooldownCheck, `mounted: ${mounted}`);
        
        if (!mounted) return;
        
        console.log(`🕐 [GumCooldownTimer] Cooldown check for ${source}:`, cooldownCheck);
        
        if (cooldownCheck.canEarn) {
          console.log(`🕐 [GumCooldownTimer] ✅ CAN EARN - calling setCanClaim(true) and onCanClaimRef.current(true)`);
          setCanClaim(true);
          setTimeRemaining(null);
          setReason('Ready to claim!');
          onCanClaimRef.current(true);
        } else if (cooldownCheck.cooldownMinutes && cooldownCheck.cooldownMinutes > 0) {
          console.log(`🕐 [GumCooldownTimer] ⏰ IN COOLDOWN - ${cooldownCheck.cooldownMinutes} minutes remaining`);
          setCanClaim(false);
          setTimeRemaining(cooldownCheck.cooldownMinutes * 60); // Convert to seconds
          setReason(cooldownCheck.reason || 'In cooldown');
          onCanClaimRef.current(false);
        } else {
          // Daily limit reached or other reason
          console.log(`🕐 [GumCooldownTimer] ❌ CANNOT CLAIM - reason: ${cooldownCheck.reason}`);
          setCanClaim(false);
          setTimeRemaining(null);
          setReason(cooldownCheck.reason || 'Cannot claim');
          onCanClaimRef.current(false);
        }
      } catch (error) {
        console.error('🕐 [GumCooldownTimer] ERROR checking cooldown:', error);
        if (mounted) {
          setCanClaim(false);
          setTimeRemaining(null);
          setReason('Error checking status');
          onCanClaimRef.current(false);
        }
      } finally {
        checkingRef.current = false;
        if (mounted) {
          console.log(`🕐 [GumCooldownTimer] ✅ Setting loading = false`);
          setLoading(false);
        }
      }
    };

    // Initial check
    checkCooldown();

    // Re-check when app/tab becomes visible again (critical for mobile apps)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log(`🔄 App became visible, re-checking ${source} cooldown...`);
        // Reset the rate limit so we can check immediately
        lastCheckRef.current = 0;
        checkCooldown();
      }
    };

    const handleFocus = () => {
      console.log(`🔄 Window focused, re-checking ${source} cooldown...`);
      lastCheckRef.current = 0;
      checkCooldown();
    };

    // Listen for visibility and focus changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Set up countdown timer (only for displaying remaining time)
    interval = setInterval(() => {
      if (!mounted) return;
      
      setTimeRemaining(prev => {
        if (!prev || prev <= 0) {
          return null;
        }
        
        // When countdown reaches 0, schedule a recheck (but not immediately)
        if (prev === 1) {
          setTimeout(checkCooldown, 1000);
        }
        
        return prev - 1;
      });
    }, 1000);

    // Also periodically re-check every 60 seconds in case of timezone rollover
    const periodicCheck = setInterval(() => {
      if (!mounted) return;
      lastCheckRef.current = 0;
      checkCooldown();
    }, 60000);

    return () => {
      mounted = false;
      if (interval) clearInterval(interval);
      clearInterval(periodicCheck);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [walletAddress, source]); // Note: onCanClaim is stored in a ref to avoid infinite loops

  if (loading) {
    return <span style={{ color: '#666', fontSize: '12px' }}>Checking status...</span>;
  }

  if (canClaim) {
    return <span style={{ color: '#00aa00', fontWeight: 'bold' }}>✅ Ready to claim!</span>;
  }

  if (timeRemaining && timeRemaining > 0) {
    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    const formatTime = () => {
      if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      } else {
        return `${seconds}s`;
      }
    };

    return (
      <div style={{ fontSize: '12px' }}>
        <div style={{ color: '#ff6600', fontFamily: 'monospace' }}>
          ⏰ Next claim in: <strong>{formatTime()}</strong>
        </div>
        {source === 'daily_login' && (
          <div style={{ color: '#666', fontSize: '11px', marginTop: '4px' }}>
            Resets at midnight UTC
          </div>
        )}
      </div>
    );
  }

  return (
    <span style={{ color: '#666', fontSize: '12px' }}>
      ❌ {reason}
    </span>
  );
};
