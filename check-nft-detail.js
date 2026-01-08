const fcl = require('@onflow/fcl');
fcl.config({ 'accessNode.api': 'https://rest-mainnet.onflow.org', 'flow.network': 'mainnet' });

const wallet = '0xe327216d843357f1';

async function check() {
  console.log('Fetching NFT details for wallet:', wallet);
  
  const result = await fcl.query({
    cadence: `
      import SemesterZeroV3 from 0xce9dd43888d99574
      import MetadataViews from 0x1d7e57aa55817448

      access(all) fun main(address: Address): [{String: AnyStruct}] {
        let account = getAccount(address)
        
        let collectionRef = account.capabilities
          .borrow<&SemesterZeroV3.Collection>(/public/SemesterZeroV3Collection)
        
        if collectionRef == nil {
          return []
        }
        
        var results: [{String: AnyStruct}] = []
        
        for id in collectionRef!.getIDs() {
          let nft = collectionRef!.borrowSemesterZeroNFT(id: id)
          if nft != nil {
            var name = "Unknown"
            var image = ""
            if let display = nft!.resolveView(Type<MetadataViews.Display>()) {
              let d = display as! MetadataViews.Display
              name = d.name
              if let httpFile = d.thumbnail as? MetadataViews.HTTPFile {
                image = httpFile.url
              }
            }
            
            results.append({
              "id": id,
              "name": name,
              "image": image,
              "evolutionTier": nft!.evolutionTier,
              "location": nft!.location,
              "metadata": nft!.metadata
            })
          }
        }
        return results
      }
    `,
    args: (arg, t) => [arg(wallet, t.Address)]
  });
  
  console.log('\nNFT Data:');
  console.log(JSON.stringify(result, null, 2));
}

check();
