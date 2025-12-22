const fcl = require('@onflow/fcl');

fcl.config({
  'accessNode.api': 'https://rest-mainnet.onflow.org',
  'flow.network': 'mainnet'
});

async function checkAllBackpackImages() {
  const getIdsScript = `
    import Backpack from 0x807c3d470888cc48
    import NonFungibleToken from 0x1d7e57aa55817448
    
    access(all) fun main(address: Address): [UInt64] {
      let account = getAccount(address)
      let cap = account.capabilities.get<&{NonFungibleToken.CollectionPublic}>(/public/BackpackCollection)
      if let ref = cap.borrow() {
        return ref.getIDs()
      }
      return []
    }
  `;
  
  const metadataScript = `
    import Backpack from 0x807c3d470888cc48
    import MetadataViews from 0x1d7e57aa55817448
    
    access(all) fun main(address: Address, id: UInt64): AnyStruct? {
      let account = getAccount(address)
      let cap = account.capabilities.get<&Backpack.Collection>(/public/BackpackCollection)
      
      if let ref = cap.borrow() {
        if let nft = ref.borrowNFT(id) {
          let backpackRef = nft as! &Backpack.NFT
          let display = backpackRef.resolveView(Type<MetadataViews.Display>())
          return display
        }
      }
      return nil
    }
  `;
  
  const cityWallet = '0x6e5d12b1735caa83';
  const backpackIds = await fcl.query({
    cadence: getIdsScript,
    args: (arg, t) => [arg(cityWallet, t.Address)]
  });
  
  console.log('Checking ALL', backpackIds.length, 'backpacks for missing images...');
  console.log('');
  
  let missingCount = 0;
  const missingIds = [];
  
  for (let i = 0; i < backpackIds.length; i++) {
    const id = backpackIds[i];
    const display = await fcl.query({
      cadence: metadataScript,
      args: (arg, t) => [arg(cityWallet, t.Address), arg(id, t.UInt64)]
    });
    
    if (!display || !display.thumbnail || !display.thumbnail.url) {
      console.log('❌ Backpack #' + id + ': MISSING IMAGE!');
      missingCount++;
      missingIds.push(id);
    }
    
    // Progress every 20
    if ((i + 1) % 20 === 0) {
      console.log('Checked ' + (i + 1) + '/' + backpackIds.length + '...');
    }
  }
  
  console.log('');
  console.log('=== RESULT ===');
  console.log('Total backpacks:', backpackIds.length);
  console.log('Missing images:', missingCount);
  
  if (missingCount === 0) {
    console.log('✅ All backpacks have image URLs in metadata!');
  } else {
    console.log('Missing IDs:', missingIds);
  }
  
  // Print all backpack IDs sorted
  console.log('');
  console.log('All backpack IDs owned by CityofDreams:');
  console.log(backpackIds.map(Number).sort((a,b) => a-b));
}

checkAllBackpackImages();

// --- Flowty API Lookup by Serial Number ---
const fetch = require('node-fetch');

async function getBackpackBySerial(serial) {
  // Flowty API endpoint for Backpack collection
  // Serial is a property, not the NFT ID
  const url = `https://api.flowty.io/v1/collections/0x807c3d470888cc48/Backpack/assets?serial=${serial}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Flowty API error: ${res.status}`);
    }
    const data = await res.json();
    if (data && data.assets && data.assets.length > 0) {
      const asset = data.assets[0];
      return {
        nftId: asset.nftId,
        serial: asset.serial,
        image: asset.imageUrl || asset.image_url,
        owner: asset.owner,
        traits: asset.traits,
        name: asset.name,
        description: asset.description
      };
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error fetching from Flowty API:', e.message);
    return null;
  }
}

// Example usage: lookup Backpack by serial number
async function demoFlowtyLookup() {
  const serial = 8953; // Change to any serial you want
  const result = await getBackpackBySerial(serial);
  if (result) {
    console.log(`\nFlowty API: Backpack with serial #${serial}`);
    console.log(result);
  } else {
    console.log(`\nNo backpack found on Flowty with serial #${serial}`);
  }
}

// Uncomment to run demo
demoFlowtyLookup();
