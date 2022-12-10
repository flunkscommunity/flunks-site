import { useContext, useEffect, createContext, useState } from "react";
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
  requestParameters: unknown;
  setRequestParameters: React.Dispatch<React.SetStateAction<unknown>>;
  isValidating: boolean;
}

export const PaginatedContext = createContext<ContextState<unknown>>({
  page: 0,
  setPage: () => {},
  hasMore: false,
  nfts: [],
  requestParameters: {},
  setRequestParameters: () => {},
  isValidating: false,
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
  const [_requestParameters, setRequestParameters] =
    useState<typeof requestParameters>(requestParameters);
  const router = useRouter();
  const {
    mutate,
    data: paginatedNfts = [],
    size: page,
    setSize: setPage,
    isValidating,
  } = useSwrInfiniteWrapper({
    fetcher,
    requestParameters: {
      limit: 3,
      ...(_requestParameters as object),
    },
    swrConfig: {
      shouldFetch: true,
      revalidateOnFocus: true,
      revalidateOnMount: true,
      onError: (error) => console.error(error),
      ...(swrConfig as object),
    },
    cacheKey: _requestParameters.traits
      ? `${cacheKey}-${_requestParameters.traits}`
      : cacheKey,
  });

  useEffect(() => {
    const { page: pageInUrl } = router.query;

    if (!pageInUrl) return;

    setPage(parseInt(router.query.page as string));
  }, [router.isReady]);

  useEffect(() => {
    mutate();
  }, [_requestParameters]);

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
        requestParameters: _requestParameters,
        setRequestParameters,
        isValidating,
      }}
    >
      {children}
    </PaginatedContext.Provider>
  );
};

export function usePaginatedContext<T>(): ContextState<T> {
  const {
    page,
    setPage,
    hasMore,
    nfts,
    requestParameters,
    setRequestParameters,
    isValidating,
  } = useContext(PaginatedContext);

  return {
    page,
    setPage,
    hasMore,
    nfts: nfts as T[],
    requestParameters,
    setRequestParameters,
    isValidating,
  };
}

export default PaginatedProdiver;
