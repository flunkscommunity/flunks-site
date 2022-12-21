import client from "./axios";

export type GetCollectionNftByIdReq = {
  collectionSlug: string;
  tokenId: string;
};

const getCollectionsNftById = async (req: GetCollectionNftByIdReq) => {
  const { collectionSlug, tokenId } = req;
  const url = `https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com/collection/${collectionSlug}/${tokenId}`;
  
  return client.get(url).then((res) => {
    return res.data;
  });
};

export default getCollectionsNftById;
