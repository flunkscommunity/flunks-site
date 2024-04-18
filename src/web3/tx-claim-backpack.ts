// import * as fcl from "@onflow/fcl";
// import { tx } from "./util/tx";

// const stagingTx = `import NonFungibleToken from 0x631e88ae7f1d7c20
// import Backpack from 0xe666c53e1758dec6
// import Patch from 0xe666c53e1758dec6
// import Flunks from 0xe666c53e1758dec6
// import BackpackMinter from 0xe666c53e1758dec6


// transaction(tokenID: UInt64, setID: UInt64) {

//   let authSigner: AuthAccount
//   let signerFlunksCollection: &Flunks.Collection

//   prepare(signer: AuthAccount) {
//     self.authSigner = signer

//     // if the account doesn't already have a Backpack collection
//     if signer.borrow<&Backpack.Collection>(from: Backpack.CollectionStoragePath) == nil {
//       let collection <- Backpack.createEmptyCollection()
//       signer.save(<-collection, to: Backpack.CollectionStoragePath)
//       signer.link<&Backpack.Collection{NonFungibleToken.CollectionPublic, Backpack.BackpackCollectionPublic}>(Backpack.CollectionPublicPath, target: Backpack.CollectionStoragePath)
//     }

//     // if the account doesn't already have a Patch collection
//     if signer.borrow<&Patch.Collection>(from: Patch.CollectionStoragePath) == nil {
//       let collection <- Patch.createEmptyCollection()
//       signer.save(<-collection, to: Patch.CollectionStoragePath)
//       signer.link<&Patch.Collection{NonFungibleToken.CollectionPublic, Patch.PatchCollectionPublic}>(Patch.CollectionPublicPath, target: Patch.CollectionStoragePath)
//     }
  
//     self.signerFlunksCollection = signer.borrow<&Flunks.Collection>(from: Flunks.CollectionStoragePath)
//       ?? panic("Could not borrow a reference to the owner's collection")
//   }

//   execute {
//     BackpackMinter.claimBackPack(tokenID: tokenID, signer: self.authSigner, setID: setID)
//   }
// }`;

// const productionTx = `import NonFungibleToken from 0x1d7e57aa55817448
// import Backpack from 0x807c3d470888cc48
// import Patch from 0x807c3d470888cc48
// import Flunks from 0x807c3d470888cc48
// import BackpackMinter from 0x807c3d470888cc48


// transaction(tokenID: UInt64, setID: UInt64) {

//   let authSigner: AuthAccount
//   let signerFlunksCollection: &Flunks.Collection

//   prepare(signer: AuthAccount) {
//     self.authSigner = signer

//     // if the account doesn't already have a Backpack collection
//     if signer.borrow<&Backpack.Collection>(from: Backpack.CollectionStoragePath) == nil {
//       let collection <- Backpack.createEmptyCollection()
//       signer.save(<-collection, to: Backpack.CollectionStoragePath)
//       signer.link<&Backpack.Collection{NonFungibleToken.CollectionPublic, Backpack.BackpackCollectionPublic}>(Backpack.CollectionPublicPath, target: Backpack.CollectionStoragePath)
//     }

//     // if the account doesn't already have a Patch collection
//     if signer.borrow<&Patch.Collection>(from: Patch.CollectionStoragePath) == nil {
//       let collection <- Patch.createEmptyCollection()
//       signer.save(<-collection, to: Patch.CollectionStoragePath)
//       signer.link<&Patch.Collection{NonFungibleToken.CollectionPublic, Patch.PatchCollectionPublic}>(Patch.CollectionPublicPath, target: Patch.CollectionStoragePath)
//     }
  
//     self.signerFlunksCollection = signer.borrow<&Flunks.Collection>(from: Flunks.CollectionStoragePath)
//       ?? panic("Could not borrow a reference to the owner's collection")
//   }

//   execute {
//     BackpackMinter.claimBackPack(tokenID: tokenID, signer: self.authSigner, setID: setID)
//   }
// }`;

// const TRANSACTION: string =
//   process.env.NEXT_PUBLIC_REMOTE_NODE === "production"
//     ? productionTx
//     : stagingTx;

// interface ClaimBackpackOpts {
//   tokenID: number;
// }

// // prettier-ignore
// export function claimBackpack({tokenID}: ClaimBackpackOpts) {
//     // return tx(
//     //   {
//     //     cadence: TRANSACTION as string,
//     //     args: (arg, t) => [
//     //       arg(tokenID, t.UInt64),
//     //       arg(1, t.UInt64),
//     //     ],
//     //     authorizations: [fcl.authz],
//     //     limit: 1000,
//     //   },
//     //   opts,
//     // )

//     return async () => await fcl.mutate({
//       cadence: TRANSACTION as string,
//         args: (arg, t) => [
//           arg(tokenID, t.UInt64),
//           arg(1, t.UInt64),
//         ],
//         authorizations: [fcl.authz],
//         limit: 1000,
//     })
//   }
