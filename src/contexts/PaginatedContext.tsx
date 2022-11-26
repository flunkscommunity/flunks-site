import { useContext, useEffect, createContext } from "react";
import { AxiosPromise, AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import {
  PaginatedResponse,
  useSwrInfiniteWrapper,
  UseSwrInfiniteWrapperParams,
} from "api/useSwrWrapper";

interface ContextState<T> {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  hasMore: boolean;
  nfts: T[];
}

export const PaginatedContext = createContext<ContextState<unknown>>({
  page: 0,
  setPage: () => {},
  hasMore: false,
  nfts: [],
});

interface ProviderProps<T = unknown> {
  children: React.ReactNode;
  fetcher: (
    requestParameters: T,
    options?: AxiosRequestConfig
  ) => AxiosPromise<unknown>;
  cacheKey: UseSwrInfiniteWrapperParams<unknown, unknown>["cacheKey"];
  requestParameters?: T;
  swrConfig?: UseSwrInfiniteWrapperParams<unknown, unknown>["swrConfig"];
}

const PaginatedProdiver: React.FC<ProviderProps> = (props) => {
  const {
    children,
    fetcher,
    cacheKey,
    requestParameters = {},
    swrConfig = {},
  } = props;

  const router = useRouter();
  const {
    data: paginatedNfts = [],
    size: page,
    setSize: setPage,
  } = useSwrInfiniteWrapper({
    fetcher,
    requestParameters: {
      limit: 3,
      ...(requestParameters as object),
    },
    swrConfig: {
      shouldFetch: true,
      revalidateOnFocus: true,
      revalidateOnMount: true,
      onError: (error) => console.error(error),
      ...(swrConfig as object),
    },
    cacheKey,
  });

  useEffect(() => {
    const { page: pageInUrl } = router.query;

    if (!pageInUrl) return;

    setPage(parseInt(router.query.page as string));
  }, [router.isReady]);

  const totalPages = paginatedNfts[0]?.totalPages || 0;
  const hasMore = page < totalPages;
  const nfts = paginatedNfts.flat();

  return (
    <PaginatedContext.Provider
      value={{
        nfts,
        page,
        setPage,
        hasMore,
      }}
    >
      {children}
    </PaginatedContext.Provider>
  );
};

export function usePaginatedContext<T>(): ContextState<T> {
  const { page, setPage, hasMore, nfts } = useContext(PaginatedContext);

  return {
    page,
    setPage,
    hasMore,
    nfts: nfts as T[],
  };
}

export default PaginatedProdiver;
