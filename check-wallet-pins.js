const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

const wallet = process.argv[2] || "0x7a2a518ba1c5d6e3"; // Your wallet

async function checkWallet() {
  console.log(`\n🔍 Checking wallet: ${wallet}\n`);

  // Check SemesterZeroV3 Collection (0xce9dd43888d99574)
  console.log('═══════════════════════════════════════════════════');
  console.log('📦 SEMESTER ZERO V3 (0xce9dd43888d99574)');
  console.log('═══════════════════════════════════════════════════');
  try {
    const v3Result = await fcl.query({
      cadence: `
        import SemesterZeroV3 from 0xce9dd43888d99574
        import MetadataViews from 0x1d7e57aa55817448

        access(all) fun main(address: Address): [{String: AnyStruct}] {
          let account = getAccount(address)
          
          let collectionRef = account.capabilities
            .borrow<&SemesterZeroV3.Collection>(/public/SemesterZeroV3Collection)
          
          if collectionRef == nil {
            return []
          }
          
          var results: [{String: AnyStruct}] = []
          
          for id in collectionRef!.getIDs() {
            let nft = collectionRef!.borrowSemesterZeroNFT(id: id)
            if nft != nil {
              var name = "Unknown"
              var image = ""
              if let display = nft!.resolveView(Type<MetadataViews.Display>()) {
                let d = display as! MetadataViews.Display
                name = d.name
                if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                  image = httpFile.url
                }
              }
              
              results.append({
                "id": id,
                "name": name,
                "image": image,
                "evolutionTier": nft!.evolutionTier,
                "location": nft!.location,
                "metadata": nft!.metadata
              })
            }
          }
          return results
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    if (v3Result.length === 0) {
      console.log('❌ No NFTs found in SemesterZeroV3 collection');
    } else {
      console.log(`✅ Found ${v3Result.length} NFT(s):`);
      v3Result.forEach((nft, i) => {
        console.log(`\n  [${i+1}] ID: ${nft.id}`);
        console.log(`      Name: ${nft.name}`);
        console.log(`      Tier: ${nft.evolutionTier}`);
        console.log(`      Location: ${nft.location}`);
        console.log(`      Image: ${nft.image ? nft.image.substring(0, 60) + '...' : 'NONE'}`);
        console.log(`      Metadata:`, nft.metadata);
      });
    }
  } catch (e) {
    console.log('❌ SemesterZeroV3 error:', e.message);
  }

  // Check SemesterZero Collection at 0x807c3d470888cc48
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📦 SEMESTER ZERO (0x807c3d470888cc48)');
  console.log('═══════════════════════════════════════════════════');
  try {
    const szResult = await fcl.query({
      cadence: `
        import SemesterZero from 0x807c3d470888cc48
        import NonFungibleToken from 0x1d7e57aa55817448
        
        access(all) fun main(address: Address): [UInt64] {
          let account = getAccount(address)
          
          // Try Chapter5Collection path
          if let collection = account.capabilities.borrow<&{NonFungibleToken.Collection}>(SemesterZero.Chapter5CollectionPublicPath) {
            return collection.getIDs()
          }
          return []
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    if (szResult.length === 0) {
      console.log('❌ No NFTs found in SemesterZero Chapter5 collection');
    } else {
      console.log(`✅ Found ${szResult.length} NFT(s): IDs =`, szResult);
    }
  } catch (e) {
    console.log('❌ SemesterZero error:', e.message);
  }
}

checkWallet().catch(console.error);
