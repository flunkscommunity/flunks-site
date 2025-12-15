const fcl = require("@onflow/fcl");

// Configure FCL for mainnet
fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

const CODE = `import HybridCustodyHelper from 0x807c3d470888cc48

access(all) fun main(address: Address): {String: [UInt64]} {
    let flunksTokenIds = HybridCustodyHelper.getFlunksTokenIDsFromAllLinkedAccounts(ownerAddress: address)
    let backpackTokenIds = HybridCustodyHelper.getBackpackTokenIDsFromAllLinkedAccounts(ownerAddress: address)

    return {
        "flunks": flunksTokenIds,
        "backpack": backpackTokenIds
    }
}`;

// Test with a known wallet address - replace with yours or a known holder
const TEST_ADDRESS = process.argv[2] || "0xeff7b7c7795a4d56";

async function testBackpackFetch() {
  console.log("🔍 Testing backpack fetch for address:", TEST_ADDRESS);
  console.log("================================================");
  
  try {
    const result = await fcl.send([
      fcl.script(CODE),
      fcl.args([fcl.arg(TEST_ADDRESS, fcl.t.Address)])
    ]).then(fcl.decode);
    
    console.log("\n✅ SUCCESS! Raw result:", JSON.stringify(result, null, 2));
    console.log("\n📊 Summary:");
    console.log("   Flunks count:", result?.flunks?.length || 0);
    console.log("   Backpacks count:", result?.backpack?.length || 0);
    
    if (result?.flunks?.length > 0) {
      console.log("   Flunks IDs (first 10):", result.flunks.slice(0, 10));
    }
    if (result?.backpack?.length > 0) {
      console.log("   Backpack IDs (first 10):", result.backpack.slice(0, 10));
    }
    
    return result;
  } catch (error) {
    console.error("\n❌ ERROR:", error.message);
    console.error("Full error:", error);
    return null;
  }
}

testBackpackFetch();
