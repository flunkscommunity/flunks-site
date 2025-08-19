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
import { GumDisplay } from "components/GumDisplay";

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
      
      canClaimDailyLogin(primaryWallet.address).then(setCanClaimDaily);
    }
  }, [primaryWallet?.address]);

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

  // Check if user has profile before allowing gum staking
  if (!hasProfile) {
    return (
      <ErrorWindow
        title="Profile Required"
        message="You need to create your profile before using the Gumball Machine."
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
    <AppLoader bgImage="/images/loading/gum-app-bg.webp">
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="Gumball Machine v1"
        onClose={() => {
          closeWindow(WINDOW_IDS.GUMBALL_MACHINE);
        }}
        windowsId={WINDOW_IDS.GUMBALL_MACHINE}
        onHelp={() => {
          openWindow({
            key: WINDOW_IDS.GUMBALL_MACHINE_HELP,
            window: <GumballMachineHelp />,
          });
        }}
        initialWidth="500px"
        initialHeight="70%"
        toolbar={
          <Toolbar>
            <Button variant="menu" size="sm" active>
              Main
            </Button>
            <Button variant="menu" size="sm" disabled>
              Leaderboard
            </Button>
          </Toolbar>
        }
        
      headerIcon="/images/icons/gum-machine.png"
      >
        <FclTransactionProvider>
          <StakingProvider>
            <GumDashboard />
            <Frame
              variant="inside"
              className="!flex !h-full !w-full overflow-hidden"
            >
              <StakeableItemsTable />
            </Frame>
          </StakingProvider>
        </FclTransactionProvider>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default GumballMachine;
