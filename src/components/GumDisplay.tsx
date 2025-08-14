import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUserProfile } from '../contexts/UserProfileContext';
import { getUserGumStats, getUserGumBalance, type GumStats } from '../utils/gumAPI';

// Shine animation for the gum display
const shine = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Counting animation for balance updates
const countUp = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const GumDisplayContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 999;
  background: linear-gradient(45deg, #1e1e1e, #2d2d30, #1e1e1e);
  border: 2px solid #ff00ff;
  border-radius: 8px;
  padding: 12px 16px;
  font-family: 'MS Sans Serif', sans-serif;
  color: #fff;
  box-shadow: 
    0 0 20px rgba(255, 0, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  min-width: 120px;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.1),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shine} 3s ease-in-out infinite;
    border-radius: 6px;
  }
`;

const GumHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  position: relative;
  z-index: 2;
`;

const GumIcon = styled.span`
  font-size: 16px;
  animation: ${shine} 2s ease-in-out infinite;
`;

const GumTitle = styled.span`
  font-size: 12px;
  font-weight: bold;
  color: #ff00ff;
  text-shadow: 0 0 5px rgba(255, 0, 255, 0.5);
`;

const GumBalance = styled.div<{ $isUpdating: boolean }>`
  font-size: 18px;
  font-weight: bold;
  color: #00ffff;
  text-shadow: 0 0 10px rgba(0, 255, 255, 0.7);
  text-align: center;
  position: relative;
  z-index: 2;
  
  ${props => props.$isUpdating && css`
    animation: ${countUp} 0.5s ease-out;
  `}
`;

const GumStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  font-size: 10px;
  color: #ccc;
  border-top: 1px solid rgba(255, 0, 255, 0.3);
  padding-top: 8px;
  position: relative;
  z-index: 2;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatLabel = styled.span`
  color: #aaa;
`;

const StatValue = styled.span`
  color: #fff;
  font-weight: bold;
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 0, 255, 0.3);
  border-top: 2px solid #ff00ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-size: 10px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

interface GumDisplayProps {
  showDetailedStats?: boolean;
  refreshInterval?: number;
}

export const GumDisplay: React.FC<GumDisplayProps> = ({
  showDetailedStats = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const { primaryWallet } = useDynamicContext();
  const { hasProfile, profile } = useUserProfile();
  const [gumStats, setGumStats] = useState<GumStats | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Don't show gum display if no profile exists
  if (!hasProfile || !primaryWallet?.address) {
    console.log('🍬 GumDisplay: Hidden - requires profile. hasProfile:', hasProfile, 'wallet:', !!primaryWallet?.address);
    return null;
  }

  console.log('🍬 GumDisplay: Showing for profile:', profile?.username);

  // Load gum data
  const loadGumData = async (showAnimation = false) => {
    if (!primaryWallet?.address) return;

    if (showAnimation) {
      setIsUpdating(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (showDetailedStats) {
        const stats = await getUserGumStats(primaryWallet.address);
        if (stats) {
          setGumStats(stats);
          setBalance(stats.current_balance || 0);
        } else {
          // No stats found, set defaults
          setGumStats(null);
          setBalance(0);
        }
      } else {
        const currentBalance = await getUserGumBalance(primaryWallet.address);
        setBalance(currentBalance || 0);
      }
      setLastUpdate(Date.now());
    } catch (err) {
      console.error('Error loading gum data:', err);
      setError('Failed to load gum data');
    } finally {
      setLoading(false);
      if (showAnimation) {
        setTimeout(() => setIsUpdating(false), 500);
      }
    }
  };

  // Initial load
  useEffect(() => {
    if (primaryWallet?.address) {
      loadGumData();
    }
  }, [primaryWallet?.address, showDetailedStats]);

  // Auto refresh
  useEffect(() => {
    if (!primaryWallet?.address || refreshInterval <= 0) return;

    const interval = setInterval(() => {
      loadGumData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [primaryWallet?.address, refreshInterval]);

  // Listen for gum balance updates from other components
  useEffect(() => {
    const handleGumUpdate = () => {
      loadGumData(true);
    };

    window.addEventListener('gumBalanceUpdated', handleGumUpdate);
    return () => window.removeEventListener('gumBalanceUpdated', handleGumUpdate);
  }, []);

  // Format large numbers
  const formatNumber = (num: number | null | undefined): string => {
    if (num == null || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Don't show if no wallet connected
  if (!primaryWallet?.address) {
    return null;
  }

  return (
    <GumDisplayContainer>
      <GumHeader>
        <GumIcon>🍬</GumIcon>
        <GumTitle>GUM</GumTitle>
      </GumHeader>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorText>{error}</ErrorText>
      ) : (
        <>
          <GumBalance $isUpdating={isUpdating}>
            {formatNumber(balance)}
          </GumBalance>

          {showDetailedStats && gumStats && (
            <GumStats>
              <StatRow>
                <StatLabel>Earned:</StatLabel>
                <StatValue>{formatNumber(gumStats.total_earned)}</StatValue>
              </StatRow>
              <StatRow>
                <StatLabel>Spent:</StatLabel>
                <StatValue>{formatNumber(gumStats.total_spent)}</StatValue>
              </StatRow>
            </GumStats>
          )}
        </>
      )}
    </GumDisplayContainer>
  );
};
