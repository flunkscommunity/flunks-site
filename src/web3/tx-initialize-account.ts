// prettier-ignore
import { mutate, authz } from "@onflow/fcl";

const TRANSACTION = `import NonFungibleToken from 0x1d7e57aa55817448
import Flunks from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48
import Patch from 0x807c3d470888cc48

transaction() {
  prepare(signer: AuthAccount) {
    // if the account doesn't already have a Flunks collection
    if signer.borrow<&Flunks.Collection>(from: Flunks.CollectionStoragePath) == nil {
      let collection <- Flunks.createEmptyCollection()
      signer.save(<-collection, to: Flunks.CollectionStoragePath)
      signer.link<&Flunks.Collection{NonFungibleToken.CollectionPublic, Flunks.FlunksCollectionPublic}>(Flunks.CollectionPublicPath, target: Flunks.CollectionStoragePath)
    }

    // if the account doesn't already have a Backpack collection
    if signer.borrow<&Backpack.Collection>(from: Backpack.CollectionStoragePath) == nil {
      let collection <- Backpack.createEmptyCollection()
      signer.save(<-collection, to: Backpack.CollectionStoragePath)
      signer.link<&Backpack.Collection{NonFungibleToken.CollectionPublic, Backpack.BackpackCollectionPublic}>(Backpack.CollectionPublicPath, target: Backpack.CollectionStoragePath)
    }

    // if the account doesn't already have a Patch collection
    if signer.borrow<&Patch.Collection>(from: Patch.CollectionStoragePath) == nil {
      let collection <- Patch.createEmptyCollection()
      signer.save(<-collection, to: Patch.CollectionStoragePath)
      signer.link<&Patch.Collection{NonFungibleToken.CollectionPublic, Patch.PatchCollectionPublic}>(Patch.CollectionPublicPath, target: Patch.CollectionStoragePath)
    }
  }
}`;

export const initAllCollections = async () => {
  return await mutate({
    cadence: TRANSACTION as string,
    // @ts-ignore
    authorizations: [authz],
    limit: 1000,
  });
};
