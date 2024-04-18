// import * as fcl from "@onflow/fcl";
// import * as t from "@onflow/types";

// const CODE = `import NonFungibleToken from 0x1d7e57aa55817448
// import Flunks from 0x807c3d470888cc48
// import Backpack from 0x807c3d470888cc48
// import Patch from 0x807c3d470888cc48

// pub fun main(address: Address): Bool {

//   return getAccount(address).getCapability<&Flunks.Collection{Flunks.FlunksCollectionPublic}>(Flunks.CollectionPublicPath).borrow() != nil
// && getAccount(address).getCapability<&Backpack.Collection{Backpack.BackpackCollectionPublic}>(Backpack.CollectionPublicPath).borrow() != nil
// && getAccount(address).getCapability<&Patch.Collection{Patch.PatchCollectionPublic}>(Patch.CollectionPublicPath).borrow() != nil
// }
// `;

// export async function fetchCollectionExists({ address }) {
//   if (!address) return Promise.resolve(null);
//   return fcl
//     .send([fcl.script(CODE), fcl.args([fcl.arg(address, t.Address)])])
//     .then(fcl.decode);
// }
