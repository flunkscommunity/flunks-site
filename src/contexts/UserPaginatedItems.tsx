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
import { NftItem } from "components/YourItems/ItemsGrid";

// Context Props
interface PaginatedContextProps {
  displayedItems: NftItem[];
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
}

const PaginatedItemsContext = createContext<PaginatedContextProps | undefined>(
  undefined
);

const PAGE_SIZE = 40;

export const PaginatedItemsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { primaryWallet } = useDynamicContext();
  const [tokenDataPages, setTokenDataPages] = useState<{
    flunks: string[][];
    backpack: string[][];
  }>({
    flunks: [],
    backpack: [],
  });
  const [flunksMetadata, setFlunksMetadata] = useState<NftItem[][]>([]);
  const [backpacksMetadata, setBackpacksMetadata] = useState<NftItem[][]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [filter, setFilter] = useState<"flunks" | "backpacks">("flunks");
  const [viewType, setViewType] = useState<"grid" | "table">("grid");
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const { data: tokenData } = useSWR(
    primaryWallet?.address ? ["allData", '0x2e0eac981ef5bd98'] : null,
    (key, address) => getOwnerTokenIdsWhale(address),
    {
      revalidateOnFocus: false,
      refreshWhenHidden: false,
      refreshWhenOffline: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        const flunksPages = Array.from(
          { length: Math.ceil(data.flunks.length / PAGE_SIZE) },
          (_, i) => data.flunks.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
        );
        const backpackPages = Array.from(
          { length: Math.ceil(data.backpack.length / PAGE_SIZE) },
          (_, i) => data.backpack.slice(i * PAGE_SIZE, i * PAGE_SIZE + PAGE_SIZE)
        );

        const tokenDataPage = { flunks: flunksPages, backpack: backpackPages };
        setTokenDataPages(tokenDataPage);

        const allFlunksMetadata = tokenDataPage.flunks.map((page) =>
          getOwnerTokenStakeInfoWhale("0x2e0eac981ef5bd98", "flunks", page.map(Number))
        );
        const allBackpacksMetadata = tokenDataPage.backpack.map((page) =>
          getOwnerTokenStakeInfoWhale("0x2e0eac981ef5bd98", "backpacks", page.map(Number))
        );
        
        Promise.all(allFlunksMetadata).then((flunksMetadata) => {
          setFlunksMetadata(flunksMetadata);
        });

        Promise.all(allBackpacksMetadata).then((backpacksMetadata) => {
          setBackpacksMetadata(backpacksMetadata);
        });
      }
    }
  );

  const displayedItems = useMemo(() => {
    if (filter === "flunks") {
      return flunksMetadata[currentPage] || [];
    } else {
      return backpacksMetadata[currentPage] || [];
    }
  }, [flunksMetadata, backpacksMetadata, currentPage, filter]);

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
