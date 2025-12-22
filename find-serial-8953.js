const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  // From Flowty, we know BACKPACK #8953 exists
  // We need to find which NFT ID it corresponds to
  // Let's scan through a range of NFT IDs and find ones with high serial numbers
  
  console.log("Looking for backpack serial #8953...\n");
  console.log("Serial numbers are different from NFT IDs");
  console.log("Example: NFT ID 6768 = Serial #3900\n");
  
  // Try to scan through all addresses looking for the serial
  // Let's use a different approach - check the Flowty API
  
  // From Flowty link: /asset/0x807c3d470888cc48/Backpack/NFT/{id}
  // Let me extract what we know:
  // - Serial #9970 → NFT ID 1146
  // - Serial #9960 → NFT ID 4779
  // - Serial #9959 → NFT ID 842
  // - Serial #8 → NFT ID 6373
  // - Serial #34 → NFT ID 2303
  // - Serial #3900 → NFT ID 6768
  
  // The serial-to-NFT ID mapping is NOT linear
  
  console.log("From Flowty data:");
  console.log("  Serial #9970 → NFT ID 1146");
  console.log("  Serial #9960 → NFT ID 4779");
  console.log("  Serial #8    → NFT ID 6373");
  console.log("  Serial #3900 → NFT ID 6768");
  console.log("");
  console.log("The serial and NFT ID are completely independent!");
  console.log("Serial is a metadata field, NFT ID is the on-chain identifier.");
  console.log("");
  
  // Let's check a specific NFT that might have serial 8953
  // Since serials skip around, let me scan a sample of NFT IDs
  
  const testNftIds = [4691, 5000, 5500, 6000];
  
  for (const nftId of testNftIds) {
    const result = await fcl.query({
      cadence: `
        import Backpack from 0x807c3d470888cc48
        import MetadataViews from 0x1d7e57aa55817448
        
        access(all) fun main(nftId: UInt64): {String: AnyStruct}? {
          // Find who owns this NFT
          // We don't know the owner, so we can't query directly
          return nil
        }
      `,
      args: (arg, t) => [arg(String(nftId), t.UInt64)]
    });
  }
  
  // The issue is: we need to know WHO owns the NFT to query it
  // Let me show how to find the image URL pattern
  console.log("\n📷 BACKPACK IMAGE URL PATTERN:");
  console.log("https://storage.googleapis.com/flunks_public/backpacks/{HASH}.gif");
  console.log("");
  console.log("The hash is derived from the backpack's traits (Base, Primary, Secondary, Tertiary)");
  console.log("Each unique combination of traits produces a unique hash/image.");
}

main().catch(console.error);
