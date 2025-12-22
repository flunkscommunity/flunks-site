const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  console.log("Checking Backpack NFT images...\n");
  
  // Total supply check
  const supply = await fcl.query({
    cadence: `
      import Backpack from 0x807c3d470888cc48
      access(all) fun main(): UInt64 { return Backpack.totalSupply }
    `
  });
  console.log("Total Backpack Supply:", supply);
  console.log("\n⚠️ The IDs 8953, 4891, 7340 are HIGHER than supply", supply);
  console.log("These IDs don't exist in the Backpack contract!\n");
  
  // Let's query a known owner for their backpack metadata
  // Try the contract deployer address
  const ownerAddress = "0x807c3d470888cc48";
  
  const ids = await fcl.query({
    cadence: `
      import Backpack from 0x807c3d470888cc48
      
      access(all) fun main(addr: Address): [UInt64] {
        let account = getAccount(addr)
        if let ref = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
          return ref.getIDs()
        }
        return []
      }
    `,
    args: (arg, t) => [arg(ownerAddress, t.Address)]
  });
  
  console.log(`Address ${ownerAddress} has ${ids.length} backpacks`);
  if (ids.length > 0) {
    console.log("Sample IDs:", ids.slice(0, 5));
    
    // Get metadata for first backpack
    const metadata = await fcl.query({
      cadence: `
        import Backpack from 0x807c3d470888cc48
        import MetadataViews from 0x1d7e57aa55817448
        
        access(all) fun main(addr: Address, id: UInt64): {String: AnyStruct}? {
          let account = getAccount(addr)
          if let ref = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
            if let nft = ref.borrowBackpack(id: id) {
              var result: {String: AnyStruct} = {}
              
              // Get Display
              if let display = nft.resolveView(Type<MetadataViews.Display>()) {
                let d = display as! MetadataViews.Display
                result["name"] = d.name
                result["description"] = d.description
                
                // Get thumbnail URL
                if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                  result["thumbnailURL"] = httpFile.url
                }
                if let ipfsFile = d.thumbnail as? MetadataViews.IPFSFile {
                  result["thumbnailCID"] = ipfsFile.cid
                  result["thumbnailPath"] = ipfsFile.path
                }
              }
              
              // Get NFT metadata directly if available
              result["id"] = nft.id
              
              return result
            }
          }
          return nil
        }
      `,
      args: (arg, t) => [arg(ownerAddress, t.Address), arg(ids[0], t.UInt64)]
    });
    
    console.log("\n📷 Backpack #" + ids[0] + " Metadata:");
    console.log(JSON.stringify(metadata, null, 2));
  }
}

main().catch(console.error);
