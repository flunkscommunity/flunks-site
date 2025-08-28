import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Frame, Toolbar, MenuList, MenuListItem } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import AppLoader from "components/AppLoader";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import ErrorWindow from "./ErrorWindow";
import { useUserProfile } from "contexts/UserProfileContext";
import UserProfile from "./UserProfile";
import { useGum } from "contexts/GumContext";
import { useState, useEffect } from "react";
import { getActiveSpecialEvents, claimSpecialEvent, type SpecialEvent } from "../services/specialEventsService";
import { claimDailyLogin, canClaimDailyLogin } from "../services/dailyLoginService";
import { GumCooldownTimer } from "../components/GumCooldownTimer";

const GumballMachine: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();
  const { user, primaryWallet } = useDynamicContext();
  const { hasProfile } = useUserProfile();
  const { balance, stats, refreshBalance, refreshStats } = useGum();
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [claimingEvent, setClaimingEvent] = useState<string | null>(null);
  const [claimingDaily, setClaimingDaily] = useState(false);

  // Load special events and daily login status
  useEffect(() => {
    if (primaryWallet?.address) {
      setSpecialEvents(getActiveSpecialEvents());
      
      // Initial check for daily login - will be updated by countdown timer
      canClaimDailyLogin(primaryWallet.address).then(setCanClaimDaily);
    }
  }, [primaryWallet?.address]);

  // Handle countdown timer updates
  const handleDailyLoginUpdate = (canClaim: boolean) => {
    setCanClaimDaily(canClaim);
  };

  const handleClaimSpecialEvent = async (eventId: string) => {
    if (!primaryWallet?.address || claimingEvent) return;
    
    setClaimingEvent(eventId);
    try {
      const result = await claimSpecialEvent(primaryWallet.address, eventId);
      
      if (result.success) {
        alert(`🎉 Claimed ${result.earned} GUM from ${result.event_name}!`);
        refreshBalance();
        // Update special events list
        setSpecialEvents(getActiveSpecialEvents());
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error claiming special event:', error);
      alert('❌ Failed to claim special event');
    } finally {
      setClaimingEvent(null);
    }
  };

  const handleClaimDailyLogin = async () => {
    if (!primaryWallet?.address || claimingDaily) return;
    
    setClaimingDaily(true);
    try {
      const result = await claimDailyLogin(primaryWallet.address);
      
      if (result.success) {
        alert(`🎉 Daily bonus claimed: ${result.earned} GUM!`);
        refreshBalance();
        setCanClaimDaily(false);
      } else {
        alert(`❌ ${result.error}`);
      }
    } catch (error) {
      console.error('Error claiming daily login:', error);
      alert('❌ Failed to claim daily bonus');
    } finally {
      setClaimingDaily(false);
    }
  };

  if (!user) {
    return (
      <ErrorWindow
        title="Error Starting Program"
        message="You're not signed in. Please sign in to continue.."
        actions={
          <>
            <Button onClick={() => closeWindow(WINDOW_IDS.GUMBALL_MACHINE)}>
              Close
            </Button>
            <DynamicConnectButton>
              <Button className="ml-auto">Sign In</Button>
            </DynamicConnectButton>
          </>
        }
        windowId={WINDOW_IDS.GUMBALL_MACHINE}
      />
    );
  }

  // Check if user has profile before allowing access
  if (!hasProfile) {
    return (
      <ErrorWindow
        title="Profile Required"
        message="You need to create your profile before accessing the Gum Center."
        actions={
          <>
            <Button onClick={() => closeWindow(WINDOW_IDS.GUMBALL_MACHINE)}>
              Close
            </Button>
            <Button 
              className="ml-auto" 
              onClick={() => {
                closeWindow(WINDOW_IDS.GUMBALL_MACHINE);
                openWindow({
                  key: WINDOW_IDS.USER_PROFILE,
                  window: <UserProfile />
                });
              }}
            >
              Create Profile
            </Button>
          </>
        }
        windowId={WINDOW_IDS.GUMBALL_MACHINE}
      />
    );
  }

  return (
    <AppLoader bgImage="/images/gum-bg.webp">
      <DraggableResizeableWindow
        headerTitle="💰 Gum Center"
        headerIcon="/images/icons/gum-machine.png"
        windowsId={WINDOW_IDS.GUMBALL_MACHINE}
        initialWidth="600"
        initialHeight="500"
      >
        <div style={{ padding: '16px', height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Gum Balance Display */}
          <Frame variant="well" style={{ padding: '16px' }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🍬 Your Gum Balance
            </h2>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00ff00' }}>
              {balance.toLocaleString()} GUM
            </div>
            {stats && (
              <div style={{ marginTop: '8px', fontSize: '14px', color: '#666' }}>
                <div>Total Earned: {stats.total_earned.toLocaleString()} GUM</div>
                <div>Total Spent: {stats.total_spent.toLocaleString()} GUM</div>
              </div>
            )}
          </Frame>

          {/* Daily Login Bonus */}
          <Frame variant="well" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🌅 Daily Login Bonus
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Earn 15 GUM every day just for logging in! (Automatically claimed when you connect)
            </p>
            
            {/* Countdown Timer */}
            {primaryWallet?.address && (
              <div style={{ margin: '8px 0', fontSize: '14px' }}>
                <GumCooldownTimer
                  walletAddress={primaryWallet.address}
                  source="daily_login"
                  onCanClaim={handleDailyLoginUpdate}
                />
              </div>
            )}
            
            {canClaimDaily ? (
              <Button 
                onClick={handleClaimDailyLogin}
                disabled={claimingDaily}
                style={{ backgroundColor: '#00aa00', color: 'white' }}
              >
                {claimingDaily ? 'Claiming...' : 'Claim 15 GUM'}
              </Button>
            ) : (
              <Button disabled>
                {claimingDaily ? 'Claiming...' : 'Already Claimed Today'}
              </Button>
            )}
          </Frame>

          {/* Special Events */}
          {specialEvents.length > 0 && (
            <Frame variant="well" style={{ padding: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🎉 Special Events
              </h3>
              <MenuList>
                {specialEvents.map((event) => (
                  <MenuListItem 
                    key={event.id}
                    onClick={() => handleClaimSpecialEvent(event.id)}
                    disabled={claimingEvent === event.id}
                    style={{ padding: '8px', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{event.name}</strong>
                        <br />
                        <small>{event.description}</small>
                      </div>
                      <div style={{ color: '#00aa00', fontWeight: 'bold' }}>
                        {claimingEvent === event.id ? 'Claiming...' : `+${event.gum_reward} GUM`}
                      </div>
                    </div>
                  </MenuListItem>
                ))}
              </MenuList>
            </Frame>
          )}

          {/* Daily Activities Reminder */}
          <Frame variant="well" style={{ padding: '16px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🎯 Daily Activities
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
              Don't forget to visit your locker daily for check-ins and explore special events to maximize your GUM earnings!
            </p>
            <Button 
              onClick={() => {
                closeWindow(WINDOW_IDS.GUMBALL_MACHINE);
                openWindow({
                  key: WINDOW_IDS.USER_PROFILE,
                  window: <UserProfile />
                });
              }}
            >
              Go to My Locker
            </Button>
          </Frame>

          {/* Refresh Button */}
          <div style={{ marginTop: 'auto', textAlign: 'center' }}>
            <Button onClick={() => { refreshBalance(); refreshStats(); }}>
              🔄 Refresh Balance
            </Button>
          </div>
        </div>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default GumballMachine;
