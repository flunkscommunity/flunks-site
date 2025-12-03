// Check for linked/child accounts that might hold Backpack #492
const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

// Check HybridCustody for child accounts
const CHECK_CHILD_ACCOUNTS = `
import HybridCustody from 0xd8a7e05a7ac670c0

access(all) fun main(parent: Address): [Address] {
    let acct = getAuthAccount<auth(Storage) &Account>(parent)
    
    // Try to get the HybridCustody Manager
    let manager = acct.storage.borrow<&HybridCustody.Manager>(from: HybridCustody.ManagerStoragePath)
    
    if manager == nil {
        return []
    }
    
    return manager!.getChildAddresses()
}
`;

// Alternative - check using the helper
const CHECK_VIA_HELPER = `
import HybridCustodyHelper from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48

access(all) fun main(parent: Address): {String: AnyStruct} {
    // Get ALL backpack token IDs from all linked accounts
    let backpackTokenIds = HybridCustodyHelper.getBackpackTokenIDsFromAllLinkedAccounts(ownerAddress: parent)
    
    // For each backpack, find which child account holds it
    var holders: {UInt64: Address?} = {}
    
    for tokenID in backpackTokenIds {
        let holder = HybridCustodyHelper.getChildAccountAddressHoldingBackpackTokenId(ownerAddress: parent, tokenID: tokenID)
        holders[tokenID] = holder
    }
    
    // Check if there are any child accounts that we can detect
    var uniqueHolders: [Address] = []
    for tokenID in backpackTokenIds {
        if let holder = holders[tokenID] {
            var found = false
            for existing in uniqueHolders {
                if existing == holder {
                    found = true
                    break
                }
            }
            if !found {
                uniqueHolders.append(holder)
            }
        }
    }
    
    return {
        "totalBackpacks": backpackTokenIds.length,
        "uniqueHolders": uniqueHolders,
        "sampleHolders": holders
    }
}
`;

async function checkLinkedAccounts() {
    const parentWallet = '0x6e5d12b1735caa83'; // CityofDreams
    
    console.log('🔗 Checking linked accounts for:', parentWallet);
    console.log('');
    
    try {
        const result = await fcl.query({
            cadence: CHECK_VIA_HELPER,
            args: (arg, t) => [arg(parentWallet, t.Address)]
        });
        
        console.log('📊 Results:');
        console.log('   Total Backpacks via HybridCustody:', result.totalBackpacks);
        console.log('   Unique Child Account Holders:', result.uniqueHolders);
        console.log('');
        
        // Check if any of these child accounts hold backpack 492
        if (result.uniqueHolders && result.uniqueHolders.length > 0) {
            console.log('🔍 Checking child accounts for Backpack #492...');
            
            for (const childAddress of result.uniqueHolders) {
                const checkScript = `
import Backpack from 0x807c3d470888cc48

access(all) fun main(address: Address): [UInt64] {
    let account = getAccount(address)
    let collectionRef = account.capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
    
    if collectionRef == nil {
        return []
    }
    
    return collectionRef!.getIDs()
}
`;
                const ids = await fcl.query({
                    cadence: checkScript,
                    args: (arg, t) => [arg(childAddress, t.Address)]
                });
                
                const has492 = ids.includes('492') || ids.includes(492);
                console.log(`   ${childAddress}: ${ids.length} backpacks, has #492: ${has492}`);
                if (ids.length < 20) {
                    console.log(`      IDs: ${ids.join(', ')}`);
                }
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.log('');
        console.log('This might mean:');
        console.log('1. No HybridCustody setup');
        console.log('2. Backpack is in a different type of linked account');
    }
}

checkLinkedAccounts();
