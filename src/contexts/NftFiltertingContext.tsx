import instance from "api/client";
import { AxiosRequestConfig } from "axios";
import NFT from "interface/NFT";
import { useRouter } from "next/router";
import { useEffect, useReducer } from "react";
import { createContext } from "react";
import NftSortingPaginationReducer, {
  initSortingPagination,
  NftSortingPaginationReducerActions,
  NftSortingPaginationReducerState,
} from "reducer/NftSortingAndPaginationReducer";
import TraitFilteringReducer, {
  AppliedFilters,
  initTraitFiltering,
  TraitFilteringReducerActions,
  TraitFilteringReducerState,
} from "reducers/TraitFilteringReducer";
import useSWRInfinite from "swr/infinite";

interface ContextProps {
  size: number;
  setSize: (number: number) => void;
  sortingState: NftSortingPaginationReducerState;
  traitFilterState: TraitFilteringReducerState;
  sortingDispatch: React.Dispatch<NftSortingPaginationReducerActions>;
  traitFilterDispatch: React.Dispatch<TraitFilteringReducerActions>;
  displayableNfts: NFT[][];
  error: any;
  isValidating: boolean;
  collectionSlug: string;
}

export const NftFilteringContext = createContext<ContextProps>(null!);

interface ProviderProps {
  children: React.ReactNode;
  collectionSlug: string;
  initialSort: {
    sort: string;
    include: string;
    limit: number;
  };
  initialTraits: {
    traits: AppliedFilters;
  };
}

const fetcher = (url: string, options: AxiosRequestConfig): Promise<NFT[]> =>
  instance.get(url, options).then((res) => res.data);

// A function to get the SWR key of each page,
// its return value will be accepted by `fetcher`.
// If `null` is returned, the request of that page won't start.
const getKey = (options) => (pageIndex, previousPageData) => {
  if (previousPageData && !previousPageData.length) return null; // reached the end
  const { url, ...rest } = options;
  let { traits } = options;

  if (traits["Slots"]) {
    const { Slots, ...rest } = traits;
    traits = {
      ...rest,
      slots: Slots,
    };
  }

  traits = JSON.stringify(traits);

  return `${url}?${new URLSearchParams({
    ...rest,
    traits,
    page: (pageIndex + 1).toString(),
  })}`;
};

const NftFilteringProdiver: React.FC<ProviderProps> = (props) => {
  const { children, collectionSlug, initialSort, initialTraits } = props;
  const router = useRouter();
  const [sortingState, sortingDispatch] = useReducer(
    NftSortingPaginationReducer,
    initialSort
      ? (initialSort as NftSortingPaginationReducerState)
      : {
          sort: "PRICE_ASC",
          include: "ALL",
          limit: 20,
        },
    initSortingPagination
  );
  const [traitFilterState, traitFilterDispatch] = useReducer(
    TraitFilteringReducer,
    initialTraits
      ? (initialTraits as TraitFilteringReducerState)
      : {
          traits: {},
        },
    initTraitFiltering
  );

  const { sort, include, limit } = sortingState || {};
  const { traits } = traitFilterState || {};

  const {
    data: displayableNfts,
    size,
    setSize,
    error,
    isValidating,
  } = useSWRInfinite(
    getKey({
      url: `/collection/${collectionSlug}`,
      sort,
      include,
      limit,
      traits,
    }),
    fetcher,
    {
      refreshInterval: 5000,
    }
  );

  const applyChangesToUrl = () => {
    const newQuery = {
      ...router.query,
      sort: sort,
      include: include,
      limit: limit,
      traits: JSON.stringify(traits),
      size: size,
    };

    router.replace(
      {
        pathname: router.pathname,
        query: newQuery,
      },
      undefined,
      {
        shallow: true,
      }
    );
  };

  useEffect(() => {
    applyChangesToUrl();
  }, [sortingState, traitFilterState, size]);

  useEffect(() => {
    const { sort, include, limit, traits, size } = router.query || {};
    if (traits) {
      traitFilterDispatch({
        type: "SET_TRAITS",
        payload: JSON.parse(traits as string),
      });
    }

    sortingDispatch({
      type: "SET_FILTER",
      payload: {
        sort: sort as string,
        include: include as string,
        limit: parseInt(limit as string),
      },
    });

    if (size) {
      setSize(Number(size));
    }
  }, []);

  return (
    <NftFilteringContext.Provider
      value={{
        size,
        setSize,
        sortingDispatch,
        sortingState,
        traitFilterDispatch,
        traitFilterState,
        displayableNfts: displayableNfts as NFT[][],
        error,
        isValidating,
        collectionSlug,
      }}
    >
      {children}
    </NftFilteringContext.Provider>
  );
};

export default NftFilteringProdiver;
