import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `
// This script will get a list of all the stake information for a particular address and its linked account(s)
import HybridCustodyHelper from 0x807c3d470888cc48

// mainnet test run: flow scripts execute ./cadence/scripts/GUM/get-owner-token-ids.cdc 0xeff7b7c7795a4d56 --network mainnet

access(all) fun main(address: Address): {String: [UInt64]} {
    let flunksTokenIds = HybridCustodyHelper.getFlunksTokenIDsFromAllLinkedAccounts(ownerAddress: address)
    let backpackTokenIds = HybridCustodyHelper.getBackpackTokenIDsFromAllLinkedAccounts(ownerAddress: address)

    return {
        "flunks": flunksTokenIds,
        "backpack": backpackTokenIds
    }
}`;

export const getWalletInfoShallow = async (address: string) => {
  if (!address) return Promise.resolve(null);

  return await fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(address, t.Address)])])
    .then(fcl.decode);
};
