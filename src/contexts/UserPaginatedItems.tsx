import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUnifiedWallet } from "./UnifiedWalletContext";
import { getOwnerTokenIdsWhale } from "web3/script-get-owner-token-ids-whale";
import { getOwnerTokenStakeInfoWhale } from "web3/script-get-owner-token-stake-info-whale";
import useSWR from "swr";
import { ObjectDetails } from "./StakingContext";

// Context Props
interface PaginatedContextProps {
  displayedItems: ObjectDetails[];
  flunksCount: number;
  backpacksCount: number;
  currentPage: number;
  setPage: (page: number) => void;
  hasMore: boolean;
  setFilter: (filter: "flunks" | "backpacks") => void;
  filter: "flunks" | "backpacks";
  viewType: "grid" | "table";
  setViewType: (viewType: "grid" | "table") => void;
  currentDataPages: string[][];
  refresh: () => void;
  allItems: ObjectDetails[];
  error?: any;
  isLoading?: boolean;
  isLoadingMetadata?: boolean;
}

const PaginatedItemsContext = createContext<PaginatedContextProps | undefined>(
  undefined
);

const PAGE_SIZE = 40;

export const PaginatedItemsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  
  // Use unified wallet address
  const walletAddress = unifiedAddress || null;
  
  // Debug logging for wallet address
  console.log('🔍 UserPaginatedItems: walletAddress =', walletAddress, 'unifiedAddress =', unifiedAddress);

  // Force refresh when wallet address changes
  useEffect(() => {
    if (walletAddress) {
      console.log('🔄 UserPaginatedItems: Wallet address changed to', walletAddress, '- triggering refresh');
      setResetCacheKey(prev => prev + 1);
    }
  }, [walletAddress]);
  
  // Mobile data override states
  const [mobileDataOverride, setMobileDataOverride] = useState<{
    flunksCount: number;
    backpacksCount: number;
    active: boolean;
  } | null>(null);

  const [tokenDataPages, setTokenDataPages] = useState<{
    flunks: string[][];
    backpack: string[][];
  }>({
    flunks: [],
    backpack: [],
  });
  const [flunksMetadata, setFlunksMetadata] = useState<ObjectDetails[][]>([]);
  const [backpacksMetadata, setBackpacksMetadata] = useState<ObjectDetails[][]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<"flunks" | "backpacks">("flunks");
  const [viewType, setViewType] = useState<"grid" | "table">("grid");
  const [resetCacheKey, setResetCacheKey] = useState(0);

  console.log('📊 Current flunksMetadata state:', flunksMetadata?.length, 'pages');

  const { data: tokenData, error: tokenDataError, isValidating } = useSWR(
    walletAddress ? ["allData", walletAddress, resetCacheKey] : null,
    async (swrKey) => {
      // Debug: log raw swrKey type and value
      console.log('🔍 UserPaginatedItems: swrKey type:', typeof swrKey, 'isArray:', Array.isArray(swrKey));
      console.log('🔍 UserPaginatedItems: swrKey raw value:', swrKey);
      
      // Properly extract values from SWR key
      let key: string, address: string, cacheKey: number;
      
      if (Array.isArray(swrKey)) {
        [key, address, cacheKey] = swrKey;
      } else if (typeof swrKey === 'string') {
        // SWR might serialize the key as a string in some cases
        console.warn('⚠️ SWR key is a string, not array! Value:', swrKey);
        // Try to use walletAddress from closure as fallback
        key = 'allData';
        address = walletAddress || '';
        cacheKey = resetCacheKey;
      } else {
        console.error('❌ Unknown SWR key type:', typeof swrKey);
        return { flunks: [], backpack: [], address: walletAddress };
      }
      
      try {
        console.log('🔍 UserPaginatedItems: SWR key parsed:', JSON.stringify({ key, address, cacheKey }));
        console.log('🔍 UserPaginatedItems: Fetching token data for', address);
        const result = await getOwnerTokenIdsWhale(address);
        console.log('✅ UserPaginatedItems: Token data fetched successfully', result);
        
        // CRITICAL FIX: Always return valid structure even if trait checking fails later
        if (result && typeof result === 'object') {
          return {
            flunks: Array.isArray(result.flunks) ? result.flunks : [],
            backpack: Array.isArray(result.backpack) ? result.backpack : [],
            address // Pass address along for onSuccess
          };
        } else {
          console.warn('⚠️ UserPaginatedItems: Invalid result structure, returning safe defaults');
          return { flunks: [], backpack: [], address };
        }
      } catch (error) {
        console.error('❌ UserPaginatedItems: Error fetching token data:', error);
        console.log('🔧 Returning safe fallback to preserve authentication');
        // Don't throw - return safe fallback to preserve authentication flow
        return { flunks: [], backpack: [], address: walletAddress };
      }
    },
    {
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        try {
          console.log('🔍 UserPaginatedItems: Processing token data', data);
          
          if (!data || typeof data !== 'object') {
            console.warn('⚠️ UserPaginatedItems: Invalid data received:', data);
            return;
          }
          
          const flunks = Array.isArray(data.flunks) ? data.flunks : [];
          const backpack = Array.isArray(data.backpack) ? data.backpack : [];
          const ownerAddress = data.address || walletAddress;
          
          console.log('🔍 UserPaginatedItems: Flunks count:', flunks.length, 'Backpack count:', backpack.length, 'Owner:', ownerAddress);
          
          if (!ownerAddress) {
            console.warn('⚠️ UserPaginatedItems: No owner address available');
            return;
          }
          
          const flunksPages = Array.from(
            { length: Math.ceil(flunks.length / PAGE_SIZE) },
            (_, i) => flunks.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
          );
          const backpackPages = Array.from(
            { length: Math.ceil(backpack.length / PAGE_SIZE) },
            (_, i) => backpack.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
          );

          const tokenDataPage = { flunks: flunksPages, backpack: backpackPages };
          setTokenDataPages(tokenDataPage);
          
          console.log('🔍 UserPaginatedItems: Fetching metadata for', flunksPages.length, 'flunk pages and', backpackPages.length, 'backpack pages');
          
          // Set loading state
          setIsLoadingMetadata(true);

          const allFlunksMetadata = tokenDataPage.flunks.map((page) =>
            getOwnerTokenStakeInfoWhale(ownerAddress, "flunks", page.map(Number))
          );
          const allBackpacksMetadata = tokenDataPage.backpack.map((page) =>
            getOwnerTokenStakeInfoWhale(ownerAddress, "backpacks", page.map(Number))
          );
          
          Promise.all(allFlunksMetadata).then((flunksMetadata) => {
            console.log('✅ UserPaginatedItems: Flunks metadata loaded', flunksMetadata?.length, 'pages');
            setFlunksMetadata(flunksMetadata);
            setIsLoadingMetadata(false);
          }).catch((error) => {
            console.error('❌ UserPaginatedItems: Error loading flunks metadata:', error);
            console.error('❌ This is likely due to lightweight trait optimization changes');
            console.log('🔧 Creating minimal NFT objects without trait data...');
            
            // CRITICAL FIX: Create minimal NFT objects even when metadata fails
            // This allows OnlyFlunks/MyPlace to show NFTs even if trait data is unavailable
            const minimalFlunksPages = tokenDataPage.flunks.map((pageTokenIds) =>
              pageTokenIds.map((tokenId: string) => ({
                owner: ownerAddress,
                tokenID: tokenId,
                MetadataViewsDisplay: {
                  name: `Flunk #${tokenId}`,
                  description: '',
                  thumbnail: { url: '/flunks-logo.png' }  // Fallback image
                },
                traits: { traits: [] }, // Empty traits, but structure exists
                serialNumber: tokenId,  // Use tokenId as serialNumber
                stakingInfo: null,
                collection: 'Flunks',
                rewards: 0
              }))
            );
            setFlunksMetadata(minimalFlunksPages);
            setIsLoadingMetadata(false);
          });

          Promise.all(allBackpacksMetadata).then((backpacksMetadata) => {
            console.log('✅ UserPaginatedItems: Backpacks metadata loaded', backpacksMetadata?.length, 'pages');
            setBackpacksMetadata(backpacksMetadata);
          }).catch((error) => {
            console.error('❌ UserPaginatedItems: Error loading backpacks metadata:', error);
            console.error('❌ This is likely due to lightweight trait optimization changes');
            console.log('🔧 Creating minimal Backpack objects without trait data...');
            
            // CRITICAL FIX: Create minimal NFT objects even when metadata fails
            const minimalBackpackPages = tokenDataPage.backpack.map((pageTokenIds) =>
              pageTokenIds.map((tokenId: string) => ({
                owner: ownerAddress,
                tokenID: tokenId,
                MetadataViewsDisplay: {
                  name: `Backpack #${tokenId}`,
                  description: '',
                  thumbnail: { url: '/images/icons/backpack.png' }  // Fallback image
                },
                traits: { traits: [] }, // Empty traits, but structure exists
                serialNumber: tokenId,  // Use tokenId as serialNumber
                stakingInfo: null,
                collection: 'Backpack',
                rewards: 0
              }))
            );
            setBackpacksMetadata(minimalBackpackPages);
          });
        } catch (error) {
          console.error('❌ UserPaginatedItems: Error in onSuccess handler:', error);
        }
      },
      onError: (error) => {
        console.error('❌ UserPaginatedItems: SWR error:', error);
      }
    }
  );

  // Clear data when no wallet is connected
  useEffect(() => {
    if (!walletAddress) {
      setFlunksMetadata([]);
      setBackpacksMetadata([]);
      setTokenDataPages({ flunks: [], backpack: [] });
      setMobileDataOverride(null);
    }
  }, [walletAddress]);

  // Listen for mobile data override events
  useEffect(() => {
    const handleMobileDataOverride = (event: CustomEvent) => {
      const { flunksCount, backpacksCount } = event.detail;
      console.log('📱 Mobile data override received:', { flunksCount, backpacksCount });
      
      setMobileDataOverride({
        flunksCount: flunksCount || 0,
        backpacksCount: backpacksCount || 0,
        active: true
      });
      
      // Force a refresh to get the actual data
      setResetCacheKey(prev => prev + 1);
    };

    window.addEventListener('mobileNFTDataFixed', handleMobileDataOverride as EventListener);
    return () => {
      window.removeEventListener('mobileNFTDataFixed', handleMobileDataOverride as EventListener);
    };
  }, []);

  const displayedItems = useMemo(() => {
    console.log('📊 displayedItems computation:', {
      filter,
      currentPage,
      flunksMetadataPages: flunksMetadata?.length,
      backpacksMetadataPages: backpacksMetadata?.length,
      flunksCurrentPage: flunksMetadata[currentPage]?.length,
      backpacksCurrentPage: backpacksMetadata[currentPage]?.length
    });
    
    // Use real blockchain data
    if (filter === "flunks") {
      const items = flunksMetadata[currentPage] || [];
      console.log('📊 Returning flunks items:', items.length);
      return items;
    } else {
      const items = backpacksMetadata[currentPage] || [];
      console.log('📊 Returning backpacks items:', items.length);
      return items;
    }
  }, [flunksMetadata, backpacksMetadata, currentPage, filter]);

  const allItems = useMemo(() => {
    const flunksMetadataFlat = flunksMetadata.flat();
    const backpacksMetadataFlat = backpacksMetadata.flat();

    return flunksMetadataFlat.concat(backpacksMetadataFlat);
  }, [flunksMetadata, backpacksMetadata]);

  const value = {
    displayedItems,
    flunksCount: mobileDataOverride?.active ? mobileDataOverride.flunksCount : (tokenData?.flunks?.length || 0),
    backpacksCount: mobileDataOverride?.active ? mobileDataOverride.backpacksCount : (tokenData?.backpack?.length || 0),
    currentPage,
    setPage: setCurrentPage,
    hasMore:
      filter === "flunks"
        ? currentPage < tokenDataPages.flunks.length - 1
        : currentPage < tokenDataPages.backpack.length - 1,
    setFilter,
    filter,
    viewType,
    setViewType,
    currentDataPages: filter === "flunks" ? tokenDataPages.flunks : tokenDataPages.backpack,
    refresh: () => setResetCacheKey((prev) => prev + 1),
    allItems,
    error: tokenDataError,
    isLoading: isValidating,
    isLoadingMetadata
  };

  return (
    <PaginatedItemsContext.Provider value={value}>
      {children}
    </PaginatedItemsContext.Provider>
  );
};

// Hook to use Paginated Context
export const usePaginatedItems = () => {
  const context = useContext(PaginatedItemsContext);
  if (!context) {
    throw new Error(
      "usePaginatedItems must be used within PaginatedItemsProvider"
    );
  }
  return context;
};
