const fcl = require('@onflow/fcl');

fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

const wallet = '0xfd99ed9505ca7531';

async function checkMetadata() {
  console.log(`\n🔍 Checking metadata for wallet: ${wallet}\n`);

  // Check Flunks with full metadata
  try {
    const result = await fcl.query({
      cadence: `
        import Flunks from 0x807c3d470888cc48
        import MetadataViews from 0x1d7e57aa55817448
        
        access(all) struct FlunkData {
          access(all) let id: UInt64
          access(all) let name: String
          access(all) let image: String
          
          init(id: UInt64, name: String, image: String) {
            self.id = id
            self.name = name
            self.image = image
          }
        }
        
        access(all) fun main(address: Address): [FlunkData] {
          let account = getAccount(address)
          let results: [FlunkData] = []
          
          if let collection = account.capabilities.borrow<&{Flunks.FlunksCollectionPublic}>(/public/FlunksCollection) {
            let ids = collection.getIDs()
            var count = 0
            for id in ids {
              if count >= 5 { break }
              if let nft = collection.borrowFlunk(id: id) {
                if let display = nft.resolveView(Type<MetadataViews.Display>()) as? MetadataViews.Display {
                  let imageUrl = display.thumbnail.uri()
                  results.append(FlunkData(
                    id: id,
                    name: display.name,
                    image: imageUrl
                  ))
                }
              }
              count = count + 1
            }
          }
          return results
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    console.log('📦 First 5 Flunks with metadata:');
    for (const flunk of result) {
      console.log(`   #${flunk.id}: ${flunk.name}`);
      console.log(`      Image: ${flunk.image.substring(0, 60)}...`);
    }
  } catch (e) {
    console.log('❌ Flunks metadata error:', e.message);
  }

  // Check Backpacks with full metadata
  try {
    const result = await fcl.query({
      cadence: `
        import Backpack from 0x807c3d470888cc48
        import MetadataViews from 0x1d7e57aa55817448
        
        access(all) struct BackpackData {
          access(all) let id: UInt64
          access(all) let name: String
          access(all) let image: String
          
          init(id: UInt64, name: String, image: String) {
            self.id = id
            self.name = name
            self.image = image
          }
        }
        
        access(all) fun main(address: Address): [BackpackData] {
          let account = getAccount(address)
          let results: [BackpackData] = []
          
          if let collection = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
            let ids = collection.getIDs()
            var count = 0
            for id in ids {
              if count >= 5 { break }
              if let nft = collection.borrowBackpack(id: id) {
                if let display = nft.resolveView(Type<MetadataViews.Display>()) as? MetadataViews.Display {
                  let imageUrl = display.thumbnail.uri()
                  results.append(BackpackData(
                    id: id,
                    name: display.name,
                    image: imageUrl
                  ))
                }
              }
              count = count + 1
            }
          }
          return results
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    console.log('\n🎒 First 5 Backpacks with metadata:');
    for (const bp of result) {
      console.log(`   #${bp.id}: ${bp.name}`);
      console.log(`      Image: ${bp.image.substring(0, 60)}...`);
    }
  } catch (e) {
    console.log('❌ Backpacks metadata error:', e.message);
  }
}

checkMetadata().then(() => process.exit(0));
