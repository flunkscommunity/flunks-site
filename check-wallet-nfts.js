const fcl = require('@onflow/fcl');

fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

const wallet = '0xfd99ed9505ca7531';

async function checkWallet() {
  console.log(`\n🔍 Checking wallet: ${wallet}\n`);

  // 1. Check Flunks
  try {
    const flunksResult = await fcl.query({
      cadence: `
        import Flunks from 0x807c3d470888cc48
        
        access(all) fun main(address: Address): [UInt64] {
          let account = getAccount(address)
          if let collection = account.capabilities.borrow<&{Flunks.FlunksCollectionPublic}>(/public/FlunksCollection) {
            return collection.getIDs()
          }
          return []
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    console.log('📦 Flunks IDs:', flunksResult);
    console.log('   Count:', flunksResult.length);
  } catch (e) {
    console.log('❌ Flunks error:', e.message);
  }

  // 2. Check Backpacks
  try {
    const backpacksResult = await fcl.query({
      cadence: `
        import Backpack from 0x807c3d470888cc48
        
        access(all) fun main(address: Address): [UInt64] {
          let account = getAccount(address)
          if let collection = account.capabilities.borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection) {
            return collection.getIDs()
          }
          return []
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    console.log('\n🎒 Backpack IDs:', backpacksResult);
    console.log('   Count:', backpacksResult.length);
  } catch (e) {
    console.log('❌ Backpack error:', e.message);
  }

  // 3. Check what the website script returns
  try {
    const { getOwnerTokenIdsWhale } = require('./src/web3/script-get-owner-token-ids-whale');
    const whaleResult = await getOwnerTokenIdsWhale(wallet);
    console.log('\n🐋 Whale script result:');
    console.log('   Flunks:', whaleResult?.flunks?.length || 0);
    console.log('   Backpacks:', whaleResult?.backpack?.length || 0);
  } catch (e) {
    console.log('❌ Whale script error:', e.message);
  }

  // 4. Check metadata fetch
  try {
    const { getOwnerTokenStakeInfoWhale } = require('./src/web3/script-get-owner-token-stake-info-whale');
    
    // Get first few flunks metadata
    const flunksResult = await fcl.query({
      cadence: `
        import Flunks from 0x807c3d470888cc48
        access(all) fun main(address: Address): [UInt64] {
          let account = getAccount(address)
          if let collection = account.capabilities.borrow<&{Flunks.FlunksCollectionPublic}>(/public/FlunksCollection) {
            return collection.getIDs()
          }
          return []
        }
      `,
      args: (arg, t) => [arg(wallet, t.Address)]
    });
    
    if (flunksResult.length > 0) {
      const testIds = flunksResult.slice(0, 3).map(Number);
      console.log('\n🔬 Testing metadata fetch for Flunks:', testIds);
      const metadata = await getOwnerTokenStakeInfoWhale(wallet, 'flunks', testIds);
      console.log('   Metadata result:', metadata?.length || 0, 'items');
      if (metadata && metadata[0]) {
        console.log('   Sample:', metadata[0].MetadataViewsDisplay?.name);
      }
    }
  } catch (e) {
    console.log('❌ Metadata error:', e.message);
  }
}

checkWallet().then(() => process.exit(0));
