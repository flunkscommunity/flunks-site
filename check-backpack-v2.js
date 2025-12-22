const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  // Get a real owner's backpack and check its serial
  // Let's use a known address with backpacks
  
  // First find someone with backpacks by checking a few addresses
  const testAddresses = [
    "0x807c3d470888cc48", // contract deployer
    "0x86fc5953c2946a34", // random
    "0xe467b9dd11fa00df", // try a common flunks address
  ];
  
  for (const addr of testAddresses) {
    try {
      const result = await fcl.query({
        cadence: `
          import Backpack from 0x807c3d470888cc48
          import MetadataViews from 0x1d7e57aa55817448
          
          access(all) fun main(addr: Address): [{String: AnyStruct}] {
            let account = getAccount(addr)
            var results: [{String: AnyStruct}] = []
            
            if let ref = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
              let ids = ref.getIDs()
              var count = 0
              for id in ids {
                if count >= 3 { break }
                if let nft = ref.borrowBackpack(id: id) {
                  var data: {String: AnyStruct} = {}
                  data["nftId"] = id
                  
                  // Try to get Serial view
                  if let serialView = nft.resolveView(Type<MetadataViews.Serial>()) {
                    let s = serialView as! MetadataViews.Serial
                    data["serial"] = s.number
                  }
                  
                  // Get Display
                  if let display = nft.resolveView(Type<MetadataViews.Display>()) {
                    let d = display as! MetadataViews.Display
                    data["name"] = d.name
                  }
                  
                  // Try ExternalURL
                  if let ext = nft.resolveView(Type<MetadataViews.ExternalURL>()) {
                    let e = ext as! MetadataViews.ExternalURL
                    data["externalURL"] = e.url
                  }
                  
                  results.append(data)
                }
                count = count + 1
              }
            }
            return results
          }
        `,
        args: (arg, t) => [arg(addr, t.Address)]
      });
      
      if (result.length > 0) {
        console.log("\n✅ Found backpacks at", addr);
        console.log("Sample backpacks:");
        for (const bp of result) {
          console.log("  NFT ID:", bp.nftId, "| Serial:", bp.serial, "| Name:", bp.name);
          if (bp.externalURL) console.log("    URL:", bp.externalURL);
        }
        break;
      }
    } catch (e) {
      console.log("Address", addr, "error:", e.message?.substring(0, 60));
    }
  }
}

main().catch(console.error);
