import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useTrialMode } from './TrialModeContext';

export interface UserProfile {
  id: number;
  wallet_address: string;
  username: string;
  discord_id?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileData {
  wallet_address: string;
  username: string;
  discord_id?: string;
  email?: string;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  hasProfile: boolean;
  createProfile: (data: Omit<UserProfileData, 'wallet_address'>) => Promise<boolean>;
  updateProfile: (data: Omit<UserProfileData, 'wallet_address'>) => Promise<boolean>;
  checkUsername: (username: string) => Promise<{ available: boolean; reason: string }>;
  refreshProfile: () => Promise<void>;
  clearProfile: () => void;
}

const UserProfileContext = createContext<UserProfileContextType | null>(null);

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) {
    throw new Error('useUserProfile must be used within a UserProfileProvider');
  }
  return context;
};

interface UserProfileProviderProps {
  children: React.ReactNode;
}

export const UserProfileProvider: React.FC<UserProfileProviderProps> = ({ children }) => {
  const { primaryWallet } = useDynamicContext();
  const { isTrialMode, mockWallet } = useTrialMode();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use trial wallet if in trial mode, otherwise use real wallet
  const walletAddress = isTrialMode ? mockWallet?.address : primaryWallet?.address;

  // Fetch user profile when wallet connects
  const fetchProfile = async () => {
    if (!walletAddress) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isTrialMode) {
        // Trial mode: use localStorage
        const trialProfile = localStorage.getItem(`trial-profile-${walletAddress}`);
        if (trialProfile) {
          setProfile(JSON.parse(trialProfile));
        } else {
          setProfile(null);
        }
        return;
      }

      // Real mode: use API
      const response = await fetch(`/api/get-user-profile?wallet=${walletAddress}`);
      
      if (response.status === 404) {
        // No profile found - this is normal for new users
        setProfile(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const profileData = await response.json();
      setProfile(profileData);

    } catch (err) {
      console.error('Error fetching profile:', err);
      if (!isTrialMode) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Create new profile
  const createProfile = async (data: Omit<UserProfileData, 'wallet_address'>): Promise<boolean> => {
    if (!walletAddress) {
      setError('No wallet connected');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      if (isTrialMode) {
        // Trial mode: use localStorage
        const trialProfile: UserProfile = {
          id: Date.now(),
          wallet_address: walletAddress,
          username: data.username,
          discord_id: data.discord_id,
          email: data.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem(`trial-profile-${walletAddress}`, JSON.stringify(trialProfile));
        setProfile(trialProfile);
        return true;
      }

      // Real mode: use API
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create profile');
      }

      const result = await response.json();
      setProfile(result.profile);
      return true;

    } catch (err) {
      console.error('Error creating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to create profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update existing profile
  const updateProfile = async (data: Omit<UserProfileData, 'wallet_address'>): Promise<boolean> => {
    if (!walletAddress) {
      setError('No wallet connected');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      if (isTrialMode) {
        // Trial mode: update localStorage
        const updatedProfile: UserProfile = {
          ...profile!,
          username: data.username,
          discord_id: data.discord_id,
          email: data.email,
          updated_at: new Date().toISOString()
        };
        
        localStorage.setItem(`trial-profile-${walletAddress}`, JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        return true;
      }

      // Real mode: use API
      const response = await fetch('/api/user-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet_address: walletAddress,
          ...data,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      setProfile(result.profile);
      return true;

    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check username availability
  const checkUsername = async (username: string): Promise<{ available: boolean; reason: string }> => {
    try {
      if (isTrialMode) {
        // Trial mode: simple validation
        if (username.length < 3) {
          return { available: false, reason: 'Username must be at least 3 characters' };
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          return { available: false, reason: 'Only letters, numbers, hyphens, and underscores allowed' };
        }
        
        // Check if it's the current user's username
        if (profile?.username === username) {
          return { available: true, reason: 'Current username' };
        }
        
        // Simulate checking against "taken" usernames for demo
        const takenUsernames = ['admin', 'flunks', 'test', 'demo', 'user', 'player1'];
        if (takenUsernames.includes(username.toLowerCase())) {
          return { available: false, reason: 'Username already taken (demo)' };
        }
        
        return { available: true, reason: 'Username is available' };
      }

      // Real mode: use API
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check username');
      }

      return await response.json();
    } catch (err) {
      console.error('Error checking username:', err);
      return {
        available: false,
        reason: 'Failed to check username availability'
      };
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    await fetchProfile();
  };

  // Clear profile data (useful for trial mode restart)
  const clearProfile = () => {
    setProfile(null);
    setLoading(false);
    setError(null);
    
    // Clear trial profile data from localStorage if in trial mode
    if (isTrialMode && walletAddress) {
      localStorage.removeItem(`trial-profile-${walletAddress}`);
    }
  };

  // Load profile when wallet changes
  useEffect(() => {
    fetchProfile();
  }, [walletAddress]);

  const value: UserProfileContextType = {
    profile,
    loading,
    error,
    hasProfile: !!profile,
    createProfile,
    updateProfile,
    checkUsername,
    refreshProfile,
    clearProfile,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
