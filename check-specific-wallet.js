const fcl = require('@onflow/fcl');

fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

const wallet = '0xfd99ed9505ca7531';

async function check() {
  console.log(`\n🔍 Deep check for: ${wallet}\n`);

  // Check if token IDs are returned correctly (what the website uses)
  try {
    const result = await fcl.query({
      cadence: `
        import Flunks from 0x807c3d470888cc48
        import Backpack from 0x807c3d470888cc48
        
        access(all) struct TokenIds {
          access(all) let flunks: [String]
          access(all) let backpack: [String]
          
          init(flunks: [String], backpack: [String]) {
            self.flunks = flunks
            self.backpack = backpack
          }
        }
        
        access(all) fun main(address: Address): TokenIds {
          let flunksIds: [String] = []
          let backpackIds: [String] = []
          
          let acct = getAccount(address)
          
          if let flunksCol = acct.capabilities.borrow<&Flunks.Collection>(Flunks.CollectionPublicPath) {
            for id in flunksCol.getIDs() {
              flunksIds.append(id.toString())
            }
          }
          
          if let backpackCol = acct.capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath) {
            for id in backpackCol.getIDs() {
              backpackIds.append(id.toString())
            }
          }
          
          return TokenIds(flunks: flunksIds, backpack: backpackIds)
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    console.log('✅ Token IDs fetch (same as website):');
    console.log('   Flunks:', result.flunks.length, 'items');
    console.log('   Backpacks:', result.backpack.length, 'items');
    console.log('   First few Flunk IDs:', result.flunks.slice(0,5).join(', '));
    console.log('   First few Backpack IDs:', result.backpack.slice(0,5).join(', '));
  } catch (e) {
    console.log('❌ Error:', e.message);
  }
}

check().then(() => process.exit(0));
