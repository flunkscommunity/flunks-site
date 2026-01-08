const fcl = require("@onflow/fcl");

fcl.config({
  "accessNode.api": "https://rest-mainnet.onflow.org",
  "flow.network": "mainnet"
});

async function checkCollections() {
  const wallet = "0xe327cdf0677677d8";
  
  console.log(`\n🔍 Checking wallet: ${wallet}\n`);
  
  // Check multiple possible collection paths
  const paths = [
    { name: "SemesterZeroV3Collection", path: "/public/SemesterZeroV3Collection" },
    { name: "SemesterZeroCollection", path: "/public/SemesterZeroCollection" },
    { name: "FlunksCollection", path: "/public/FlunksCollection" },
    { name: "BackpackCollection", path: "/public/BackpackCollection" }
  ];
  
  for (const p of paths) {
    const script = `
      import NonFungibleToken from 0x1d7e57aa55817448
      
      access(all) fun main(address: Address): [UInt64] {
        let account = getAccount(address)
        
        if let collection = account.capabilities.borrow<&{NonFungibleToken.Collection}>(
          ${p.path}
        ) {
          return collection.getIDs()
        }
        
        return []
      }
    `;
    
    try {
      const ids = await fcl.query({
        cadence: script,
        args: (arg, t) => [arg(wallet, t.Address)]
      });
      
      if (ids && ids.length > 0) {
        console.log(`✅ ${p.name}: ${ids.length} NFTs - IDs: ${ids.slice(0, 10).join(", ")}${ids.length > 10 ? "..." : ""}`);
      } else {
        console.log(`❌ ${p.name}: Empty or not found`);
      }
    } catch (e) {
      console.log(`⚠️  ${p.name}: Error - ${e.message.substring(0, 80)}...`);
    }
  }
  
  // Check Flowty API for all NFTs
  console.log("\n📡 Checking Flowty API for all Flow NFTs...");
  try {
    const response = await fetch(`https://flowty.io/api/user/${wallet}/nfts?limit=100`);
    if (response.ok) {
      const data = await response.json();
      if (data.nfts && data.nfts.length > 0) {
        console.log(`Found ${data.nfts.length} NFTs via Flowty API:`);
        data.nfts.forEach((nft, i) => {
          if (nft.name?.toLowerCase().includes("pin") || nft.name?.toLowerCase().includes("paradise") || nft.name?.toLowerCase().includes("motel") || nft.name?.toLowerCase().includes("semester")) {
            console.log(`  📌 ${nft.name} (ID: ${nft.id}) - Collection: ${nft.contract?.name || "unknown"}`);
          }
        });
      }
    }
  } catch (e) {
    console.log("Flowty API error:", e.message);
  }
}

checkCollections().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
