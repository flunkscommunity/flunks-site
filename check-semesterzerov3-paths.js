/**
 * Check SemesterZeroV3 contract paths
 */
import * as fcl from '@onflow/fcl';

fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

const script = `
import SemesterZeroV3 from 0xce9dd43888d99574

access(all) fun main(): {String: String} {
  return {
    "Chapter5CollectionStoragePath": SemesterZeroV3.Chapter5CollectionStoragePath.toString(),
    "Chapter5CollectionPublicPath": SemesterZeroV3.Chapter5CollectionPublicPath.toString()
  }
}
`;

async function checkPaths() {
  try {
    const result = await fcl.query({ cadence: script });
    console.log('\n📋 SemesterZeroV3 Contract Paths:\n');
    console.log('Storage Path:', result.Chapter5CollectionStoragePath);
    console.log('Public Path:', result.Chapter5CollectionPublicPath);
    console.log();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPaths();
