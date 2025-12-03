// Diagnostic script to check Backpack #492 issue
const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

// Check Backpack #492 specifically
const CHECK_BACKPACK_SCRIPT = `
import Backpack from 0x807c3d470888cc48
import MetadataViews from 0x1d7e57aa55817448
import NonFungibleToken from 0x1d7e57aa55817448

access(all) fun main(address: Address): {String: AnyStruct} {
    let account = getAccount(address)
    
    // Try to borrow the Backpack collection
    let collectionRef = account.capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
    
    if collectionRef == nil {
        return {
            "error": "No Backpack collection found",
            "hasCollection": false
        }
    }
    
    let ids = collectionRef!.getIDs()
    
    var backpackData: {String: AnyStruct} = {}
    
    // Check for backpack 492 specifically
    if ids.contains(UInt64(492)) {
        let nft = collectionRef!.borrowNFT(UInt64(492))
        
        if nft != nil {
            // Try to get display info
            let displayView = nft!.resolveView(Type<MetadataViews.Display>())
            
            if let display = displayView as? MetadataViews.Display {
                backpackData["id"] = UInt64(492)
                backpackData["name"] = display.name
                backpackData["description"] = display.description
                backpackData["thumbnail"] = display.thumbnail.uri()
            }
            
            // Try to get traits
            let traitsView = nft!.resolveView(Type<MetadataViews.Traits>())
            if let traits = traitsView as? MetadataViews.Traits {
                var traitData: [{String: String}] = []
                for trait in traits.traits {
                    traitData.append({
                        "name": trait.name,
                        "value": trait.value as? String ?? "unknown"
                    })
                }
                backpackData["traits"] = traitData
            }
        }
    }
    
    return {
        "hasCollection": true,
        "totalBackpacks": ids.length,
        "backpackIds": ids,
        "has492": ids.contains(UInt64(492)),
        "backpack492Data": backpackData
    }
}
`;

// Check HybridCustody to find the actual owner/holder
const CHECK_HYBRID_CUSTODY = `
import HybridCustodyHelper from 0x807c3d470888cc48

access(all) fun main(address: Address): {String: AnyStruct} {
    let backpackTokenIds = HybridCustodyHelper.getBackpackTokenIDsFromAllLinkedAccounts(ownerAddress: address)
    let flunksTokenIds = HybridCustodyHelper.getFlunksTokenIDsFromAllLinkedAccounts(ownerAddress: address)
    
    var has492 = false
    for id in backpackTokenIds {
        if id == UInt64(492) {
            has492 = true
            break
        }
    }
    
    var holder: Address? = nil
    if has492 {
        holder = HybridCustodyHelper.getChildAccountAddressHoldingBackpackTokenId(ownerAddress: address, tokenID: UInt64(492))
    }
    
    return {
        "backpackTokenIds": backpackTokenIds,
        "flunksTokenIds": flunksTokenIds,
        "has492": has492,
        "holderOf492": holder
    }
}
`;

async function checkBackpack492() {
    // CityofDreams wallet from the screenshot
    const cityOfDreamsWallet = '0x6e5d12b1735caa83';
    
    console.log('🎒 Backpack #492 Diagnostic');
    console.log('='.repeat(50));
    console.log('');
    console.log('📱 Checking wallet:', cityOfDreamsWallet);
    console.log('');
    
    // First check HybridCustody
    console.log('🔗 Step 1: Checking HybridCustody links...');
    try {
        const hybridResult = await fcl.query({
            cadence: CHECK_HYBRID_CUSTODY,
            args: (arg, t) => [arg(cityOfDreamsWallet, t.Address)]
        });
        
        console.log('   Backpack IDs found:', hybridResult.backpackTokenIds);
        console.log('   Has Backpack #492:', hybridResult.has492);
        console.log('   Holder of #492:', hybridResult.holderOf492 || 'Not found');
        console.log('   Flunks IDs found:', hybridResult.flunksTokenIds?.length || 0);
        console.log('');
        
        if (hybridResult.holderOf492) {
            // Now check the actual holder wallet
            console.log('🔍 Step 2: Checking holder wallet for backpack data...');
            const holderResult = await fcl.query({
                cadence: CHECK_BACKPACK_SCRIPT,
                args: (arg, t) => [arg(hybridResult.holderOf492, t.Address)]
            });
            
            console.log('   Has Collection:', holderResult.hasCollection);
            console.log('   Total Backpacks:', holderResult.totalBackpacks);
            console.log('   Has #492:', holderResult.has492);
            console.log('');
            
            if (holderResult.backpack492Data && Object.keys(holderResult.backpack492Data).length > 0) {
                console.log('   📋 Backpack #492 Data:');
                console.log('      Name:', holderResult.backpack492Data.name);
                console.log('      Description:', holderResult.backpack492Data.description);
                console.log('      Thumbnail:', holderResult.backpack492Data.thumbnail);
                console.log('');
                console.log('   ✅ Backpack #492 metadata is accessible!');
            } else {
                console.log('   ⚠️ No metadata returned for backpack #492');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('');
        console.log('Possible issues:');
        console.log('1. Contract interaction error');
        console.log('2. Wallet configuration issue');
        console.log('3. NFT in limbo state');
    }
    
    // Also check direct collection on main wallet
    console.log('');
    console.log('🔍 Step 3: Checking direct collection on main wallet...');
    try {
        const directResult = await fcl.query({
            cadence: CHECK_BACKPACK_SCRIPT,
            args: (arg, t) => [arg(cityOfDreamsWallet, t.Address)]
        });
        
        console.log('   Has Collection:', directResult.hasCollection);
        console.log('   Total Backpacks:', directResult.totalBackpacks);
        console.log('   Backpack IDs:', directResult.backpackIds);
        console.log('   Has #492 directly:', directResult.has492);
        
    } catch (error) {
        console.log('   Error checking direct collection:', error.message);
    }
}

checkBackpack492();
