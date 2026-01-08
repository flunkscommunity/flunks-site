const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

async function checkWalletPins() {
  const wallet = "0xe327cdf0677677d8";
  
  console.log(`\n🔍 Checking wallet: ${wallet}\n`);
  
  // Check SemesterZeroV3 collection
  const v3Script = `
    import SemesterZeroV3 from 0xce9dd43888d99574
    import NonFungibleToken from 0x1d7e57aa55817448
    import MetadataViews from 0x1d7e57aa55817448

    access(all) struct NFTInfo {
      access(all) let id: UInt64
      access(all) let name: String
      access(all) let description: String
      access(all) let thumbnail: String
      access(all) let tier: String
      
      init(id: UInt64, name: String, description: String, thumbnail: String, tier: String) {
        self.id = id
        self.name = name
        self.description = description
        self.thumbnail = thumbnail
        self.tier = tier
      }
    }

    access(all) fun main(address: Address): [NFTInfo] {
      let account = getAccount(address)
      let results: [NFTInfo] = []
      
      // Try to borrow the collection
      if let collection = account.capabilities.borrow<&{NonFungibleToken.Collection}>(
        /public/SemesterZeroV3Collection
      ) {
        let ids = collection.getIDs()
        log("Found ".concat(ids.length.toString()).concat(" NFTs in SemesterZeroV3Collection"))
        
        for id in ids {
          if let nft = collection.borrowNFT(id) {
            var name = "Unknown"
            var description = ""
            var thumbnail = ""
            var tier = "unknown"
            
            // Try to get display metadata
            if let display = nft.resolveView(Type<MetadataViews.Display>()) {
              if let d = display as? MetadataViews.Display {
                name = d.name
                description = d.description
                if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                  thumbnail = httpFile.url
                }
              }
            }
            
            // Try to get traits for tier info
            if let traits = nft.resolveView(Type<MetadataViews.Traits>()) {
              if let t = traits as? MetadataViews.Traits {
                for trait in t.traits {
                  if trait.name == "Tier" || trait.name == "tier" {
                    tier = trait.value as? String ?? "unknown"
                  }
                }
              }
            }
            
            results.append(NFTInfo(
              id: id,
              name: name,
              description: description,
              thumbnail: thumbnail,
              tier: tier
            ))
          }
        }
      } else {
        log("No SemesterZeroV3Collection found")
      }
      
      return results
    }
  `;
  
  try {
    console.log("📦 Checking SemesterZeroV3 collection...");
    const v3Result = await fcl.query({
      cadence: v3Script,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    if (v3Result && v3Result.length > 0) {
      console.log(`\n✅ Found ${v3Result.length} NFTs in SemesterZeroV3:\n`);
      v3Result.forEach((nft, i) => {
        console.log(`  ${i + 1}. ID: ${nft.id}`);
        console.log(`     Name: ${nft.name}`);
        console.log(`     Tier: ${nft.tier}`);
        console.log(`     Description: ${nft.description.substring(0, 100)}...`);
        console.log(`     Thumbnail: ${nft.thumbnail}`);
        console.log("");
      });
    } else {
      console.log("❌ No NFTs found in SemesterZeroV3Collection");
    }
  } catch (error) {
    console.error("Error checking SemesterZeroV3:", error.message);
  }
  
  // Also check if there's a different path
  const altPathScript = `
    access(all) fun main(address: Address): [String] {
      let account = getAccount(address)
      let paths: [String] = []
      
      // Check common paths
      account.forEachPublic(fun (path: PublicPath, type: Type): Bool {
        let pathStr = path.toString()
        if pathStr.toLower().contains("semester") || pathStr.toLower().contains("pin") || pathStr.toLower().contains("zero") {
          paths.append(pathStr)
        }
        return true
      })
      
      return paths
    }
  `;
  
  try {
    console.log("\n🔍 Checking for related public paths...");
    const paths = await fcl.query({
      cadence: altPathScript,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    if (paths && paths.length > 0) {
      console.log("Found paths:", paths);
    } else {
      console.log("No semester/pin related paths found");
    }
  } catch (error) {
    console.log("Path check error (may be expected):", error.message);
  }
}

checkWalletPins().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
