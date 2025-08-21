import { useState, useEffect } from 'react';
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

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const checkCooldown = async () => {
      if (!walletAddress) return;

      try {
        const cooldownCheck = await checkGumCooldown(walletAddress, source);
        
        console.log(`Cooldown check for ${source}:`, cooldownCheck);
        
        if (cooldownCheck.canEarn) {
          setCanClaim(true);
          setTimeRemaining(null);
          setReason('Ready to claim!');
          onCanClaim(true);
        } else if (cooldownCheck.cooldownMinutes && cooldownCheck.cooldownMinutes > 0) {
          setCanClaim(false);
          setTimeRemaining(cooldownCheck.cooldownMinutes * 60); // Convert to seconds
          setReason(cooldownCheck.reason || 'In cooldown');
          onCanClaim(false);
        } else {
          // Daily limit reached or other reason
          setCanClaim(false);
          setTimeRemaining(null);
          setReason(cooldownCheck.reason || 'Cannot claim');
          onCanClaim(false);
        }
      } catch (error) {
        console.error('Error checking cooldown:', error);
        setCanClaim(false);
        setTimeRemaining(null);
        setReason('Error checking status');
        onCanClaim(false);
      }
      
      setLoading(false);
    };

    // Initial check
    checkCooldown();

    // Set up countdown timer and periodic rechecks
    interval = setInterval(() => {
      if (timeRemaining && timeRemaining > 0) {
        setTimeRemaining(prev => {
          if (!prev || prev <= 1) {
            // Cooldown expired, check server
            setTimeout(checkCooldown, 100);
            return null;
          }
          return prev - 1;
        });
      } else if (!canClaim && !loading) {
        // Periodically recheck if we're not in an active countdown (every 30 seconds)
        setTimeout(checkCooldown, 100);
      }
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [walletAddress, source, onCanClaim]);

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
