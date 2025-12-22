const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  // Get multiple backpack images to see the URL pattern
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
            if count >= 10 { break }
            if let nft = ref.borrowBackpack(id: id) {
              var data: {String: AnyStruct} = {}
              data["nftId"] = id
              
              if let serial = nft.resolveView(Type<MetadataViews.Serial>()) {
                data["serial"] = (serial as! MetadataViews.Serial).number
              }
              
              if let display = nft.resolveView(Type<MetadataViews.Display>()) {
                let d = display as! MetadataViews.Display
                if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                  data["imageURL"] = httpFile.url
                }
              }
              
              // Get traits for this backpack
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
            count = count + 1
          }
        }
        return results
      }
    `,
    args: (arg, t) => [arg("0x807c3d470888cc48", t.Address)]
  });
  
  console.log("Backpack Images and Traits:\n");
  for (const bp of result) {
    console.log("NFT ID:", bp.nftId, "| Serial:", bp.serial);
    console.log("  Image:", bp.imageURL);
    console.log("  Traits:", JSON.stringify(bp.traits));
    console.log("");
  }
}

main().catch(console.error);
