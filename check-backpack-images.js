const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

// Backpack contract address
const BACKPACK_CONTRACT = "0x807c3d470888cc48";

async function checkBackpackMetadata(nftId) {
  try {
    const result = await fcl.query({
      cadence: `
        import Backpack from 0x807c3d470888cc48
        import MetadataViews from 0x1d7e57aa55817448

        access(all) fun main(nftId: UInt64): {String: AnyStruct}? {
          // Get the public collection
          let account = getAccount(0x807c3d470888cc48)
          
          // Try to get NFT info from the contract itself
          let info: {String: AnyStruct} = {}
          
          // Check total supply and basic info
          info["totalSupply"] = Backpack.totalSupply
          info["nftId"] = nftId
          
          return info
        }
      `,
      args: (arg, t) => [arg(nftId.toString(), t.UInt64)]
    });
    
    console.log(`\nBackpack #${nftId}:`, JSON.stringify(result, null, 2));
    return result;
  } catch (error) {
    console.error(`Error checking Backpack #${nftId}:`, error.message);
  }
}

// Check the specific backpacks from the screenshot
async function main() {
  console.log("Checking Backpack NFT metadata on Flow mainnet...\n");
  
  // First let's see what the contract looks like
  const contractInfo = await fcl.query({
    cadence: `
      import Backpack from 0x807c3d470888cc48
      
      access(all) fun main(): {String: AnyStruct} {
        return {
          "totalSupply": Backpack.totalSupply
        }
      }
    `
  });
  
  console.log("Contract Info:", JSON.stringify(contractInfo, null, 2));
  
  // Try to get metadata views
  const backpackIds = [8953, 4891, 7340];
  
  for (const id of backpackIds) {
    try {
      // Query using MetadataViews if available
      const metadata = await fcl.query({
        cadence: `
          import Backpack from 0x807c3d470888cc48
          import MetadataViews from 0x1d7e57aa55817448
          import NonFungibleToken from 0x1d7e57aa55817448

          access(all) fun main(nftId: UInt64): {String: String}? {
            // Find who owns this NFT and get its metadata
            // This is a simplified check - we need to find the owner first
            return nil
          }
        `,
        args: (arg, t) => [arg(id.toString(), t.UInt64)]
      });
      console.log(`Backpack #${id} metadata:`, metadata);
    } catch (e) {
      console.log(`Backpack #${id}: Could not fetch directly - ${e.message}`);
    }
  }
}

main().catch(console.error);
