import { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getWalletStakeInfo } from 'web3/script-get-wallet-stake-info';
import { ObjectDetails } from 'contexts/StakingContext';

export type CliqueType = 'GEEK' | 'JOCK' | 'PREP' | 'FREAK';

interface CliqueAccess {
  [key: string]: boolean;
}

interface UseCliqueAccessReturn {
  cliqueAccess: CliqueAccess;
  loading: boolean;
  error: string | null;
  hasAccess: (clique: CliqueType) => boolean;
  refreshAccess: () => Promise<void>;
  getUserCliques: () => CliqueType[];
}

/**
 * Hook to check user's clique access based on NFT ownership
 * Checks if the user owns NFTs with specific clique traits
 */
export const useCliqueAccess = (): UseCliqueAccessReturn => {
  const { primaryWallet } = useDynamicContext();
  const [cliqueAccess, setCliqueAccess] = useState<CliqueAccess>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const walletAddress = primaryWallet?.address;

  const checkCliqueAccess = async () => {
    if (!walletAddress) {
      setCliqueAccess({});
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get all user's NFTs with traits
      const stakeInfo = await getWalletStakeInfo(walletAddress);
      
      if (!stakeInfo || !Array.isArray(stakeInfo)) {
        console.warn('No stake info found for wallet:', walletAddress);
        setCliqueAccess({});
        return;
      }

      // Initialize access object
      const access: CliqueAccess = {
        GEEK: false,
        JOCK: false,
        PREP: false,
        FREAK: false,
      };

      // Check each NFT for clique traits
      stakeInfo.forEach((item: ObjectDetails) => {
        if (item.traits?.traits) {
          // Look through traits to find clique information
          item.traits.traits.forEach((trait: any) => {
            if (trait.name?.toLowerCase() === 'clique' || trait.name?.toLowerCase() === 'class') {
              const cliqueValue = trait.value?.toString().toUpperCase();
              
              // Map variations of clique names
              switch (cliqueValue) {
                case 'GEEK':
                case 'GEEKS':
                case 'NERD':
                case 'NERDS':
                  access.GEEK = true;
                  break;
                case 'JOCK':
                case 'JOCKS':
                case 'ATHLETE':
                case 'ATHLETES':
                  access.JOCK = true;
                  break;
                case 'PREP':
                case 'PREPS':
                case 'PREPPY':
                  access.PREP = true;
                  break;
                case 'FREAK':
                case 'FREAKS':
                case 'OUTCAST':
                case 'OUTCASTS':
                  access.FREAK = true;
                  break;
              }
            }
          });
        }
      });

      setCliqueAccess(access);
      console.log('Clique access updated:', access);

    } catch (err) {
      console.error('Error checking clique access:', err);
      setError(err instanceof Error ? err.message : 'Failed to check clique access');
      setCliqueAccess({});
    } finally {
      setLoading(false);
    }
  };

  // Refresh access when wallet changes
  useEffect(() => {
    checkCliqueAccess();
  }, [walletAddress]);

  const hasAccess = (clique: CliqueType): boolean => {
    return !!cliqueAccess[clique];
  };

  const getUserCliques = (): CliqueType[] => {
    return Object.keys(cliqueAccess).filter(clique => 
      cliqueAccess[clique]
    ) as CliqueType[];
  };

  const refreshAccess = async () => {
    await checkCliqueAccess();
  };

  return {
    cliqueAccess,
    loading,
    error,
    hasAccess,
    refreshAccess,
    getUserCliques,
  };
};

export default useCliqueAccess;
