import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export interface UserProfile {
  id: number;
  wallet_address: string;
  username: string;
  profile_icon?: string;
  discord_id?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfileData {
  wallet_address: string;
  username: string;
  profile_icon?: string;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use real wallet only
  const walletAddress = primaryWallet?.address;

  // Fetch user profile when wallet connects
  const fetchProfile = async () => {
    if (!walletAddress) {
      console.log('👤 UserProfile: No wallet address, clearing profile');
      setProfile(null);
      return;
    }

    console.log('👤 UserProfile: Fetching profile for wallet:', walletAddress);
    setLoading(true);
    setError(null);

    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'placeholder_url' || supabaseKey === 'placeholder_key') {
        // If Supabase isn't configured, check localStorage
        console.warn('Supabase not configured, checking localStorage for profile');
        
        const storedProfile = localStorage.getItem(`flunks_profile_${walletAddress}`);
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          console.log('👤 UserProfile: Found stored profile:', profileData);
          setProfile(profileData);
        } else {
          console.log('👤 UserProfile: No stored profile found');
          setProfile(null);
        }
        return;
      }

      // Use API when Supabase is properly configured
      console.log('👤 UserProfile: Calling API /api/get-user-profile?wallet=' + walletAddress);
      const response = await fetch(`/api/get-user-profile?wallet=${walletAddress}`);
      
      if (response.status === 404) {
        // No profile found - this is normal for new users
        console.log('👤 UserProfile: No profile found in database (404) - user needs to create profile');
        setProfile(null);
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch profile: ${response.statusText}`);
      }

      const profileData = await response.json();
      console.log('👤 UserProfile: Profile fetched successfully:', profileData);
      setProfile(profileData);

    } catch (err) {
      console.error('Error fetching profile:', err);
      
      // Fallback to localStorage if API fails
      try {
        const storedProfile = localStorage.getItem(`flunks_profile_${walletAddress}`);
        if (storedProfile) {
          const profileData = JSON.parse(storedProfile);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
      } catch (localError) {
        setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        setProfile(null);
      }
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
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'placeholder_url' || supabaseKey === 'placeholder_key') {
        // If Supabase isn't configured, store profile locally
        console.warn('Supabase not configured, storing profile locally');
        
        const profileData: UserProfile = {
          id: Date.now(), // Use timestamp as temporary ID
          wallet_address: walletAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        
        // Store in localStorage as fallback
        localStorage.setItem(`flunks_profile_${walletAddress}`, JSON.stringify(profileData));
        setProfile(profileData);
        return true;
      }

      // Use API when Supabase is properly configured
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
      
      // Fallback to localStorage if API fails
      try {
        const profileData: UserProfile = {
          id: Date.now(), // Use timestamp as temporary ID
          wallet_address: walletAddress,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        localStorage.setItem(`flunks_profile_${walletAddress}`, JSON.stringify(profileData));
        setProfile(profileData);
        return true;
      } catch (localError) {
        setError(err instanceof Error ? err.message : 'Failed to create profile');
        return false;
      }
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
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'placeholder_url' || supabaseKey === 'placeholder_key') {
        // If Supabase isn't configured, update profile locally
        console.warn('Supabase not configured, updating profile locally');
        
        const updatedProfile: UserProfile = {
          id: profile?.id || Date.now(),
          wallet_address: walletAddress,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        
        // Store in localStorage as fallback
        localStorage.setItem(`flunks_profile_${walletAddress}`, JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        return true;
      }

      // Use API when Supabase is properly configured
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
      
      // Fallback to localStorage if API fails
      try {
        const updatedProfile: UserProfile = {
          id: profile?.id || Date.now(),
          wallet_address: walletAddress,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        };
        localStorage.setItem(`flunks_profile_${walletAddress}`, JSON.stringify(updatedProfile));
        setProfile(updatedProfile);
        return true;
      } catch (localError) {
        setError(err instanceof Error ? err.message : 'Failed to update profile');
        return false;
      }
    } finally {
      setLoading(false);
    }
  };

  // Check username availability
  const checkUsername = async (username: string): Promise<{ available: boolean; reason: string }> => {
    try {
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'placeholder_url' || supabaseKey === 'placeholder_key') {
        // If Supabase isn't configured, just do basic validation and allow the username
        console.warn('Supabase not configured, skipping database username check');
        
        // Basic validation only
        if (username.length < 3 || username.length > 32) {
          return {
            available: false,
            reason: 'Username must be between 3 and 32 characters'
          };
        }

        if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
          return {
            available: false,
            reason: 'Username can only contain letters, numbers, hyphens, and underscores'
          };
        }

        // Allow any valid username when database isn't available
        return {
          available: true,
          reason: 'Username is available'
        };
      }

      // Use API when Supabase is properly configured
      const response = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`);
      
      if (!response.ok) {
        throw new Error('Failed to check username');
      }

      return await response.json();
    } catch (err) {
      console.error('Error checking username:', err);
      
      // Fallback to basic validation if API fails
      if (username.length >= 3 && username.length <= 32 && /^[a-zA-Z0-9_-]+$/.test(username)) {
        return {
          available: true,
          reason: 'Username validation passed (database unavailable)'
        };
      }
      
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
