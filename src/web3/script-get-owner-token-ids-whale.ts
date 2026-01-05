import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

// Ensure FCL configuration is loaded
import "../config/fcl";

const CODE = `import HybridCustodyHelper from 0x807c3d470888cc48

// mainnet test run: flow scripts execute ./cadence/scripts/GUM/get-owner-token-ids.cdc 0xeff7b7c7795a4d56 --network mainnet

access(all) fun main(address: Address): {String: [UInt64]} {
    let flunksTokenIds = HybridCustodyHelper.getFlunksTokenIDsFromAllLinkedAccounts(ownerAddress: address)
    let backpackTokenIds = HybridCustodyHelper.getBackpackTokenIDsFromAllLinkedAccounts(ownerAddress: address)

    return {
        "flunks": flunksTokenIds,
        "backpack": backpackTokenIds
    }
}`;

export const getOwnerTokenIdsWhale = async (address: string) => {
  if (!address) return Promise.resolve(null);

  // Normalize address format - ensure it starts with 0x and is lowercase
  let normalizedAddress = address.trim().toLowerCase();
  
  // Handle CAIP-10 format (e.g., "flow:mainnet:0x123...")
  if (normalizedAddress.includes(':')) {
    const parts = normalizedAddress.split(':');
    normalizedAddress = parts[parts.length - 1]; // Get the last part (the actual address)
  }
  
  // Ensure 0x prefix
  if (!normalizedAddress.startsWith('0x')) {
    normalizedAddress = '0x' + normalizedAddress;
  }
  
  // Validate address format (should be 0x followed by 16 hex characters)
  const addressRegex = /^0x[a-f0-9]{16}$/;
  if (!addressRegex.test(normalizedAddress)) {
    console.error('❌ Invalid Flow address format:', address, '-> normalized:', normalizedAddress);
    return Promise.resolve({ flunks: [], backpack: [] });
  }

  console.log('🌊 FCL Configuration check - Access Node:', fcl.config.get('accessNode.api'));
  console.log('🔍 Getting Flunks for address:', normalizedAddress, '(original:', address, ')');

  return await fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(normalizedAddress, t.Address)])])
    .then(fcl.decode)
    .then(result => {
      console.log('🎯 Raw FCL result:', result);
      console.log('🎯 Flunks array:', result?.flunks);
      console.log('🎯 Flunks count:', result?.flunks?.length);
      console.log('🎯 Backpack array:', result?.backpack);
      console.log('🎯 Backpack count:', result?.backpack?.length);
      return result;
    })
    .catch(error => {
      console.error('❌ FCL Script Error:', error);
      throw error;
    });
};
