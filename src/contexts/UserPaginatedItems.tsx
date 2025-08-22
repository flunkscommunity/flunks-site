import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  ReactNode,
} from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
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
}

const PaginatedItemsContext = createContext<PaginatedContextProps | undefined>(
  undefined
);

const PAGE_SIZE = 40;

export const PaginatedItemsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { primaryWallet } = useDynamicContext();
  
  // Use real wallet only - no trial mode
  const walletAddress = primaryWallet?.address || null;
  
  const [tokenDataPages, setTokenDataPages] = useState<{
    flunks: string[][];
    backpack: string[][];
  }>({
    flunks: [],
    backpack: [],
  });
  const [flunksMetadata, setFlunksMetadata] = useState<ObjectDetails[][]>([]);
  const [backpacksMetadata, setBackpacksMetadata] = useState<ObjectDetails[][]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<"flunks" | "backpacks">("flunks");
  const [viewType, setViewType] = useState<"grid" | "table">("grid");
  const [resetCacheKey, setResetCacheKey] = useState(0);

  console.log(flunksMetadata);

  const { data: tokenData, error: tokenDataError, isValidating } = useSWR(
    walletAddress ? ["allData", walletAddress, resetCacheKey] : null,
    async (key, address) => {
      try {
        console.log('🔍 UserPaginatedItems: Fetching token data for', address);
        const result = await getOwnerTokenIdsWhale(address);
        console.log('✅ UserPaginatedItems: Token data fetched successfully', result);
        return result;
      } catch (error) {
        console.error('❌ UserPaginatedItems: Error fetching token data:', error);
        throw error;
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
          
          console.log('🔍 UserPaginatedItems: Flunks count:', flunks.length, 'Backpack count:', backpack.length);
          
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

          const allFlunksMetadata = tokenDataPage.flunks.map((page) =>
            getOwnerTokenStakeInfoWhale(walletAddress, "flunks", page.map(Number))
          );
          const allBackpacksMetadata = tokenDataPage.backpack.map((page) =>
            getOwnerTokenStakeInfoWhale(walletAddress, "backpacks", page.map(Number))
          );
          
          Promise.all(allFlunksMetadata).then((flunksMetadata) => {
            console.log('✅ UserPaginatedItems: Flunks metadata loaded', flunksMetadata);
            setFlunksMetadata(flunksMetadata);
          }).catch((error) => {
            console.error('❌ UserPaginatedItems: Error loading flunks metadata:', error);
            setFlunksMetadata([]);
          });

          Promise.all(allBackpacksMetadata).then((backpacksMetadata) => {
            console.log('✅ UserPaginatedItems: Backpacks metadata loaded', backpacksMetadata);
            setBackpacksMetadata(backpacksMetadata);
          }).catch((error) => {
            console.error('❌ UserPaginatedItems: Error loading backpacks metadata:', error);
            setBackpacksMetadata([]);
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
    }
  }, [walletAddress]);

  const displayedItems = useMemo(() => {
    // Use real blockchain data
    if (filter === "flunks") {
      return flunksMetadata[currentPage] || [];
    } else {
      return backpacksMetadata[currentPage] || [];
    }
  }, [flunksMetadata, backpacksMetadata, currentPage, filter]);

  const allItems = useMemo(() => {
    const flunksMetadataFlat = flunksMetadata.flat();
    const backpacksMetadataFlat = backpacksMetadata.flat();

    return flunksMetadataFlat.concat(backpacksMetadataFlat);
  }, [flunksMetadata, backpacksMetadata]);

  const value = {
    displayedItems,
    flunksCount: tokenData?.flunks?.length || 0,
    backpacksCount: tokenData?.backpack?.length || 0,
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
    isLoading: isValidating
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
