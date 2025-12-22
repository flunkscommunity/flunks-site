const fcl = require("@onflow/fcl");

fcl.config()
  .put("accessNode.api", "https://rest-mainnet.onflow.org")
  .put("flow.network", "mainnet");

async function main() {
  console.log("Checking Backpack contract details...\n");
  
  // First get contract info
  const contractInfo = await fcl.query({
    cadence: `
      import Backpack from 0x807c3d470888cc48
      
      access(all) fun main(): {String: AnyStruct} {
        return {
          "totalSupply": Backpack.totalSupply
        }
      }
    `
  });
  
  console.log("Total Supply:", contractInfo.totalSupply);
  console.log("\nThe backpack IDs 8953, 4891, 7340 are HIGHER than total supply (6780)");
  console.log("This means these NFTs don't exist in the Backpack contract.\n");
  
  // Let's check a valid backpack - like #100
  console.log("Let's check a valid backpack ID within range...\n");
  
  // Try to get the backpack display/metadata from a sample
  try {
    const metadata = await fcl.query({
      cadence: `
        import Backpack from 0x807c3d470888cc48
        import MetadataViews from 0x1d7e57aa55817448

        access(all) fun main(): AnyStruct {
          // Get info about the contract/collection structure
          let account = getAccount(0x807c3d470888cc48)
          
          // Check if there's a public collection to query
          let cap = account.capabilities.get<&{MetadataViews.ResolverCollection}>(/public/BackpackCollection)
          
          return {
            "hasPublicCap": cap.check(),
            "contractAddress": "0x807c3d470888cc48"
          }
        }
      `
    });
    console.log("Contract capability check:", JSON.stringify(metadata, null, 2));
  } catch (e) {
    console.log("Error:", e.message);
  }

  // Check what images are set in the contract by looking at display metadata
  console.log("\nLooking for image URL patterns in the Backpack contract...");
  
  // The images you see on Flowty are coming from the NFT's Display view
  // Let's try to find a wallet that owns a backpack and check its metadata
  
  // Check a known Flunks address for backpacks
  const testAddresses = [
    "0x807c3d470888cc48", // Contract address - might hold some
    "0xce9dd43888d99574", // Flunks project address
  ];
  
  for (const addr of testAddresses) {
    try {
      const nfts = await fcl.query({
        cadence: `
          import Backpack from 0x807c3d470888cc48
          import MetadataViews from 0x1d7e57aa55817448

          access(all) fun main(address: Address): [UInt64] {
            let account = getAccount(address)
            
            let collectionRef = account.capabilities
              .borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection)
            
            if collectionRef == nil {
              return []
            }
            
            return collectionRef!.getIDs()
          }
        `,
        args: (arg, t) => [arg(addr, t.Address)]
      });
      
      console.log(`\n${addr} owns backpacks:`, nfts.slice(0, 5), nfts.length > 5 ? `... (${nfts.length} total)` : "");
      
      // If they have backpacks, get the display for one
      if (nfts && nfts.length > 0) {
        const display = await fcl.query({
          cadence: `
            import Backpack from 0x807c3d470888cc48
            import MetadataViews from 0x1d7e57aa55817448

            access(all) fun main(address: Address, id: UInt64): AnyStruct? {
              let account = getAccount(address)
              
              let collectionRef = account.capabilities
                .borrow<&{Backpack.BackpackCollectionPublic}>(/public/BackpackCollection)
              
              if collectionRef == nil {
                return nil
              }
              
              let nft = collectionRef!.borrowBackpack(id: id)
              if nft == nil {
                return nil
              }
              
              let display = nft!.resolveView(Type<MetadataViews.Display>())
              return display
            }
          `,
          args: (arg, t) => [arg(addr, t.Address), arg(nfts[0], t.UInt64)]
        });
        
        console.log(`\nBackpack #${nfts[0]} Display Metadata:`, JSON.stringify(display, null, 2));
      }
    } catch (e) {
      console.log(`${addr}: ${e.message}`);
    }
  }
}

main().catch(console.error);
