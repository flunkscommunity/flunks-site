export type MetadataCategories =
  | "Backdrop"
  | "Pigment"
  | "Torso"
  | "Head"
  | "Face"
  | "Clique"
  | "Superlative";

export interface Thumbnail {
  url: string;
}

export interface MetadataViewsDisplay {
  name: string;
  description: string;
  thumbnail: Thumbnail;
}

export type UsefulMetadata = {
  [key in MetadataCategories | string]: string | number;
};

export interface Metadata extends UsefulMetadata {
  mimetype: string;
  path: string;
  uri: string;
  cid: string;
}

export default interface NFT extends DbNft {
  metadata: Metadata;
}

export enum SUPPORTED_COLLECTIONS {
  FLUNKS = "flunks",
  PATCH = "patch",
  BACKPACKS = "backpack",
  INCEPTION_AVATARS = "inception-animals",
}

export enum NFT_ACTIVITY_TYPE {
  MINT = "MINT",
  BURN = "BURN",
  TRANSFER = "TRANSFER",
  LIST = "LIST",
  DELIST = "DELIST",
  SALE = "SALE",
  PATCH_ADDED = "PATCH_ADDED",
  PATCH_REMOVED = "PATCH_REMOVED",
}

export interface NftActivity {
  activity: NFT_ACTIVITY_TYPE;
  collectionName: SUPPORTED_COLLECTIONS;
  currency: string;
  eventDate: string;
  from: string;
  to: string;
  id: number;
  listingResourceId: number;
  tokenId: number;
  transactionId: string;
  price: string;
  NFT?: Partial<NFT>;
}

export interface ExternalListing {
  collectionName: SUPPORTED_COLLECTIONS;
  currency: string;
  listingResourceId: number;
  listingId: number;
  price: number;
  sellerAddress: string;
  status: string;
  tokenId: number;
  transactionId: string;
}

export interface DbNft {
  collectionName: SUPPORTED_COLLECTIONS;
  expiryDate: string;
  floorPrice: number;
  floorPriceCurrency: string;
  listingDate: string;
  metadata: Metadata;
  ownerAddress: string;
  rank: number;
  templateId: number;
  tokenId: number;
  NftActivity: NftActivity[];
  ExternalListing: ExternalListing[];
  Listing: ExternalListing[];
}

export interface CuratedCollections {
  Backpack: DbNft[];
  Flunks: DbNft[];
  Patch: DbNft[];
  InceptionAvatar: DbNft[];
}
