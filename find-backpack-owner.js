// Find the actual owner of Backpack #492
const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

// Use Flowty/NFT Catalog to find NFT owner via events
const FIND_OWNER_SCRIPT = `
import Backpack from 0x807c3d470888cc48
import NonFungibleToken from 0x1d7e57aa55817448

// Unfortunately can't query events directly in Cadence scripts,
// but we can try known addresses

access(all) fun checkWalletForBackpack(address: Address, targetId: UInt64): Bool {
    let account = getAccount(address)
    let collectionRef = account.capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
    
    if collectionRef == nil {
        return false
    }
    
    let ids = collectionRef!.getIDs()
    return ids.contains(targetId)
}

access(all) fun main(addresses: [Address], targetId: UInt64): {Address: Bool} {
    var results: {Address: Bool} = {}
    
    for address in addresses {
        results[address] = checkWalletForBackpack(address: address, targetId: targetId)
    }
    
    return results
}
`;

async function findBackpack492Owner() {
    console.log('🔍 Searching for Backpack #492 owner...');
    console.log('');
    
    // Known wallets to check
    const walletsToCheck = [
        '0x6e5d12b1735caa83', // CityofDreams
        '0x807c3d470888cc48', // Main contract/admin
        '0x4ab2327b5e1f3ca1', // roto_flow
        '0xc4ab4a06ade1fd0f', // Flunkster
        '0x92629c2a389dd8a8', // tinkerbell
        '0xbfffec679fff3a94', // Another test wallet
        '0xce9dd43888d99574', // Contract deployer
    ];
    
    try {
        const result = await fcl.query({
            cadence: FIND_OWNER_SCRIPT,
            args: (arg, t) => [
                arg(walletsToCheck, t.Array(t.Address)),
                arg('492', t.UInt64)
            ]
        });
        
        console.log('Results for Backpack #492:');
        for (const [address, hasIt] of Object.entries(result)) {
            if (hasIt) {
                console.log(`  ✅ FOUND in: ${address}`);
            } else {
                console.log(`  ❌ Not in: ${address}`);
            }
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
    
    console.log('');
    console.log('📝 Note: Backpack might be:');
    console.log('   1. In a linked/child account not listed here');
    console.log('   2. Listed on a marketplace (escrowed)');
    console.log('   3. Transferred to a different wallet');
    console.log('');
    console.log('🔗 Check on Flowty: https://www.flowty.io/collection/0x807c3d470888cc48/Backpack');
}

findBackpack492Owner();
