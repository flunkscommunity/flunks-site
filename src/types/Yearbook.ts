// TypeScript interfaces for the Yearbook app

export interface FlunkNFT {
  tokenId: number;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  rank?: number;
  clique?: string;
  owner?: string;
  lastSale?: {
    price: number;
    currency: string;
    date: string;
  };
}

export interface YearbookFilters {
  clique?: string;
  trait?: string;
  search?: string;
  sortBy?: 'tokenId' | 'rank' | 'name' | 'random';
  limit?: number;
  offset?: number;
}

export interface YearbookStats {
  total: number;
  geeks: number;
  jocks: number;
  preps: number;
  freaks: number;
  uniqueTraits: number;
}

export interface TraitFilter {
  trait_type: string;
  values: string[];
}

export interface YearbookSearchResult {
  flunks: FlunkNFT[];
  total: number;
  hasMore: boolean;
}

export type CliqueType = 'GEEK' | 'JOCK' | 'PREP' | 'FREAK' | 'ALL';

export type SortOption = 'tokenId' | 'rank' | 'name' | 'clique';

export interface YearbookState {
  flunks: FlunkNFT[];
  loading: boolean;
  error: string | null;
  filters: YearbookFilters;
  stats: YearbookStats | null;
  selectedFlunk: FlunkNFT | null;
}

// API response interfaces
export interface APIFlunkResponse {
  tokenId: number;
  metadata: {
    name?: string;
    description?: string;
    image?: string;
    uri?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
  };
  rank?: number;
  rarity_rank?: number;
  ownerAddress?: string;
  lastSalePrice?: number;
  lastSaleCurrency?: string;
  lastSaleDate?: string;
}

export interface APIStatsResponse {
  total: number;
  clique_counts: {
    GEEK: number;
    JOCK: number;
    PREP: number;
    FREAK: number;
  };
  unique_traits: number;
}
