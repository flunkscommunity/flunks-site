import React, { useState, useRef, useEffect, useMemo } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import MobileWalletHelper from '../components/MobileWalletHelper';
import { GumCooldownTimer } from '../components/GumCooldownTimer';
import { isMobileDevice } from '../utils/mobileWalletDetection';
import { useWindowsContext } from '../contexts/WindowsContext';
import { useLockerInfo, useLockerAssignment } from '../hooks/useLocker';
import { useDynamicContext, DynamicConnectButton } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';
import UnifiedConnectButton from '../components/UnifiedConnectButton';
import * as fcl from '@onflow/fcl';
import { getUserGumBalance, getUserGumTransactions, awardGum } from '../utils/gumAPI';
import { getApiUrl } from '../utils/apiBaseUrl';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useGum } from '../contexts/GumContext';
import WeeklyObjectives from '../components/WeeklyObjectives';
import { supabase, hasValidSupabaseConfig } from '../lib/supabase';
// WINDOW_IDS lives in src/fixed.ts (baseUrl set to src)
import { WINDOW_IDS } from 'fixed';
import { useDemoModeOptional, DEMO_PROFILE, DEMO_CHAPTERS, DEMO_LOCKER, isIOSPlatform } from '../contexts/DemoModeContext';

/**
 * Normalize a Flow address to standard format (0x + 16 hex chars lowercase)
 */
function normalizeFlowAddress(address: string | null | undefined): string {
  if (!address) return '';
  
  let normalized = address.trim().toLowerCase();
  
  // Handle CAIP-10 format (e.g., "flow:mainnet:0x123...")
  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    normalized = parts[parts.length - 1];
  }
  
  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    normalized = '0x' + normalized;
  }
  
  return normalized;
}

const LockerSystemNew: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { lockerInfo, loading, error, refetch } = useLockerInfo();
  const { assignLocker, assigning } = useLockerAssignment();
  const { primaryWallet, setShowAuthFlow } = useDynamicContext();
  const { isConnected, address: unifiedAddress, walletType, disconnect } = useUnifiedWallet();
  const { hasProfile, profile } = useUserProfile();
  const { balance, stats } = useGum();
  
  // Demo mode support for iOS App Store review (iOS only)
  const demoMode = useDemoModeOptional();
  const isDemoMode = isIOSPlatform() && (demoMode?.isDemoMode || false);
  
  // In demo mode on iOS, treat as connected
  const effectivelyConnected = isDemoMode || isConnected;
  const effectiveAddress = isDemoMode ? demoMode?.demoWalletAddress : unifiedAddress;
  
  // In demo mode, use demo locker info
  const effectiveLockerInfo = isDemoMode ? DEMO_LOCKER : lockerInfo;
  const effectiveProfile = isDemoMode ? { username: DEMO_PROFILE.username, profile_icon: DEMO_PROFILE.profile_icon } : profile;
  const effectiveHasProfile = isDemoMode || hasProfile;
  
  // Normalize the wallet address for all API calls
  const normalizedAddress = useMemo(() => normalizeFlowAddress(effectiveAddress), [effectiveAddress]);
  
  const [currentSection, setCurrentSection] = useState<1 | 2 | 3>(1);
  const [gumBalance, setGumBalance] = useState<number>(0);
  const [selectedJacket, setSelectedJacket] = useState<number>(0); // 0 or 1 for jacket options
  const [todayGum, setTodayGum] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [hasRoom7Key, setHasRoom7Key] = useState(false);
  const [hasFourThievesAccess, setHasFourThievesAccess] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Halloween GumDrop state
  const [halloweenDropActive, setHalloweenDropActive] = useState(false);
  const [halloweenClaimed, setHalloweenClaimed] = useState(false);
  const [flunkCount, setFlunkCount] = useState(0);
  const [halloweenTimeLeft, setHalloweenTimeLeft] = useState('');
  const [claimingHalloween, setClaimingHalloween] = useState(false);

  // Jacket options (now using jersey assets)
  const jacketOptions = [
    {
      name: 'Jacket 1',
      image: '/images/jerseys/jersey-1.png',
      description: 'Flunks jacket option'
    },
    {
      name: 'Jacket 2',  
      image: '/images/jerseys/jersey-2.png',
      description: 'Alternate jacket option'
    }
  ];

  // Handle jacket navigation
  const switchJacket = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setSelectedJacket(selectedJacket === 0 ? jacketOptions.length - 1 : selectedJacket - 1);
    } else {
      setSelectedJacket(selectedJacket === jacketOptions.length - 1 ? 0 : selectedJacket + 1);
    }
  };

  // Load gum balance and tracking data when wallet connects
  useEffect(() => {
    // In demo mode, set demo balance
    if (isDemoMode && demoMode) {
      setGumBalance(demoMode.demoBalance);
      setStreak(3);
      setTodayGum(50);
      setCanClaimDaily(false);
      setHasRoom7Key(true); // Demo user has some progress
      setHasFourThievesAccess(true);
      return;
    }
    
    if (normalizedAddress) {
      loadGumBalance();
      loadGumTrackingData();
      checkRoom7Key();
      checkFourThievesUnderground();
      checkHalloweenDrop(); // Check Halloween GumDrop status
    }
  }, [normalizedAddress, isDemoMode, demoMode]);

  // Use GumContext balance if available (or demo balance in demo mode)
  useEffect(() => {
    if (isDemoMode && demoMode) {
      setGumBalance(demoMode.demoBalance);
    } else if (balance !== undefined) {
      setGumBalance(balance);
    }
  }, [balance, isDemoMode, demoMode]);

  // Listen for gum balance updates from floating button
  useEffect(() => {
    const handleGumUpdate = () => {
      loadGumBalance();
      loadGumTrackingData();
    };

    const handleDailyLoginClaimed = () => {
      // Refresh tracking data when daily login is claimed
      loadGumBalance();
      loadGumTrackingData();
    };

    const handleRoom7KeyObtained = () => {
      // Refresh key status when obtained
      checkRoom7Key();
    };

    const handleObjectivesUpdated = () => {
      // Refresh all objective statuses
      checkRoom7Key();
      checkFourThievesUnderground();
    };

    window.addEventListener('gumBalanceUpdated', handleGumUpdate);
    window.addEventListener('dailyLoginClaimed', handleDailyLoginClaimed);
    window.addEventListener('room7KeyObtained', handleRoom7KeyObtained);
    window.addEventListener('objectives-updated', handleObjectivesUpdated);
    
    return () => {
      window.removeEventListener('gumBalanceUpdated', handleGumUpdate);
      window.removeEventListener('dailyLoginClaimed', handleDailyLoginClaimed);
      window.removeEventListener('room7KeyObtained', handleRoom7KeyObtained);
      window.removeEventListener('objectives-updated', handleObjectivesUpdated);
    };
  }, []);

  // Scroll position listener with snap-to-section behavior (DISABLED)
  useEffect(() => {
    // Scroll functionality disabled - no longer snaps to sections
    // const handleScroll = () => {
    //   if (scrollContainerRef.current) {
    //     const container = scrollContainerRef.current;
    //     const containerHeight = container.clientHeight;
    //     const scrollTop = container.scrollTop;
        
    //     // Determine which section user is closest to
    //     let targetSection: 1 | 2 | 3;
    //     if (scrollTop < containerHeight * 0.4) {
    //       targetSection = 1;
    //     } else if (scrollTop < containerHeight * 1.8) {
    //       targetSection = 2;
    //     } else {
    //       targetSection = 3;
    //     }
        
    //     // Only snap if we're not already in the middle of scrolling
    //     if (targetSection !== currentSection) {
    //       setCurrentSection(targetSection);
          
    //       // Smooth snap to the target section
    //       let targetScrollTop = 0;
    //       if (targetSection === 2) {
    //         targetScrollTop = containerHeight * 0.8;
    //       } else if (targetSection === 3) {
    //         targetScrollTop = containerHeight * 0.8 + containerHeight * 1.4;
    //       }
          
    //       // Use smooth scrolling to snap to position
    //       container.scrollTo({
    //         top: targetScrollTop,
    //         behavior: 'smooth'
    //       });
    //     }
    //   }
    // };

    // const container = scrollContainerRef.current;
    // if (container) {
    //   // Add some debouncing to prevent excessive snapping
    //   let scrollTimeout: NodeJS.Timeout;
      
    //   const debouncedScroll = () => {
    //     clearTimeout(scrollTimeout);
    //     scrollTimeout = setTimeout(handleScroll, 150);
    //   };
      
    //   container.addEventListener('scroll', debouncedScroll);
    //   return () => {
    //     container.removeEventListener('scroll', debouncedScroll);
    //     clearTimeout(scrollTimeout);
    //   };
    // }
  }, [currentSection]);

  const loadGumBalance = async () => {
    if (!normalizedAddress) {
      console.log('🔐 Locker: No normalized address, skipping balance load');
      return;
    }
    console.log('🔐 Locker: Loading GUM balance for:', normalizedAddress);
    try {
      const balance = await getUserGumBalance(normalizedAddress);
      console.log('✅ Locker: GUM balance loaded:', balance);
      setGumBalance(balance || 0);
    } catch (error) {
      console.error('❌ Locker: Error loading gum balance:', error);
    }
  };

  // Check if user has Room 7 key
  const checkRoom7Key = async () => {
    if (!normalizedAddress) return;
    
    // Try Supabase view first (bypasses RLS)
    if (hasValidSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase
          .from('wallet_room7_keys')
          .select('wallet_address')
          .eq('wallet_address', normalizedAddress)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          setHasRoom7Key(true);
          return;
        }
      } catch (err) {
        console.log('⚠️ Room7 key Supabase check failed, trying API');
      }
    }
    
    // Fallback to API
    try {
      const response = await fetch(getApiUrl(`/api/check-room7-key?walletAddress=${normalizedAddress}`));
      const data = await response.json();
      if (data.success && data.hasKey) {
        setHasRoom7Key(true);
      }
    } catch (error) {
      console.error('Error checking Room 7 key:', error);
    }
  };

  // Check if user has Four Thieves Underground access
  const checkFourThievesUnderground = async () => {
    if (!normalizedAddress) return;
    
    // Try Supabase view first (bypasses RLS)
    if (hasValidSupabaseConfig && supabase) {
      try {
        const { data, error } = await supabase
          .from('wallet_underground_access')
          .select('wallet_address')
          .eq('wallet_address', normalizedAddress)
          .limit(1);
        
        if (!error && data && data.length > 0) {
          setHasFourThievesAccess(true);
          return;
        }
      } catch (err) {
        console.log('⚠️ Underground access Supabase check failed, trying API');
      }
    }
    
    // Fallback to API
    try {
      const response = await fetch(getApiUrl(`/api/check-four-thieves-underground?walletAddress=${normalizedAddress}`));
      const data = await response.json();
      if (data.success && data.hasAccess) {
        setHasFourThievesAccess(true);
      }
    } catch (error) {
      console.error('Error checking Four Thieves Underground access:', error);
    }
  };

  // Check Halloween GumDrop status
  const checkHalloweenDrop = async () => {
    console.log('🎃 checkHalloweenDrop called, normalizedAddress:', normalizedAddress);
    if (!normalizedAddress) {
      console.log('❌ No normalizedAddress, exiting early');
      return;
    }
    
    try {
      // PRIORITY 1: Check blockchain for active GumDrop
      console.log('🔗 Querying SemesterZero contract on mainnet...');
      const isActive = await fcl.query({
        cadence: `
          import SemesterZero from 0x807c3d470888cc48
          
          access(all) fun main(): Bool {
            if SemesterZero.activeGumDrop == nil {
              return false
            }
            
            let drop = SemesterZero.activeGumDrop!
            let now = getCurrentBlock().timestamp
            return now >= drop.startTime && now <= drop.endTime
          }
        `
      });
      
      console.log('📦 GumDrop active status:', isActive);
      
      if (isActive) {
        setHalloweenDropActive(true);
        
        // Get drop details for time remaining
        const dropInfo = await fcl.query({
          cadence: `
            import SemesterZero from 0x807c3d470888cc48
            
            access(all) fun main(): {String: AnyStruct}? {
              if SemesterZero.activeGumDrop == nil {
                return nil
              }
              
              let drop = SemesterZero.activeGumDrop!
              let now = getCurrentBlock().timestamp
              return {
                "startTime": drop.startTime,
                "endTime": drop.endTime,
                "timeRemaining": drop.endTime > now ? drop.endTime - now : 0.0
              }
            }
          `
        });
        
        if (dropInfo) {
          const timeRemaining = dropInfo.timeRemaining || 0;
          setHalloweenTimeLeft(`${Math.floor(timeRemaining / 3600)}h ${Math.floor((timeRemaining % 3600) / 60)}m`);
        }
        
        // Check if user is eligible (not already claimed on-chain)
        // NOTE: We skip the blockchain eligibility check because we want EVERYONE to be eligible
        // The contract's isEligibleForGumDrop checks an allowlist, but we're opening this to all
        let isEligible = true; // Everyone is eligible!
        
        console.log('✅ User eligible (open to all):', isEligible);
        setHalloweenClaimed(false); // Never mark as claimed based on blockchain
        
        // Get Flunk count (mock for now)
        const flunkResponse = await fetch(getApiUrl(`/api/get-flunk-count?address=${normalizedAddress}`));
        const flunkData = await flunkResponse.json();
        console.log('🎨 Flunk count:', flunkData);
        setFlunkCount(flunkData.flunkCount || 0);
        console.log('📊 Final state - active:', true, 'claimed:', !isEligible, 'flunkCount:', flunkData.flunkCount);
        return;
      }
      
      // If no active drop, disable button
      console.log('❌ No active GumDrop found on blockchain');
      setHalloweenDropActive(false);
      
    } catch (error) {
      console.error('❌ Error checking Halloween drop:', error);
      // Fallback to showing inactive if blockchain query fails
      setHalloweenDropActive(false);
    }
  };

  // Load real gum tracking data
  const loadGumTrackingData = async () => {
    if (!normalizedAddress) {
      console.log('🔍 LockerSystem: No wallet address, skipping tracking data load');
      return;
    }
    
    console.log('🔍 LockerSystem: Loading GUM tracking data for:', normalizedAddress.slice(0, 8) + '...');
    
    try {
      // Get recent transactions to calculate today's earnings
      const transactions = await getUserGumTransactions(normalizedAddress, 50, 0);
      console.log('📊 LockerSystem: Retrieved', transactions.length, 'transactions');
      
      // Calculate today's earnings
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEarnings = transactions
        .filter(tx => {
          const isEarned = tx.transaction_type === 'earned';
          const isToday = new Date(tx.created_at) >= todayStart;
          if (isEarned && isToday) {
            console.log('📈 Today transaction:', tx.source, tx.amount, 'GUM');
          }
          return isEarned && isToday;
        })
        .reduce((total, tx) => total + tx.amount, 0);
      
      console.log('💰 LockerSystem: Today total earnings:', todayEarnings, 'GUM');
      setTodayGum(todayEarnings);
      
      // Calculate streak (consecutive days with daily login)
      const dailyLoginTransactions = transactions
        .filter(tx => 
          tx.transaction_type === 'earned' && 
          tx.source === 'daily_login'
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      console.log('🔥 LockerSystem: Daily login transactions found:', dailyLoginTransactions.length);
      
      // Calculate consecutive days
      let streak = 0;
      if (dailyLoginTransactions.length > 0) {
        const today = new Date();
        let checkDate = new Date(today);
        
        // Check if user claimed today, if not start from yesterday
        const latestTransaction = dailyLoginTransactions[0];
        const latestDate = new Date(latestTransaction.created_at);
        const isToday = latestDate.toDateString() === today.toDateString();
        
        console.log('📅 LockerSystem: Latest daily login date:', latestDate.toDateString());
        console.log('📅 LockerSystem: Today date:', today.toDateString());
        console.log('📅 LockerSystem: Is today?', isToday);
        
        if (!isToday) {
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          streak = 1; // Count today
          checkDate.setDate(checkDate.getDate() - 1);
        }
        
        // Check backwards for consecutive days
        for (const transaction of dailyLoginTransactions.slice(isToday ? 1 : 0)) {
          const transactionDate = new Date(transaction.created_at);
          if (transactionDate.toDateString() === checkDate.toDateString()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
      
      console.log('🎯 LockerSystem: Calculated streak:', streak, 'days');
      setStreak(streak);
      
    } catch (error) {
      console.error('❌ LockerSystem: Error loading gum tracking data:', error);
      // Use stats from GumContext if available
      if (stats) {
        console.log('🔄 LockerSystem: Using fallback from GumContext stats');
        setTodayGum(15); // Default daily login amount if no transactions today
        setStreak(1); // Default streak if cannot calculate
      } else {
        console.log('⚠️ LockerSystem: No stats available, setting to 0');
        setTodayGum(0);
        setStreak(0);
      }
    }
  };

  const handleCreateProfile = async () => {
    console.log('🚀 NEW SYSTEM: handleCreateProfile called - Checking for existing profile first!');
    
    if (!normalizedAddress) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      console.log('🚀 NEW SYSTEM: Calling assignLocker...');
      const result = await assignLocker();
      console.log('🚀 NEW SYSTEM: assignLocker result:', result);
      
      if (result.success) {
        alert(`🎉 SUCCESS! ${result.message}\n\nYour locker is now ready to use!\n\n✨ Your profile name is displayed in your locker!`);
        
        // Small delay to ensure database update is complete
        setTimeout(async () => {
          console.log('🔄 Refreshing locker info after assignment...');
          await refetch();
          
          // Force a complete component re-render by updating a state
          setCurrentSection(1); // Start at top
        }, 1000);
      }
    } catch (error) {
      console.error('❌ Failed to assign locker:', error);
      console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
      
      // Check if this is a network/fetch error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        alert(`🌐 NETWORK ERROR\n\nCouldn't connect to the server. This might be a CORS or network issue.\n\n📱 On mobile: Make sure you have internet connection\n🌐 On web: Try refreshing the page\n\nError: ${error.message}`);
      }
      // Check if this is the "no profile" error
      else if (error instanceof Error && error.message.includes('create your profile first')) {
        alert(`🎯 CREATE YOUR CHARACTER FIRST!\n\n${error.message}\n\n➡️ Please go through the character creation process in the main app to set up your username, then return here to get your locker assigned.`);
      } else if (error instanceof Error && error.message.includes('character profile first')) {
        alert(`🎯 COMPLETE YOUR PROFILE!\n\n${error.message}\n\n➡️ Your profile needs a proper username to get a locker assigned.`);
      } else {
        alert(`❌ Failed to assign locker: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support.`);
      }
    }
  };

  // Simple smooth scroll to specific section (DISABLED)
  const scrollToSection = (section: 1 | 2 | 3) => {
    // Scroll functionality disabled - no longer scrolls to sections
    console.log(`Scroll to section ${section} disabled`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Keyboard navigation disabled for now
    console.log('Keyboard navigation disabled');
  };

  return (
    <DraggableResizeableWindow
      headerTitle="My Locker"
      windowsId={WINDOW_IDS.USER_PROFILE}
      onClose={() => closeWindow(WINDOW_IDS.USER_PROFILE)}
      initialWidth="min(750px, 95vw)"
      initialHeight="90%"
      resizable={true}
    >
      <style>{`
        @keyframes gumEarnings {
          0% { opacity: 0; transform: translateX(-50%) scale(0.5) translateY(0); }
          50% { opacity: 1; transform: translateX(-50%) scale(1.2) translateY(-20px); }
          100% { opacity: 0; transform: translateX(-50%) scale(0.8) translateY(-40px); }
        }
        
        @keyframes lockerGlow {
          0% { box-shadow: 0 0 20px rgba(40, 167, 69, 0.3); }
          50% { box-shadow: 0 0 40px rgba(40, 167, 69, 0.6), 0 0 80px rgba(40, 167, 69, 0.3); }
          100% { box-shadow: 0 0 20px rgba(40, 167, 69, 0.3); }
        }
        
        @keyframes jacketSway {
          0% { transform: rotate(-2deg); }
          50% { transform: rotate(2deg); }
          100% { transform: rotate(-2deg); }
        }
        
        @keyframes scrollIndicator {
          0% { opacity: 1; transform: translateY(0px); }
          50% { opacity: 0.5; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0px); }
        }
        
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .locker-section {
          animation: fadeInUp 1s ease-out;
        }
        
        .jacket-container:hover {
          animation: jacketSway 2s ease-in-out infinite;
        }
        
        .scroll-indicator {
          animation: scrollIndicator 2s ease-in-out infinite;
        }
        
        .progress-bar {
          transition: width 0.1s ease-out;
          background: linear-gradient(90deg, #40a9ff, #1890ff, #096dd9);
        }
        
        /* 8-bit Pixel Locker Styles */
        .pixel-locker {
          font-family: 'Courier New', monospace;
          image-rendering: pixelated;
          image-rendering: -moz-crisp-edges;
          image-rendering: crisp-edges;
        }
        
        @keyframes pixelGlow {
          0% { box-shadow: 0 0 10px #00ffff, inset 0 0 10px rgba(0, 255, 255, 0.2); }
          50% { box-shadow: 0 0 20px #ff00ff, inset 0 0 20px rgba(255, 0, 255, 0.3); }
          100% { box-shadow: 0 0 10px #00ffff, inset 0 0 10px rgba(0, 255, 255, 0.2); }
        }
        
        .pixel-nameplate {
          animation: pixelGlow 3s ease-in-out infinite;
        }
        
        /* Nintendo-Style Animations */
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes titlePulse {
          0%, 100% { 
            transform: scale(1); 
            text-shadow: 4px 4px 0px #ff0000, -2px -2px 0px #0000ff, 0 0 20px #ffff00;
          }
          50% { 
            transform: scale(1.05); 
            text-shadow: 6px 6px 0px #ff0000, -3px -3px 0px #0000ff, 0 0 30px #ffff00, 0 0 40px #ff0000;
          }
        }
        
        @keyframes levelFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes powerUp {
          0% { transform: scale(1) skew(0deg); }
          20% { transform: scale(1.05) skew(2deg); }
          40% { transform: scale(1.1) skew(-2deg); }
          60% { transform: scale(1.05) skew(1deg); }
          80% { transform: scale(1.02) skew(-1deg); }
          100% { transform: scale(1) skew(0deg); }
        }

        /* Item Detail Modal Animations */
        @keyframes itemFloat {
          0%, 100% { 
            transform: translateY(0px) translateX(0px); 
          }
          25% { 
            transform: translateY(-8px) translateX(4px); 
          }
          50% { 
            transform: translateY(0px) translateX(8px); 
          }
          75% { 
            transform: translateY(-8px) translateX(4px); 
          }
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: `
          radial-gradient(circle at 15% 20%, rgba(255, 107, 107, 0.08) 0%, transparent 3%),
          radial-gradient(circle at 85% 40%, rgba(78, 205, 196, 0.06) 0%, transparent 2.5%),
          radial-gradient(circle at 35% 60%, rgba(255, 215, 0, 0.07) 0%, transparent 3%),
          radial-gradient(circle at 75% 15%, rgba(255, 20, 147, 0.06) 0%, transparent 2.5%),
          radial-gradient(circle at 25% 85%, rgba(0, 206, 209, 0.08) 0%, transparent 3%),
          radial-gradient(circle at 90% 75%, rgba(255, 234, 167, 0.05) 0%, transparent 2%),
          radial-gradient(circle at 50% 30%, rgba(152, 216, 232, 0.07) 0%, transparent 2.5%),
          radial-gradient(circle at 65% 90%, rgba(150, 206, 180, 0.06) 0%, transparent 2.5%),
          repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(255, 107, 107, 0.03) 60px, rgba(255, 107, 107, 0.03) 61px, transparent 61px, transparent 120px),
          repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(78, 205, 196, 0.03) 60px, rgba(78, 205, 196, 0.03) 61px, transparent 61px, transparent 120px),
          repeating-linear-gradient(90deg, transparent, transparent 100px, rgba(255, 215, 0, 0.02) 100px, rgba(255, 215, 0, 0.02) 101px),
          repeating-linear-gradient(0deg, transparent, transparent 100px, rgba(255, 20, 147, 0.02) 100px, rgba(255, 20, 147, 0.02) 101px),
          linear-gradient(135deg, transparent 25%, rgba(138, 43, 226, 0.04) 25%, rgba(138, 43, 226, 0.04) 50%, transparent 50%, transparent 75%, rgba(138, 43, 226, 0.04) 75%),
          linear-gradient(45deg, transparent 25%, rgba(255, 140, 0, 0.03) 25%, rgba(255, 140, 0, 0.03) 50%, transparent 50%, transparent 75%, rgba(255, 140, 0, 0.03) 75%),
          #0a0a0a
        `,
        backgroundSize: '400px 400px, 500px 500px, 350px 350px, 450px 450px, 380px 380px, 420px 420px, 360px 360px, 480px 480px, 120px 120px, 120px 120px, 100% 100%, 100% 100%, 80px 80px, 80px 80px, 100% 100%',
        backgroundPosition: '0 0, 60px 60px, 30px 30px, 80px 80px, 40px 40px, 70px 70px, 20px 20px, 50px 50px, 0 0, 0 0, 0 0, 0 0, 0 0, 40px 40px, 0 0',
        backgroundColor: '#0a0a0a',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      >
        {/* Wallet Status Bar - Pixel style, positioned at top */}
        {effectivelyConnected && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: '#1a1a2e',
            padding: '4px 8px',
            border: '2px solid #333',
            borderRadius: '0px',
            zIndex: 1001,
            fontSize: '10px',
            color: '#00ff00',
            fontFamily: '"Press Start 2P", w95fa, "Courier New", monospace',
            boxShadow: '2px 2px 0px #000, inset 1px 1px 0px #444'
          }}>
            {/* Green status pixel */}
            <div style={{
              width: '8px',
              height: '8px',
              background: '#00ff00',
              border: '1px solid #00aa00',
              boxShadow: '0 0 4px #00ff00',
            }} />
            <span style={{ fontSize: '8px', textShadow: '0 0 2px #00ff00' }}>
              {normalizedAddress?.slice(0, 6)}...{normalizedAddress?.slice(-4)}
            </span>
            <button
              onClick={async () => {
                if (confirm('Disconnect wallet?')) {
                  await disconnect();
                  closeWindow(WINDOW_IDS.USER_PROFILE);
                }
              }}
              style={{
                background: '#aa0000',
                color: 'white',
                border: '2px solid #660000',
                padding: '2px 6px',
                fontSize: '8px',
                cursor: 'pointer',
                fontFamily: '"Press Start 2P", w95fa, "Courier New", monospace',
                boxShadow: '1px 1px 0px #000',
                lineHeight: 1
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#ff4444'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#aa0000'}
              title="Disconnect wallet"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 1000
          }}>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>🔄 Loading locker info...</div>
            <div style={{ fontSize: '12px', opacity: 0.7 }}>Checking Supabase database</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(220, 53, 69, 0.9)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            zIndex: 1000
          }}>
            <div style={{ fontSize: '16px', marginBottom: '10px' }}>❌ Error loading locker</div>
            <div style={{ fontSize: '12px' }}>{error}</div>
          </div>
        )}

        {/* Main Content */}
        {!loading && !error && (
          <>
            {/* No Wallet Connected */}
            {!effectivelyConnected && (
              <div style={{
                textAlign: 'center',
                maxWidth: '400px'
              }}>
                {/* Retro NES styled warning box */}
                <div style={{
                  background: 'linear-gradient(45deg, #1e1e1e, #2d2d30, #1e1e1e)',
                  border: '3px solid #FFD700',
                  padding: '20px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  position: 'relative',
                  boxShadow: '0 0 20px rgba(255, 215, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 6px 0 #8B7500'
                }}>
                  {/* Retro scanlines */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'repeating-linear-gradient(0deg, rgba(255, 215, 0, 0.05) 0px, rgba(255, 215, 0, 0.05) 1px, transparent 1px, transparent 2px)',
                    pointerEvents: 'none',
                    borderRadius: '4px'
                  }} />
                  
                  <div style={{ 
                    fontSize: '32px', 
                    marginBottom: '12px',
                    filter: 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))'
                  }}>🔐</div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: 'bold',
                    color: '#FFD700',
                    textShadow: '0 0 10px rgba(255, 215, 0, 0.7), 2px 2px 0px #000',
                    fontFamily: "'Press Start 2P', monospace",
                    marginBottom: '10px',
                    letterSpacing: '1px',
                    lineHeight: '1.6'
                  }}>
                    CONNECT YOUR WALLET
                  </div>
                  <div style={{ 
                    fontSize: '10px', 
                    marginTop: '8px',
                    color: '#00ffff',
                    textShadow: '0 0 5px rgba(0, 255, 255, 0.5)',
                    fontFamily: "'Press Start 2P', monospace",
                    lineHeight: '1.6'
                  }}>
                    ACCESS THE NEW AUTOMATIC LOCKER SYSTEM
                  </div>
                </div>

                {/* Mobile-specific wallet guidance */}
                {isMobileDevice() && (
                  <MobileWalletHelper 
                    showDebugInfo={false}
                    onWalletSelected={(walletType) => {
                      console.log('Selected mobile wallet:', walletType);
                    }}
                  />
                )}
                
                <UnifiedConnectButton>
                  <button style={{
                    background: 'linear-gradient(180deg, #00ffff 0%, #0088ff 100%)',
                    color: '#000',
                    border: '3px solid #fff',
                    padding: '14px 28px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontFamily: "'Press Start 2P', monospace",
                    boxShadow: '0 6px 0 #004488, 0 0 20px rgba(0, 255, 255, 0.5)',
                    textShadow: '1px 1px 0px rgba(255, 255, 255, 0.5)',
                    transition: 'all 0.1s',
                    letterSpacing: '1px'
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'translateY(3px)';
                    e.currentTarget.style.boxShadow = '0 3px 0 #004488, 0 0 20px rgba(0, 255, 255, 0.5)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 0 #004488, 0 0 20px rgba(0, 255, 255, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 0 #004488, 0 0 20px rgba(0, 255, 255, 0.5)';
                  }}
                  >
                    🔗 CONNECT WALLET
                  </button>
                </UnifiedConnectButton>
              </div>
            )}

            {/* Wallet Connected - Show Locker System */}
            {effectivelyConnected && (
              <>
                {/* Already Has Locker */}
                {effectiveLockerInfo?.locker_number && (
                  <div 
                    ref={scrollContainerRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      overflowY: 'auto',
                      scrollBehavior: 'smooth',
                      position: 'relative'
                    }}
                  >
                    {/* Scrolling Progress Bar */}
                    <div style={{
                      position: 'fixed',
                      top: '0',
                      left: '0',
                      right: '0',
                      height: '4px',
                      background: 'rgba(255,255,255,0.2)',
                      zIndex: 1000
                    }}>
                      <div 
                        className="progress-bar"
                        style={{
                          height: '100%',
                          width: `${(currentSection - 1) * 50}%`,
                          borderRadius: '0 2px 2px 0'
                        }}
                      />
                    </div>

                    {/* Navigation Controls */}
                    <div style={{
                      position: 'fixed',
                      bottom: '100px',
                      right: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      zIndex: 1000
                    }}>
                      {/* Section Navigation - DISABLED */}
                      {/* Navigation buttons removed to disable scrolling
                      {[1, 2, 3].map((section) => (
                        <button
                          key={section}
                          onClick={() => scrollToSection(section as 1 | 2 | 3)}
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            border: 'none',
                            background: currentSection === section 
                              ? 'linear-gradient(145deg, #40a9ff, #1890ff)'
                              : 'rgba(255,255,255,0.2)',
                            color: currentSection === section ? 'white' : '#666',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            boxShadow: currentSection === section 
                              ? '0 4px 15px rgba(64, 169, 255, 0.4)'
                              : '0 2px 8px rgba(0,0,0,0.2)'
                          }}
                        >
                          {section === 1 ? '🏠' : section === 2 ? '👕' : '🍬'}
                        </button>
                      ))}
                      */}
                    </div>
                    {/* Section 1: Top - My Locker Front Image */}
                    <div className="locker-section" style={{
                      height: '80vh',
                      minHeight: '400px',
                      backgroundImage: 'url(/images/my-locker-front.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      // Fallback if image doesn't load
                      backgroundColor: '#4a90e2',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      padding: '20px'
                    }}>
                      {/* Metallic Nameplate - positioned for middle locker */}
                      <div style={{
                        position: 'absolute',
                        top: '26%', // Moved down from 18%
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'linear-gradient(180deg, #e8e8e8 0%, #b8b8b8 45%, #a0a0a0 55%, #c8c8c8 100%)',
                        color: '#000000',
                        padding: '8px 14px', // Slightly smaller padding
                        borderRadius: '3px',
                        textAlign: 'center',
                        border: '1px solid #8a8a8a',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
                        width: 'clamp(110px, 16%, 160px)', // Slightly smaller
                        letterSpacing: '0.5px',
                        fontFamily: 'Arial, sans-serif',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          fontSize: (effectiveLockerInfo.username?.length || 0) > 10 
                            ? 'clamp(9px, 1.2vw, 12px)' 
                            : (effectiveLockerInfo.username?.length || 0) > 7 
                              ? 'clamp(10px, 1.4vw, 14px)' 
                              : 'clamp(12px, 1.6vw, 16px)',
                          fontWeight: 'bold',
                          marginBottom: '3px',
                          textTransform: 'uppercase',
                          letterSpacing: (effectiveLockerInfo.username?.length || 0) > 10 ? '0.3px' : '0.8px',
                          color: '#000000',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {effectiveLockerInfo.username || 'STUDENT'}
                        </div>
                        <div style={{
                          fontSize: 'clamp(8px, 1vw, 10px)', // Smaller locker number
                          fontWeight: '600',
                          color: '#1a1a1a',
                          letterSpacing: '0.5px'
                        }}>
                          LOCKER #{effectiveLockerInfo.locker_number}
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Middle (Letter Jacket with Enhanced Effects) - HIDDEN FOR NOW */}
                    {false && (
                    <div className="locker-section" style={{
                      height: 'max(100vh, 800px)',
                      minHeight: '100vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)',
                      position: 'relative'
                    }}>
                      <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        color: 'white',
                        padding: 'min(40px, 5vw)',
                        borderRadius: '20px',
                        textAlign: 'center',
                        width: 'min(95%, 500px)',
                        maxWidth: '100%',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '20px' }}>👕</div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                          Jacket Selection
                        </div>
                        
                        {/* Jacket Selection Interface */}
                        <div style={{
                          position: 'relative',
                          width: '100%',
                          maxWidth: '1000px',
                          margin: '20px auto',
                          display: 'flex',
                          flexDirection: isMobileDevice() ? 'column' : 'row',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: isMobileDevice() ? '20px' : '0'
                        }}>
                          
                          {/* Mobile: Top Arrow */}
                          {isMobileDevice() && (
                            <button
                              onClick={() => switchJacket('left')}
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: '2px solid #4299e1',
                                borderRadius: '50%',
                                width: '60px',
                                height: '60px',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                zIndex: 10,
                                touchAction: 'manipulation'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(66, 153, 225, 0.5)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              ↑
                            </button>
                          )}
                          
                          {/* Desktop: Left Arrow */}
                          {!isMobileDevice() && (
                            <button
                              onClick={() => switchJacket('left')}
                              style={{
                                position: 'absolute',
                                left: '10px',
                                background: 'rgba(255,255,255,0.2)',
                                border: '2px solid #4299e1',
                                borderRadius: '50%',
                                width: '60px',
                                height: '60px',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                zIndex: 10,
                                touchAction: 'manipulation'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(66, 153, 225, 0.5)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              ←
                            </button>
                          )}

                          {/* Jacket Display */}
                          <div style={{
                            position: 'relative',
                            width: 'min(800px, 95vw)',
                            height: 'min(960px, 80vh)',
                            margin: '0 10px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            
                            {/* Jacket Image or Placeholder */}
                            <div style={{
                              width: 'min(700px, 90vw)',
                              height: 'min(840px, 60vh)',
                              minHeight: '300px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                              transform: currentSection === 2 ? 'scale(1.05)' : 'scale(1)',
                              backgroundImage: `url('${jacketOptions[selectedJacket].image}')`,
                              backgroundSize: 'contain',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat'
                            }}>
                            </div>

                            {/* Jacket Name & Description */}
                            <div style={{
                              marginTop: '15px',
                              textAlign: 'center'
                            }}>
                              <div style={{ 
                                fontSize: '14px', 
                                fontWeight: 'bold', 
                                color: '#4299e1',
                                marginBottom: '4px'
                              }}>
                                {jacketOptions[selectedJacket].name}
                              </div>
                              <div style={{ 
                                fontSize: '11px', 
                                opacity: 0.8,
                                color: '#ccc'
                              }}>
                                {jacketOptions[selectedJacket].description}
                              </div>
                            </div>
                          </div>

                          {/* Desktop: Right Arrow */}
                          {!isMobileDevice() && (
                            <button
                              onClick={() => switchJacket('right')}
                              style={{
                                position: 'absolute',
                                right: '10px',
                                background: 'rgba(255,255,255,0.2)',
                                border: '2px solid #4299e1',
                                borderRadius: '50%',
                                width: '60px',
                                height: '60px',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                zIndex: 10,
                                touchAction: 'manipulation'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(66, 153, 225, 0.5)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              →
                            </button>
                          )}
                          
                          {/* Mobile: Bottom Arrow */}
                          {isMobileDevice() && (
                            <button
                              onClick={() => switchJacket('right')}
                              style={{
                                background: 'rgba(255,255,255,0.2)',
                                border: '2px solid #4299e1',
                                borderRadius: '50%',
                                width: '60px',
                                height: '60px',
                                color: 'white',
                                fontSize: '24px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s ease',
                                zIndex: 10,
                                touchAction: 'manipulation'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(66, 153, 225, 0.5)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              ↓
                            </button>
                          )}

                          {/* Selection Indicator Dots */}
                          <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: '8px'
                          }}>
                            {jacketOptions.map((_, index) => (
                              <div
                                key={index}
                                onClick={() => setSelectedJacket(index)}
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  background: selectedJacket === index ? '#4299e1' : 'rgba(255,255,255,0.4)',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  boxShadow: selectedJacket === index ? '0 0 8px rgba(66, 153, 225, 0.6)' : 'none'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div style={{ fontSize: '14px', opacity: 0.8, lineHeight: '1.5' }}>
                          Your Flunks varsity jacket selection hangs here proudly.
                          <br />
                          <em style={{ color: '#ffd700', fontSize: '13px' }}>
                            A symbol of your community membership
                          </em>
                        </div>
                        
                        {/* Continue to storage area scroll indicator removed */}
                        {/*
                        <div className="scroll-indicator" style={{ 
                          fontSize: '12px', 
                          opacity: 0.6, 
                          marginTop: '15px',
                          cursor: 'pointer'
                        }}
                        onClick={() => scrollToSection(3)}
                        >
                          ⬇️ Continue to storage area
                        </div>
                        */}
                      </div>
                    </div>
                    )}

                    {/* Section 3: Bottom - GUM MANAGEMENT CENTER */}
                    <div className="locker-section" style={{
                      height: 'auto',
                      minHeight: '100vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(180deg, #020b1d 0%, #041c3f 35%, #020b1d 100%)',
                      position: 'relative',
                      padding: '60px 20px 20px'
                    }}>
                      {/* Animated Background Stars */}
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: `
                          radial-gradient(2px 2px at 20px 30px, #fff, transparent),
                          radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                          radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                          radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.7), transparent),
                          radial-gradient(2px 2px at 160px 30px, #fff, transparent)
                        `,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '200px 100px',
                        animation: 'starTwinkle 4s ease-in-out infinite',
                        opacity: 0.6
                      }} />
                      
                      <div style={{
                        background: 'rgba(6, 20, 56, 0.92)',
                        border: '2px solid rgba(255, 255, 255, 0.28)',
                        borderRadius: '26px',
                        padding: '36px 32px',
                        maxWidth: 'min(92vw, 760px)',
                        width: '100%',
                        boxShadow: '0 24px 60px rgba(3, 12, 34, 0.65)',
                        position: 'relative',
                        backdropFilter: 'blur(14px)'
                      }}>
                        {/* 16-bit Game UI Header */}
                        <div style={{ 
                          fontSize: '38px', 
                          marginBottom: '8px', 
                          textAlign: 'center',
                          filter: 'drop-shadow(0 0 8px rgba(255, 105, 180, 0.6))',
                          animation: 'float 3s ease-in-out infinite'
                        }}>
                          🍬
                        </div>
                        <div style={{ 
                          fontSize: '28px', 
                          fontWeight: 'bold', 
                          marginBottom: '24px', 
                          color: '#ff69b4', 
                          textAlign: 'center',
                          fontFamily: '"Press Start 2P", "Courier New", monospace',
                          textShadow: '3px 3px 0px #000, -1px -1px 0px rgba(255,105,180,0.5)',
                          letterSpacing: '2px',
                          textTransform: 'uppercase',
                          lineHeight: '1.6'
                        }}>
                          <span style={{ fontSize: '24px' }}>Bubble Bank</span>
                        </div>
                        
                        {/* SPECIAL ITEMS SECTION - 8-bit Retro Style */}
                        <div style={{
                          background: 'rgba(0, 0, 51, 0.9)',
                          border: '4px solid #ff6600',
                          borderRadius: 0,
                          padding: '16px',
                          marginBottom: '24px',
                          position: 'relative',
                          boxShadow: `
                            0 0 0 2px #0066cc,
                            0 0 0 6px #ff6600,
                            0 6px 0 6px #000,
                            inset 0 0 20px rgba(255, 102, 0, 0.2)
                          `,
                          imageRendering: 'pixelated'
                        }}>
                          {/* Header */}
                          <div style={{
                            fontFamily: '"Press Start 2P", "Courier New", monospace',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#ffcc00',
                            textTransform: 'uppercase',
                            textShadow: '2px 2px 0px #000, 0 0 10px rgba(255, 204, 0, 0.6)',
                            marginBottom: '16px',
                            textAlign: 'center',
                            letterSpacing: '1px'
                          }}>
                            ⭐ Special Items ⭐
                          </div>
                          
                          {/* Items Grid */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                            gap: '12px',
                            minHeight: '100px',
                            background: '#001166',
                            border: '2px solid #0066cc',
                            padding: '12px',
                            borderRadius: 0,
                            boxShadow: 'inset 2px 2px 0 rgba(0, 0, 0, 0.5)'
                          }}>
                            {/* Room 7 Key */}
                            {hasRoom7Key && (
                              <div style={{
                                background: 'linear-gradient(180deg, #ff8833 0%, #ff6600 100%)',
                                border: '3px solid #ffcc00',
                                borderRadius: 0,
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: `
                                  0 4px 0 #cc5200,
                                  0 0 10px rgba(255, 204, 0, 0.5)
                                `,
                                position: 'relative'
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = `
                                  0 6px 0 #cc5200,
                                  0 0 20px rgba(255, 204, 0, 0.8)
                                `;
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = `
                                  0 4px 0 #cc5200,
                                  0 0 10px rgba(255, 204, 0, 0.5)
                                `;
                              }}
                              title="Room 7 Key - Return after dark to access Room 7"
                              onClick={() => setSelectedItem('room7Key')}
                              >
                                <img 
                                  src="/images/locations/paradise motel/key.png"
                                  alt="Room 7 Key"
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    objectFit: 'contain',
                                    imageRendering: 'pixelated',
                                    filter: 'drop-shadow(0 0 8px rgba(255, 204, 0, 0.8))'
                                  }}
                                />
                                <div style={{
                                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                                  fontSize: '7px',
                                  color: '#fff',
                                  textShadow: '1px 1px 0 #000',
                                  marginTop: '4px',
                                  textAlign: 'center',
                                  lineHeight: '1.4'
                                }}>
                                  Room 7<br/>Key
                                </div>
                              </div>
                            )}
                            
                            {/* Mystery box when no items - shows there's something to find! */}
                            {!hasRoom7Key && (
                              <div style={{
                                background: 'linear-gradient(180deg, #666 0%, #333 100%)',
                                border: '3px solid #999',
                                borderRadius: 0,
                                padding: '8px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'default',
                                boxShadow: `
                                  0 4px 0 #222,
                                  0 0 10px rgba(0, 0, 0, 0.5),
                                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                                `,
                                position: 'relative',
                                minHeight: '90px',
                                opacity: 0.6
                              }}
                              title="Undiscovered item - Explore the world to find it!"
                              >
                                {/* Mystery Question Mark */}
                                <div style={{
                                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                                  fontSize: '48px',
                                  color: '#fff',
                                  textShadow: '3px 3px 0 #000, 0 0 10px rgba(255, 255, 255, 0.3)',
                                  lineHeight: '1',
                                  filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))'
                                }}>
                                  ?
                                </div>
                                <div style={{
                                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                                  fontSize: '7px',
                                  color: '#ccc',
                                  textShadow: '1px 1px 0 #000',
                                  marginTop: '8px',
                                  textAlign: 'center',
                                  lineHeight: '1.4'
                                }}>
                                  ???<br/>???
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Current Balance Display - Retro Game Stats Box */}
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.75)',
                          border: '4px solid #ff69b4',
                          borderRadius: '8px',
                          padding: '20px',
                          marginBottom: '24px',
                          position: 'relative',
                          boxShadow: 'inset 0 0 20px rgba(255, 105, 180, 0.3), 0 8px 16px rgba(0, 0, 0, 0.4)',
                          imageRendering: 'pixelated'
                        }}>
                          {/* Retro corner decorations */}
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            width: '12px',
                            height: '12px',
                            background: '#ff69b4',
                            boxShadow: '0 0 8px #ff69b4'
                          }} />
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            width: '12px',
                            height: '12px',
                            background: '#ff69b4',
                            boxShadow: '0 0 8px #ff69b4'
                          }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '6px',
                            width: '12px',
                            height: '12px',
                            background: '#ff69b4',
                            boxShadow: '0 0 8px #ff69b4'
                          }} />
                          <div style={{
                            position: 'absolute',
                            bottom: '6px',
                            right: '6px',
                            width: '12px',
                            height: '12px',
                            background: '#ff69b4',
                            boxShadow: '0 0 8px #ff69b4'
                          }} />
                          
                          <div style={{
                            fontFamily: '"Courier New", monospace',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            color: '#FFD700',
                            textShadow: '2px 2px 0px #000, 0 0 10px #FFD700',
                            marginBottom: '8px',
                            letterSpacing: '2px',
                            textAlign: 'center'
                          }}>
                            {gumBalance.toLocaleString()} GUM
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            opacity: 0.9,
                            color: '#00ff00',
                            fontFamily: '"Courier New", monospace',
                            textShadow: '1px 1px 0px #000',
                            textAlign: 'center'
                          }}>
                            💰 YOUR CURRENT BALANCE
                          </div>
                          
                          {/* Animated scanline effect */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '100%',
                            background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                            pointerEvents: 'none'
                          }} />
                        </div>

                        {/* Halloween GumDrop - Open to EVERYONE! */}
                        {halloweenDropActive && !halloweenClaimed && (
                          <div style={{
                            background: 'linear-gradient(145deg, #ff6b00, #ff4500)',
                            border: '4px solid #FFD700',
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0 8px 24px rgba(255, 107, 0, 0.6), inset 0 -6px 0 rgba(0,0,0,0.3)',
                            marginTop: '24px'
                          }}>
                            <div style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              fontFamily: '"Press Start 2P", "Courier New", monospace',
                              color: '#FFD700',
                              textShadow: '3px 3px 0px #000',
                              textAlign: 'center',
                              marginBottom: '12px'
                            }}>
                              🎃 HALLOWEEN GUMDROP
                            </div>
                            
                            <div style={{
                              fontSize: '12px',
                              color: '#FFE4B5',
                              textAlign: 'center',
                              marginBottom: '16px',
                              lineHeight: '1.6'
                            }}>
                              Special 72-hour event!<br/>
                              Claim 100 GUM - Halloween Special! 🎃
                            </div>
                            
                            <div style={{
                              background: 'rgba(0, 0, 0, 0.3)',
                              borderRadius: '8px',
                              padding: '12px',
                              marginBottom: '16px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontSize: '13px', color: '#FFD700', marginBottom: '6px' }}>
                                Your Flunks: <strong>{flunkCount}</strong>
                              </div>
                              <div style={{ fontSize: '16px', color: '#00ff88', fontWeight: 'bold' }}>
                                Reward: 100 GUM
                              </div>
                              <div style={{ fontSize: '11px', color: '#FFE4B5', marginTop: '6px' }}>
                                ⏰ Time left: {halloweenTimeLeft}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                              <button
                                disabled={claimingHalloween}
                                style={{
                                  background: claimingHalloween
                                    ? 'linear-gradient(145deg, #555, #333)'
                                    : 'linear-gradient(145deg, #32cd32, #228b22)',
                                  color: 'white',
                                  border: '3px solid #FFD700',
                                  padding: '12px 24px',
                                  borderRadius: '8px',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                                  cursor: claimingHalloween ? 'not-allowed' : 'pointer',
                                  boxShadow: '0 4px 12px rgba(50,205,50,0.5), inset 0 -4px 0 rgba(0,0,0,0.3)',
                                  transition: 'all 0.15s ease',
                                  textShadow: '2px 2px 0px #000',
                                  opacity: claimingHalloween ? 0.6 : 1
                                }}
                                onMouseOver={(e) => {
                                  if (!claimingHalloween) {
                                    e.currentTarget.style.transform = 'translateY(-3px)';
                                    e.currentTarget.style.boxShadow = '0 6px 18px rgba(50,205,50,0.7), inset 0 -4px 0 rgba(0,0,0,0.3)';
                                  }
                                }}
                                onMouseOut={(e) => {
                                  if (!claimingHalloween) {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(50,205,50,0.5), inset 0 -4px 0 rgba(0,0,0,0.3)';
                                  }
                                }}
                                onClick={async () => {
                                  if (claimingHalloween) return;
                                  
                                  // Check if user is authenticated with FCL
                                  if (!normalizedAddress) {
                                    alert('⚠️ Please connect your wallet first!\n\nUse Lilico or Dapper from the wallet connection menu.');
                                    return;
                                  }
                                  
                                  setClaimingHalloween(true);
                                  
                                  try {
                                    // Play bubble sound
                                    if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
                                      const anyWindow = window as any;
                                      if (!anyWindow.__bubbleClaimSound) {
                                        anyWindow.__bubbleClaimSound = new Audio('/sounds/bubble.mp3');
                                        anyWindow.__bubbleClaimSound.volume = 0.5;
                                      }
                                      const now = Date.now();
                                      if (!anyWindow.__lastBubblePlay || now - anyWindow.__lastBubblePlay > 300) {
                                        anyWindow.__bubbleClaimSound.currentTime = 0;
                                        anyWindow.__bubbleClaimSound.play().catch(() => {});
                                        anyWindow.__lastBubblePlay = now;
                                      }
                                    }
                                    
                                    // Get timezone offset
                                    const offsetMinutes = new Date().getTimezoneOffset();
                                    const timezoneOffset = Math.round(offsetMinutes / -60);
                                    
                                    // Get username from effectiveLockerInfo or use truncated address
                                    const username = effectiveLockerInfo?.username || unifiedAddress?.slice(0, 10) || 'Flunk';
                                    
                                    console.log('🎃 Claiming Halloween GumDrop...');
                                    console.log('� User timezone offset:', timezoneOffset, 'hours from UTC');
                                    
                                    // Skip blockchain transaction for now - just award GUM and save timezone
                                    // Backend will store timezone in Supabase user_profiles table
                                    
                                    // Award GUM via backend
                                    const transactionId = 'supabase-' + Date.now();
                                    
                                    // Call backend API to add GUM to Supabase
                                    const gumAmount = 100; // Halloween GumDrop: 100 GUM flat reward
                                    const response = await fetch(getApiUrl('/api/claim-halloween-gum'), {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        walletAddress: unifiedAddress,
                                        flunkCount,
                                        gumAmount,
                                        transactionId,
                                        username,
                                        timezoneOffset
                                      })
                                    });
                                    
                                    const data = await response.json();
                                    
                                    if (data.success) {
                                      alert(`🎃 Halloween GumDrop Claimed!\n\n+${gumAmount} GUM added to your account!\n\n🍬 Special Halloween Reward!\n\nTransaction: ${transactionId}`);
                                      
                                      // Refresh everything
                                      setHalloweenClaimed(true);
                                      loadGumBalance();
                                      loadGumTrackingData();
                                      refetch();
                                    } else {
                                      alert(`❌ ${data.error || 'Failed to add GUM to your account'}`);
                                    }
                                  } catch (error: any) {
                                    console.error('Error claiming Halloween GUM:', error);
                                    alert(`❌ Transaction failed: ${error.message || 'Please try again'}`);
                                  } finally {
                                    setClaimingHalloween(false);
                                  }
                                }}
                              >
                                {claimingHalloween ? '⏳ Claiming...' : '🎃 Claim 100 GUM'}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Already claimed message - HIDDEN */}
                        {false && halloweenDropActive && halloweenClaimed && (
                          <div style={{
                            background: 'rgba(102, 102, 102, 0.5)',
                            border: '3px solid #666',
                            borderRadius: '16px',
                            padding: '16px',
                            textAlign: 'center',
                            marginTop: '24px'
                          }}>
                            <div style={{
                              fontSize: '14px',
                              color: '#999',
                              fontWeight: 'bold',
                              fontFamily: '"Press Start 2P", "Courier New", monospace'
                            }}>
                              🎃 Halloween GumDrop Already Claimed
                            </div>
                            <div style={{
                              fontSize: '11px',
                              color: '#666',
                              marginTop: '8px'
                            }}>
                              You've already claimed your Halloween bonus!
                            </div>
                          </div>
                        )}

                        {/* Daily Check-in Section - Power-Up Box Style */}
                        <div style={{
                          background: 'linear-gradient(135deg, rgba(30, 60, 114, 0.8) 0%, rgba(42, 82, 152, 0.8) 100%)',
                          borderRadius: '12px',
                          marginTop: '24px',
                          padding: '18px',
                          marginBottom: '20px',
                          border: '3px solid rgba(100, 149, 237, 0.6)',
                          boxShadow: '0 4px 15px rgba(100, 149, 237, 0.3), inset 0 0 20px rgba(100, 149, 237, 0.1)',
                          position: 'relative'
                        }}>
                          {/* Top accent bar */}
                          <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '10%',
                            right: '10%',
                            height: '3px',
                            background: 'linear-gradient(90deg, transparent, #6495ED, transparent)'
                          }} />
                          
                          <div style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '10px',
                            color: '#FFD700',
                            fontFamily: '"Press Start 2P", "Courier New", monospace',
                            fontSize: '12px',
                            textShadow: '2px 2px 0px #000',
                            textAlign: 'center'
                          }}>
                            DAILY CHECK-IN
                          </div>
                          <div style={{ 
                            fontSize: '13px', 
                            marginBottom: '12px', 
                            opacity: 0.95,
                            color: '#E0E0E0',
                            textAlign: 'center'
                          }}>
                            Claim your daily gum bonus!
                          </div>
                          
                          {/* Cooldown Timer */}
                          {unifiedAddress && (
                            <div style={{ margin: '8px 0', fontSize: '14px', textAlign: 'center' }}>
                              <GumCooldownTimer
                                walletAddress={unifiedAddress}
                                source="daily_checkin"
                                onCanClaim={(canClaim) => {
                                  // Update button state based on cooldown
                                  console.log(`🎯 [LockerSystemNew] onCanClaim callback received: ${canClaim}, current canClaimDaily: ${canClaimDaily}`);
                                  setCanClaimDaily(canClaim);
                                }}
                              />
                            </div>
                          )}
                          
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <button
                            style={{
                              background: canClaimDaily ? 
                                'linear-gradient(145deg, #32cd32, #228b22)' :
                                'linear-gradient(145deg, #555, #333)',
                              color: 'white',
                              border: canClaimDaily ? '3px solid #FFD700' : '3px solid #666',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: 'bold',
                              fontFamily: '"Press Start 2P", "Courier New", monospace',
                              cursor: canClaimDaily ? 'pointer' : 'not-allowed',
                              boxShadow: canClaimDaily ? 
                                '0 4px 12px rgba(50,205,50,0.5), inset 0 -4px 0 rgba(0,0,0,0.3)' :
                                '0 2px 6px rgba(102,102,102,0.4), inset 0 -2px 0 rgba(0,0,0,0.5)',
                              transition: 'all 0.15s ease',
                              opacity: canClaimDaily ? 1 : 0.6,
                              textShadow: '2px 2px 0px #000',
                              imageRendering: 'pixelated',
                              position: 'relative'
                            }}
                            onMouseOver={(e) => {
                              if (canClaimDaily) {
                                e.currentTarget.style.transform = 'translateY(-3px)';
                                e.currentTarget.style.boxShadow = '0 6px 18px rgba(50,205,50,0.7), inset 0 -4px 0 rgba(0,0,0,0.3)';
                              }
                            }}
                            onMouseOut={(e) => {
                              if (canClaimDaily) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(50,205,50,0.5), inset 0 -4px 0 rgba(0,0,0,0.3)';
                              }
                            }}
                            disabled={!canClaimDaily}
                            onClick={async () => {
                              if (!canClaimDaily) return;

                              // Lazy init a reusable bubble sound (attach to window to persist during session)
                              try {
                                if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
                                  const anyWindow = window as any;
                                  if (!anyWindow.__bubbleClaimSound) {
                                    anyWindow.__bubbleClaimSound = new Audio('/sounds/bubble.mp3');
                                    anyWindow.__bubbleClaimSound.volume = 0.5;
                                  }
                                  // Basic rate limiting: don't spam play within 300ms
                                  const now = Date.now();
                                  if (!anyWindow.__lastBubblePlay || now - anyWindow.__lastBubblePlay > 300) {
                                    anyWindow.__bubbleClaimSound.currentTime = 0; // restart
                                    anyWindow.__bubbleClaimSound.play().catch(() => {});
                                    anyWindow.__lastBubblePlay = now;
                                  }
                                }
                              } catch (e) {
                                // Non-fatal; ignore audio errors
                              }

                              // Implement daily check-in logic using direct Supabase RPC (bypasses API route issues on mobile)
                              try {
                                console.log('🎁 Daily check-in: Using direct Supabase RPC');
                                console.log('🎁 Daily check-in: wallet =', unifiedAddress);
                                
                                const result = await awardGum(unifiedAddress || '', 'daily_checkin', {
                                  source: 'locker_checkin_button',
                                  timestamp: new Date().toISOString()
                                });
                                
                                console.log('🎁 Daily check-in result:', result);
                                
                                if (result.success && result.earned > 0) {
                                  alert(`🎉 You just got +${result.earned} GUM!\n\nCome back tomorrow for more GUM! 🍬`);
                                  // Refresh gum balance and tracking data
                                  refetch();
                                  loadGumBalance();
                                  loadGumTrackingData();
                                  // Reset button state
                                  setCanClaimDaily(false);
                                } else if (result.cooldown_remaining_minutes && result.cooldown_remaining_minutes > 0) {
                                  const hours = Math.floor(result.cooldown_remaining_minutes / 60);
                                  const minutes = Math.floor(result.cooldown_remaining_minutes % 60);
                                  alert(`ℹ️ Daily bonus already claimed! Come back in ${hours}h ${minutes}m\n\n🍬`);
                                  setCanClaimDaily(false);
                                } else {
                                  // Show the specific error from the RPC
                                  const message = result.error || 'Unable to claim daily bonus right now';
                                  alert(`ℹ️ ${message}\n\nCome back tomorrow for more GUM! 🍬`);
                                  setCanClaimDaily(false);
                                }
                              } catch (err) {
                                console.error('Daily check-in error:', err);
                                console.error('Daily check-in error details:', {
                                  name: (err as Error)?.name,
                                  message: (err as Error)?.message,
                                  stack: (err as Error)?.stack
                                });
                                alert('❌ Unable to claim daily bonus. Please try again later.');
                              }
                            }}
                          >
                            {canClaimDaily ? '✨ Claim 15 GUM' : '✅ +15 GUM Claimed! Come back tomorrow'}
                          </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 4: Nintendo-Style Level Select Screen */}
                    <div className="locker-section" style={{
                      height: 'auto',
                      minHeight: '100vh',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: 'linear-gradient(180deg, #020b1d 0%, #041c3f 35%, #020b1d 100%)',
                      position: 'relative',
                      padding: '20px 20px 40px',
                      overflow: 'visible'
                    }}>
                      
                      {/* Animated Background Stars */}
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: `
                          radial-gradient(2px 2px at 20px 30px, #fff, transparent),
                          radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                          radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                          radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.7), transparent),
                          radial-gradient(2px 2px at 160px 30px, #fff, transparent)
                        `,
                        backgroundRepeat: 'repeat',
                        backgroundSize: '200px 100px',
                        animation: 'starTwinkle 4s ease-in-out infinite'
                      }} />
                      
                      {/* Nintendo-Style Level Select Interface */}
                      <div style={{
                        background: 'rgba(6, 20, 56, 0.92)',
                        border: '2px solid rgba(255, 255, 255, 0.28)',
                        borderRadius: '26px',
                        padding: '36px 32px',
                        maxWidth: 'min(92vw, 760px)',
                        width: '100%',
                        boxShadow: '0 24px 60px rgba(3, 12, 34, 0.65)',
                        position: 'relative',
                        backdropFilter: 'blur(14px)',
                        overflow: 'visible'
                      }}>
                        {/* Main Content Container */}
                        <WeeklyObjectives />
                      </div>
                    </div>
                  </div>
                )}

                {/* No Locker Yet - Show Assignment Button */}
                {!effectiveLockerInfo?.locker_number && (
                  <div style={{
                    textAlign: 'center',
                    maxWidth: '400px'
                  }}>
                    <div style={{
                      background: 'rgba(255, 193, 7, 0.9)',
                      color: '#000',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid rgba(230, 126, 34, 0.3)',
                      marginBottom: '15px'
                    }}>
                      ⚠️ Wallet connected but no locker assigned
                      <br />
                      <span style={{ fontSize: '12px', fontStyle: 'italic' }}>
                        Wallet: {unifiedAddress?.slice(0, 12)}...
                      </span>
                    </div>
                    
                    <button
                      onClick={handleCreateProfile}
                      disabled={assigning}
                      style={{
                        background: assigning ? '#95a5a6' : '#ff0000', // BRIGHT RED TO CONFIRM NEW VERSION
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: assigning ? 'not-allowed' : 'pointer',
                        boxShadow: '0 6px 15px rgba(255,0,0,0.3)',
                        transition: 'all 0.3s ease',
                        opacity: assigning ? 0.7 : 1
                      }}
                    >
                      {assigning ? '⏳ Checking Profile...' : '🏠 GET YOUR LOCKER'}
                    </button>
                    
                    <div style={{
                      textAlign: 'center',
                      fontSize: '14px',
                      color: '#28a745',
                      fontWeight: 'bold',
                      marginTop: '15px',
                      padding: '10px',
                      background: 'rgba(40, 167, 69, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(40, 167, 69, 0.3)'
                    }}>
                      ✨ Uses your character profile name!
                      <br />
                      <span style={{ fontSize: '12px', fontWeight: 'normal' }}>
                        Create your character first, then get your locker assigned
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* RETRO 90's GUM COUNTER */}
        {unifiedAddress && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(145deg, #c0c0c0, #808080)',
            border: '3px ridge #c0c0c0',
            borderRadius: '8px',
            padding: '8px 16px',
            fontFamily: 'MS Sans Serif, sans-serif',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#000',
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            minWidth: '150px',
            justifyContent: 'center'
          }}>
            <div style={{
              background: 'linear-gradient(45deg, #ff00ff, #ff69b4)',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.3)'
            }}>
              🍬
            </div>
            <div style={{
              background: '#000',
              color: '#00ff00',
              fontFamily: 'Courier New, monospace',
              fontSize: '11px',
              padding: '2px 6px',
              border: '1px inset #c0c0c0',
              minWidth: '60px',
              textAlign: 'center',
              textShadow: '0 0 2px #00ff00'
            }}>
              {gumBalance?.toLocaleString() || '0'}
            </div>
            <span style={{ fontSize: '10px', color: '#333' }}>GUM</span>
          </div>
        )}

        {/* Item Detail Modal - Classic Video Game Style */}
        {selectedItem === 'room7Key' && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              animation: 'fadeIn 0.2s ease-in-out'
            }}
            onClick={() => setSelectedItem(null)}
          >
            <div 
              style={{
                background: '#000033',
                border: '4px solid #ff6600',
                borderRadius: 0,
                padding: '24px',
                maxWidth: '600px',
                width: '90%',
                position: 'relative',
                boxShadow: `
                  0 0 0 2px #0066cc,
                  0 0 0 6px #ff6600,
                  0 8px 0 6px #000,
                  0 12px 30px rgba(0, 0, 0, 0.9)
                `,
                imageRendering: 'pixelated'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)',
                  border: '2px solid #ff6666',
                  borderRadius: 0,
                  color: 'white',
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  fontSize: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #880000',
                  transition: 'all 0.1s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = '0 2px 0 #880000';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 0 #880000';
                }}
              >
                ✕
              </button>

              {/* Header */}
              <div style={{
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                fontSize: '10px',
                color: '#00ccff',
                textTransform: 'uppercase',
                textShadow: '2px 2px 0 #003366',
                marginBottom: '16px',
                textAlign: 'center',
                letterSpacing: '2px'
              }}>
                Paradise Motel - 'Round Back
              </div>

              {/* Main Content Area */}
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                gap: '24px',
                alignItems: 'center'
              }}>
                {/* Left: Animated Key Image */}
                <div style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#001166',
                  border: '3px solid #0066cc',
                  borderRadius: 0,
                  padding: '24px',
                  boxShadow: 'inset 2px 2px 0 rgba(0, 0, 0, 0.5)',
                  minWidth: '180px',
                  minHeight: '180px'
                }}>
                  <img 
                    src="/images/locations/paradise motel/key.png"
                    alt="Room 7 Key"
                    style={{
                      width: '120px',
                      height: '120px',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 20px rgba(255, 204, 0, 1))',
                      animation: 'itemFloat 3s ease-in-out infinite'
                    }}
                  />
                </div>

                {/* Right: Item Description */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Item Name */}
                  <div style={{
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    fontSize: '18px',
                    color: '#ffcc00',
                    textShadow: '3px 3px 0 #000, 0 0 10px rgba(255, 204, 0, 0.8)',
                    lineHeight: '1.5'
                  }}>
                    Room 7 Key
                  </div>

                  {/* Item Category */}
                  <div style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '12px',
                    color: '#ff9933',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    ★ Special Item ★
                  </div>

                  {/* Description Box */}
                  <div style={{
                    background: '#001166',
                    border: '2px solid #0066cc',
                    borderRadius: 0,
                    padding: '12px',
                    boxShadow: 'inset 2px 2px 0 rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '13px',
                      color: '#ffffff',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      A rusty brass key given to you by the maid at Paradise Motel. 
                      
                      She warned you to be careful sneaking around after dark. 
                      
                      This key grants access to Room 7 during nighttime hours.
                    </div>
                  </div>

                  {/* Usage Hint */}
                  <div style={{
                    background: 'linear-gradient(180deg, #ff8833 0%, #ff6600 100%)',
                    border: '2px solid #ffcc00',
                    borderRadius: 0,
                    padding: '10px',
                    boxShadow: '0 4px 0 #cc5200',
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    fontSize: '9px',
                    color: '#fff',
                    textShadow: '1px 1px 0 #000',
                    textAlign: 'center',
                    lineHeight: '1.6'
                  }}>
                    💡 Return to Paradise Motel<br/>after dark to use this key
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Four Thieves Underground Detail Overlay */}
        {selectedItem === 'fourThievesUnderground' && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            animation: 'fadeIn 0.3s ease-in'
          }}
          onClick={() => setSelectedItem(null)}
          >
            <div style={{
              background: 'linear-gradient(180deg, #330000 0%, #110000 100%)',
              border: '4px solid #ff3366',
              borderRadius: 0,
              padding: '24px',
              maxWidth: '600px',
              width: '100%',
              position: 'relative',
              boxShadow: `
                0 0 0 2px #660033,
                0 0 0 6px #ff3366,
                0 10px 0 6px #000,
                0 0 40px rgba(255, 51, 102, 0.6),
                inset 0 0 30px rgba(255, 51, 102, 0.1)
              `,
              imageRendering: 'pixelated'
            }}
            onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedItem(null)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'linear-gradient(180deg, #ff4444 0%, #cc0000 100%)',
                  border: '2px solid #ff6666',
                  borderRadius: 0,
                  color: 'white',
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  fontSize: '12px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 0 #880000',
                  transition: 'all 0.1s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(2px)';
                  e.currentTarget.style.boxShadow = '0 2px 0 #880000';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 0 #880000';
                }}
              >
                ✕
              </button>

              {/* Header */}
              <div style={{
                fontFamily: '"Press Start 2P", "Courier New", monospace',
                fontSize: '10px',
                color: '#ff6699',
                textTransform: 'uppercase',
                textShadow: '2px 2px 0 #660033',
                marginBottom: '16px',
                textAlign: 'center',
                letterSpacing: '2px'
              }}>
                Four Thieves Bar - Underground
              </div>

              {/* Main Content Area */}
              <div style={{
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                gap: '24px',
                alignItems: 'center'
              }}>
                {/* Left: Animated Casino Icon */}
                <div style={{
                  flex: '0 0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#330000',
                  border: '3px solid #cc3366',
                  borderRadius: 0,
                  padding: '24px',
                  boxShadow: 'inset 2px 2px 0 rgba(0, 0, 0, 0.5)',
                  minWidth: '180px',
                  minHeight: '180px'
                }}>
                  <div style={{
                    fontSize: '80px',
                    filter: 'drop-shadow(0 0 20px rgba(255, 102, 153, 1))',
                    animation: 'itemFloat 3s ease-in-out infinite'
                  }}>
                    🎰
                  </div>
                </div>

                {/* Right: Item Description */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Item Name */}
                  <div style={{
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    fontSize: '18px',
                    color: '#ff6699',
                    textShadow: '3px 3px 0 #000, 0 0 10px rgba(255, 102, 153, 0.8)',
                    lineHeight: '1.5'
                  }}>
                    Underground Access
                  </div>

                  {/* Item Category */}
                  <div style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '12px',
                    color: '#ff9933',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    ★ Chapter 6 - Slacker ★
                  </div>

                  {/* Description Box */}
                  <div style={{
                    background: '#330000',
                    border: '2px solid #cc3366',
                    borderRadius: 0,
                    padding: '12px',
                    boxShadow: 'inset 2px 2px 0 rgba(0, 0, 0, 0.5)'
                  }}>
                    <div style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '13px',
                      color: '#ffffff',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap'
                    }}>
                      You discovered the secret password and gained access to the hidden casino beneath Four Thieves Bar.
                      
                      The bouncer stepped aside, revealing a dimly lit staircase leading down into the underground.
                      
                      Welcome to the real action. 🎲
                    </div>
                  </div>

                  {/* Completion Badge */}
                  <div style={{
                    background: 'linear-gradient(180deg, #cc3366 0%, #990033 100%)',
                    border: '2px solid #ff6699',
                    borderRadius: 0,
                    padding: '10px',
                    boxShadow: '0 4px 0 #660022',
                    fontFamily: '"Press Start 2P", "Courier New", monospace',
                    fontSize: '9px',
                    color: '#fff',
                    textShadow: '1px 1px 0 #000',
                    textAlign: 'center',
                    lineHeight: '1.6'
                  }}>
                    🎰 Objective Complete!<br/>+75 GUM Awarded
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

export default LockerSystemNew;
