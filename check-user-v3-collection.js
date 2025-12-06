import * as fcl from '@onflow/fcl';

fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

// Try to find what SemesterZeroV3 actually exports
const script = `
import SemesterZeroV3 from 0xce9dd43888d99574

access(all) fun main(address: Address): {String: AnyStruct} {
  let account = getAccount(address)
  
  // Try to check what collection exists
  let hasV3Storage = account.storage.type(at: /storage/SemesterZeroV3Collection) != nil
  let hasSemesterZeroStorage = account.storage.type(at: /storage/SemesterZeroChapter5Collection) != nil
  
  return {
    "hasV3Storage": hasV3Storage,
    "hasSemesterZeroStorage": hasSemesterZeroStorage,
    "allStorageTypes": "Check paths manually"
  }
}
`;

async function checkUser() {
  try {
    // Check the user's Dapper wallet
    const result = await fcl.query({ 
      cadence: script,
      args: (arg, t) => [arg('0xdca7ac623136e447', t.Address)]
    });
    console.log('\n📋 User Wallet: 0xdca7ac623136e447 (Dapper)');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUser();
