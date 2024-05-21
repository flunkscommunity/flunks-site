import * as fcl from "@onflow/fcl";

const productionTx = `import NonFungibleToken from 0x1d7e57aa55817448
import Backpack from 0x807c3d470888cc48
import Patch from 0x807c3d470888cc48
import Flunks from 0x807c3d470888cc48
import BackpackMinter from 0x807c3d470888cc48

transaction(tokenID: UInt64, setID: UInt64) {

  let authSigner: AuthAccount

  prepare(signer: AuthAccount) {
    self.authSigner = signer

    // if the account doesn't already have a Backpack collection
    if signer.borrow<&Backpack.Collection>(from: Backpack.CollectionStoragePath) == nil {
      let collection <- Backpack.createEmptyCollection()
      signer.save(<-collection, to: Backpack.CollectionStoragePath)
      signer.link<&Backpack.Collection{NonFungibleToken.CollectionPublic, Backpack.BackpackCollectionPublic}>(Backpack.CollectionPublicPath, target: Backpack.CollectionStoragePath)
    }
  }

  execute {
    BackpackMinter.claimBackPack(tokenID: tokenID, signer: self.authSigner, setID: setID)
  }
}`;

const TRANSACTION: string = productionTx;

interface ClaimBackpackOpts {
  tokenID: number;
}

// prettier-ignore
export function claimBackpack({tokenID}: ClaimBackpackOpts) {
    return async () => await fcl.mutate({
      cadence: TRANSACTION as string,
        args: (arg, t) => [
          arg(tokenID, t.UInt64),
          arg(1, t.UInt64),
        ],
        // @ts-ignore
        authorizations: [fcl.authz],
        limit: 9999,
    })
  }
