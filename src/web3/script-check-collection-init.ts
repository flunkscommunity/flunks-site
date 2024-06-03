import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import NonFungibleToken from 0x1d7e57aa55817448
import Flunks from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48
import Patch from 0x807c3d470888cc48

pub fun main(address: Address): Bool {
  let flunksCollection: &Flunks.Collection{NonFungibleToken.CollectionPublic}? = getAccount(address)
      .getCapability<&Flunks.Collection{NonFungibleToken.CollectionPublic}>(Flunks.CollectionPublicPath).borrow()

  let backpackCollection: &Backpack.Collection{NonFungibleToken.CollectionPublic}? = getAccount(address)
      .getCapability<&Backpack.Collection{NonFungibleToken.CollectionPublic}>(Backpack.CollectionPublicPath).borrow()
  
  return flunksCollection != nil && backpackCollection != nil
}
`;

export const isWalletCollectionInitialized = async (address: string) => {
  if (!address) return Promise.resolve(null);

  return await fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(address, t.Address)])])
    .then(fcl.decode);
};
