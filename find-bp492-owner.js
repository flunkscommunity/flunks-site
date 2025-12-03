// Try to find Backpack #492 owner using direct blockchain query
const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

// Check several possible Dapper wallet addresses that CityofDreams might have
// These often follow patterns or were created during NFT purchases
const POSSIBLE_DAPPER_WALLETS = [
    // Common Dapper wallet pattern addresses to try
    // Usually these are child accounts created by Dapper
    '0xe6921cb46b38c9eb', // example pattern
    '0xead892083b3e2c6c', // Dapper account example
];

// Script to get backpack info if it exists
const GET_BP_INFO = `
import Backpack from 0x807c3d470888cc48
import MetadataViews from 0x1d7e57aa55817448

access(all) fun main(address: Address, tokenID: UInt64): {String: AnyStruct}? {
    let account = getAccount(address)
    let collectionRef = account.capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
    
    if collectionRef == nil {
        return nil
    }
    
    let ids = collectionRef!.getIDs()
    if !ids.contains(tokenID) {
        return nil
    }
    
    let nft = collectionRef!.borrowNFT(tokenID)
    if nft == nil {
        return nil
    }
    
    var result: {String: AnyStruct} = {}
    result["found"] = true
    result["tokenID"] = tokenID
    
    if let display = nft!.resolveView(Type<MetadataViews.Display>()) as? MetadataViews.Display {
        result["name"] = display.name
        result["description"] = display.description
        result["thumbnail"] = display.thumbnail.uri()
    }
    
    return result
}
`;

// Let's also check the most recent transfers of BP #492
async function searchForBackpack492() {
    console.log('🔍 Searching for Backpack #492...');
    console.log('');
    
    // Check FlowScan for the NFT details
    console.log('📡 You can also check directly on FlowScan:');
    console.log('   https://www.flowscan.io/nft/A.807c3d470888cc48.Backpack.NFT/492');
    console.log('');
    
    // Try to find in any child account we can think of
    // Actually, let's use a different approach - query the Backpack contract admin
    const ADMIN_ADDRESS = '0x807c3d470888cc48';
    
    // Check if the backpack even exists at all
    const CHECK_EXISTS = `
import Backpack from 0x807c3d470888cc48

access(all) fun main(): UInt64 {
    return Backpack.totalSupply
}
`;

    try {
        const totalSupply = await fcl.query({
            cadence: CHECK_EXISTS,
            args: (arg, t) => []
        });
        
        console.log('📊 Backpack Contract Info:');
        console.log('   Total Supply:', totalSupply);
        console.log('');
        
        if (parseInt(totalSupply) > 492) {
            console.log('✅ Backpack #492 should exist (total supply is higher)');
        } else {
            console.log('❌ Backpack #492 might not exist (total supply lower than 493)');
        }
        
    } catch (e) {
        console.log('Error:', e.message?.substring(0, 100));
    }
    
    console.log('');
    console.log('💡 DIAGNOSIS:');
    console.log('================');
    console.log('');
    console.log('The user CityofDreams can see Backpack #492 on Flowty, but it');
    console.log('does NOT appear in their HybridCustody linked accounts.');
    console.log('');
    console.log('This means the backpack is likely in a DAPPER WALLET that:');
    console.log('1. Is associated with their Flow account via Dapper');
    console.log('2. But is NOT linked via HybridCustody protocol');
    console.log('');
    console.log('🔧 SOLUTION for the user:');
    console.log('');
    console.log('Option A: Link Dapper Account via HybridCustody');
    console.log('   - Go to the Dapper Wallet settings');
    console.log('   - Link the Dapper child account to their main Flow wallet');
    console.log('   - Use HybridCustody linking process');
    console.log('');
    console.log('Option B: Transfer Backpack to Main Wallet');
    console.log('   - Use Flowty or another marketplace');
    console.log('   - Transfer BP #492 from Dapper to main Flow wallet');
    console.log('');
    console.log('Option C: Check Lost & Found (if applicable)');
    console.log('   - Some NFTs end up in Lost & Found if sent incorrectly');
    console.log('   - Check https://lostAndFound.flow.com with their wallet');
}

searchForBackpack492();
