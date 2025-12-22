const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  // Query NFT ID 4691 owned by 0x3e10544d2155e91c
  const ownerAddress = "0x3e10544d2155e91c";
  const nftId = "4691";
  
  console.log(`Querying Backpack NFT ID ${nftId} from ${ownerAddress}...\n`);
  
  const result = await fcl.query({
    cadence: `
      import Backpack from 0x807c3d470888cc48
      import MetadataViews from 0x1d7e57aa55817448
      
      access(all) fun main(addr: Address, id: UInt64): {String: AnyStruct}? {
        let account = getAccount(addr)
        
        if let ref = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
          if let nft = ref.borrowBackpack(id: id) {
            var data: {String: AnyStruct} = {}
            data["nftId"] = id
            
            // Get Serial
            if let serial = nft.resolveView(Type<MetadataViews.Serial>()) {
              data["serial"] = (serial as! MetadataViews.Serial).number
            }
            
            // Get Display with image
            if let display = nft.resolveView(Type<MetadataViews.Display>()) {
              let d = display as! MetadataViews.Display
              data["name"] = d.name
              data["description"] = d.description
              if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                data["imageURL"] = httpFile.url
              }
            }
            
            // Get Traits
            if let traits = nft.resolveView(Type<MetadataViews.Traits>()) {
              let t = traits as! MetadataViews.Traits
              var traitDict: {String: AnyStruct} = {}
              for trait in t.traits {
                traitDict[trait.name] = trait.value
              }
              data["traits"] = traitDict
            }
            
            return data
          }
        }
        return nil
      }
    `,
    args: (arg, t) => [arg(ownerAddress, t.Address), arg(nftId, t.UInt64)]
  });
  
  console.log("Backpack #" + nftId + " Data:");
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
