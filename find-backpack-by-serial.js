const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  const targetSerials = [8953, 8979, 9043, 4891, 7340, 492];
  
  console.log("Looking for backpacks with specific serial numbers...\n");
  console.log("This requires scanning all NFTs - may take a moment...\n");
  
  // We need to find which NFT has which serial
  // Let's check a sample range of NFT IDs and see their serials
  
  // Query batches of NFTs to build a serial->id map
  const result = await fcl.query({
    cadence: `
      import Backpack from 0x807c3d470888cc48
      import MetadataViews from 0x1d7e57aa55817448
      
      access(all) fun main(targetSerials: [UInt64]): [{String: AnyStruct}] {
        // We need to find who owns NFTs with these serials
        // Unfortunately we have to iterate through owners
        
        // Let's check the admin/contract account for any matching
        let adminAddr = Address(0x807c3d470888cc48)
        let account = getAccount(adminAddr)
        var results: [{String: AnyStruct}] = []
        
        if let ref = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
          let ids = ref.getIDs()
          for id in ids {
            if let nft = ref.borrowBackpack(id: id) {
              if let serialView = nft.resolveView(Type<MetadataViews.Serial>()) {
                let s = serialView as! MetadataViews.Serial
                
                // Check if this serial is one we're looking for
                if targetSerials.contains(s.number) {
                  var data: {String: AnyStruct} = {}
                  data["nftId"] = id
                  data["serial"] = s.number
                  
                  // Get image URL
                  if let display = nft.resolveView(Type<MetadataViews.Display>()) {
                    let d = display as! MetadataViews.Display
                    data["name"] = d.name
                    data["description"] = d.description
                    
                    // Get thumbnail
                    if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                      data["imageURL"] = httpFile.url
                    }
                    if let ipfsFile = d.thumbnail as? MetadataViews.IPFSFile {
                      data["ipfsCID"] = ipfsFile.cid
                      data["ipfsPath"] = ipfsFile.path
                    }
                  }
                  
                  // Get traits
                  if let traits = nft.resolveView(Type<MetadataViews.Traits>()) {
                    let t = traits as! MetadataViews.Traits
                    var traitDict: {String: AnyStruct} = {}
                    for trait in t.traits {
                      traitDict[trait.name] = trait.value
                    }
                    data["traits"] = traitDict
                  }
                  
                  results.append(data)
                }
              }
            }
          }
        }
        return results
      }
    `,
    args: (arg, t) => [arg(targetSerials.map(s => String(s)), t.Array(t.UInt64))]
  });
  
  console.log("Results from admin account:", JSON.stringify(result, null, 2));
  
  // The serials might be owned by other people, let's check the actual NFT data structure
  console.log("\n--- Checking backpack metadata structure ---");
  
  // Get sample metadata to understand image URL pattern
  const sampleResult = await fcl.query({
    cadence: `
      import Backpack from 0x807c3d470888cc48
      import MetadataViews from 0x1d7e57aa55817448
      
      access(all) fun main(addr: Address): {String: AnyStruct}? {
        let account = getAccount(addr)
        
        if let ref = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
          let ids = ref.getIDs()
          if ids.length > 0 {
            if let nft = ref.borrowBackpack(id: ids[0]) {
              var data: {String: AnyStruct} = {}
              data["nftId"] = ids[0]
              
              if let serial = nft.resolveView(Type<MetadataViews.Serial>()) {
                data["serial"] = (serial as! MetadataViews.Serial).number
              }
              
              if let display = nft.resolveView(Type<MetadataViews.Display>()) {
                let d = display as! MetadataViews.Display
                data["name"] = d.name
                data["description"] = d.description
                data["thumbnailType"] = d.thumbnail.getType().identifier
                
                if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                  data["imageURL"] = httpFile.url
                }
              }
              
              // Get all supported views
              let views = nft.getViews()
              data["supportedViews"] = views
              
              return data
            }
          }
        }
        return nil
      }
    `,
    args: (arg, t) => [arg("0x807c3d470888cc48", t.Address)]
  });
  
  console.log("\nSample Backpack Full Metadata:");
  console.log(JSON.stringify(sampleResult, null, 2));
}

main().catch(console.error);
