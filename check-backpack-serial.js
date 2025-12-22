const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  console.log("Checking Backpack serial numbers vs IDs...\n");
  
  // Try to get backpack by checking a few IDs and seeing their serial numbers
  // Query the first few backpacks from someone who has them
  
  // Let's check specific known NFT IDs and see their metadata
  const testIds = [1, 100, 500, 1000, 5000, 6000, 6779];
  
  for (const id of testIds) {
    try {
      const result = await fcl.query({
        cadence: `
          import Backpack from 0x807c3d470888cc48
          import MetadataViews from 0x1d7e57aa55817448
          
          access(all) fun main(id: UInt64): {String: AnyStruct}? {
            // Try to borrow directly from contract storage if possible
            // or query via serial view
            
            // Check if serial exists
            let serial = Backpack.getSerialView(id)
            if serial == nil { return nil }
            
            var result: {String: AnyStruct} = {}
            result["nftId"] = id
            result["serial"] = serial
            return result
          }
        `,
        args: (arg, t) => [arg(String(id), t.UInt64)]
      });
      console.log("NFT ID", id, "->", result);
    } catch (e) {
      // Try alternate method
      try {
        const result = await fcl.query({
          cadence: `
            import Backpack from 0x807c3d470888cc48
            
            access(all) fun main(serial: UInt64): UInt64? {
              return Backpack.getIDFromSerial(serial)
            }
          `,
          args: (arg, t) => [arg(String(id), t.UInt64)]
        });
        console.log("Serial", id, "-> NFT ID:", result);
      } catch (e2) {
        console.log("ID", id, "error:", e.message?.substring(0, 80));
      }
    }
  }
  
  // Now let's try the serial numbers from the screenshot
  console.log("\n--- Testing Serial Numbers from Flowty ---");
  const serials = [8953, 8979, 9043];
  
  for (const serial of serials) {
    try {
      const nftId = await fcl.query({
        cadence: `
          import Backpack from 0x807c3d470888cc48
          
          access(all) fun main(serial: UInt64): UInt64? {
            return Backpack.getIDFromSerial(serial)
          }
        `,
        args: (arg, t) => [arg(String(serial), t.UInt64)]
      });
      console.log("Serial #" + serial, "-> NFT ID:", nftId);
    } catch (e) {
      console.log("Serial", serial, "- method not found, trying alternate...");
    }
  }
}

main().catch(console.error);
