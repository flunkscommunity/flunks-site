// Check Backpack MetadataViews on Flow mainnet
const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function checkBackpackMetadataViews() {
  console.log('🎒 Checking Backpack MetadataViews Support');
  console.log('==========================================\n');
  
  // Check a specific backpack - let's use one we know exists
  const testBackpackId = "158"; // From the list above
  const testWallet = "0x6e5d12b1735caa83";
  
  const script = `
    import Backpack from 0x807c3d470888cc48
    import MetadataViews from 0x1d7e57aa55817448
    import NonFungibleToken from 0x1d7e57aa55817448
    
    access(all) fun main(address: Address, tokenID: UInt64): {String: AnyStruct} {
      var result: {String: AnyStruct} = {}
      
      // Try to borrow the collection
      let collection = getAccount(address).capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
      
      if collection == nil {
        result["error"] = "Could not borrow collection"
        return result
      }
      
      result["collectionFound"] = true
      
      // Get the NFT
      let nft = collection!.borrowNFT(tokenID)
      
      if nft == nil {
        result["error"] = "Could not borrow NFT"
        return result
      }
      
      result["nftFound"] = true
      
      // Check supported views
      let supportedViews = nft!.getViews()
      result["supportedViewsCount"] = supportedViews.length
      
      var viewNames: [String] = []
      for view in supportedViews {
        viewNames.append(view.identifier)
      }
      result["supportedViews"] = viewNames
      
      // Try to get Display
      let displayView = nft!.resolveView(Type<MetadataViews.Display>())
      if displayView != nil {
        let display = displayView! as! MetadataViews.Display
        result["hasDisplay"] = true
        result["displayName"] = display.name
        result["displayDescription"] = display.description
        result["thumbnailUrl"] = display.thumbnail.uri()
      } else {
        result["hasDisplay"] = false
      }
      
      // Try to get Traits
      let traitsView = nft!.resolveView(Type<MetadataViews.Traits>())
      if traitsView != nil {
        let traits = traitsView! as! MetadataViews.Traits
        result["hasTraits"] = true
        result["traitsCount"] = traits.traits.length
        
        var traitNames: [String] = []
        for trait in traits.traits {
          traitNames.append(trait.name)
        }
        result["traitNames"] = traitNames
      } else {
        result["hasTraits"] = false
      }
      
      // Try to get Edition
      let editionView = nft!.resolveView(Type<MetadataViews.Edition>())
      if editionView != nil {
        let edition = editionView! as! MetadataViews.Edition
        result["hasEdition"] = true
        result["editionNumber"] = edition.number
      } else {
        result["hasEdition"] = false
      }
      
      return result
    }
  `;
  
  try {
    const result = await fcl.query({
      cadence: script,
      args: (arg, t) => [
        arg(testWallet, t.Address),
        arg(testBackpackId, t.UInt64)
      ]
    });
    
    console.log('✅ Backpack MetadataViews Check Results:');
    console.log('----------------------------------------');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.hasDisplay) {
      console.log('\n📸 Display View:');
      console.log(`   Name: ${result.displayName}`);
      console.log(`   Description: ${result.displayDescription}`);
      console.log(`   Thumbnail: ${result.thumbnailUrl}`);
    }
    
    if (result.hasTraits) {
      console.log(`\n🏷️  Traits (${result.traitsCount}):`);
      console.log(`   ${result.traitNames.join(', ')}`);
    }
    
    if (result.supportedViews) {
      console.log('\n📋 Supported Views:');
      result.supportedViews.forEach(v => console.log(`   - ${v}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkBackpackMetadataViews();
