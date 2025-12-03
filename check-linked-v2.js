// Simpler check for linked accounts
const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

const CHECK_SIMPLE = `
import HybridCustodyHelper from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48

access(all) fun main(parent: Address): {String: [UInt64]} {
    let backpackTokenIds = HybridCustodyHelper.getBackpackTokenIDsFromAllLinkedAccounts(ownerAddress: parent)
    let flunksTokenIds = HybridCustodyHelper.getFlunksTokenIDsFromAllLinkedAccounts(ownerAddress: parent)
    
    return {
        "backpacks": backpackTokenIds,
        "flunks": flunksTokenIds
    }
}
`;

// Check if 492 exists and where
const CHECK_HOLDER = `
import HybridCustodyHelper from 0x807c3d470888cc48

access(all) fun main(parent: Address, tokenID: UInt64): Address? {
    return HybridCustodyHelper.getChildAccountAddressHoldingBackpackTokenId(ownerAddress: parent, tokenID: tokenID)
}
`;

async function check() {
    const parentWallet = '0x6e5d12b1735caa83';
    
    console.log('🔗 Checking CityofDreams wallet:', parentWallet);
    console.log('');
    
    // Step 1: Get all backpacks
    const result = await fcl.query({
        cadence: CHECK_SIMPLE,
        args: (arg, t) => [arg(parentWallet, t.Address)]
    });
    
    console.log('📊 Total Backpacks found:', result.backpacks?.length || 0);
    console.log('📊 Total Flunks found:', result.flunks?.length || 0);
    console.log('');
    
    // Check if 492 is in the list
    const has492 = result.backpacks?.includes('492') || result.backpacks?.some(id => parseInt(id) === 492);
    console.log('🎒 Has Backpack #492 in linked accounts:', has492);
    
    if (!has492) {
        console.log('');
        console.log('⚠️ Backpack #492 NOT found in any linked accounts!');
        console.log('');
        console.log('Possible explanations:');
        console.log('1. Backpack was transferred OUT of this wallet');
        console.log('2. Backpack is in a child account that is NOT linked via HybridCustody');
        console.log('3. The backpack shown on Flowty belongs to a DIFFERENT wallet');
        console.log('');
        console.log('📝 The user sees it on Flowty because Flowty indexes all NFTs,');
        console.log('   but the wallet connection on flunks.net uses HybridCustody');
        console.log('   which may not see this particular child account.');
    }
    
    // Step 2: Try to find holder anyway
    console.log('');
    console.log('🔍 Trying to find holder of #492...');
    try {
        const holder = await fcl.query({
            cadence: CHECK_HOLDER,
            args: (arg, t) => [arg(parentWallet, t.Address), arg('492', t.UInt64)]
        });
        
        if (holder) {
            console.log('   Found holder:', holder);
        } else {
            console.log('   No holder found via HybridCustody');
        }
    } catch (e) {
        console.log('   Error checking holder:', e.message?.substring(0, 100));
    }
}

check();
