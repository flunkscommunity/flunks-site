// import * as fcl from "@onflow/fcl";
// import * as t from "@onflow/types";

// const CODE = `import FlunksGraduation from 0x807c3d470888cc48

//     pub fun main(tokenID: UInt64): Bool {
//       return FlunksGraduation.isFlunkGraduated(tokenID: tokenID)
//     }`;


// export async function checkCanGraduate({ tokenId }) {
//   if (!tokenId) return Promise.resolve(null);
//   return fcl
//     .send([fcl.script(CODE), fcl.args([fcl.arg(tokenId, t.UInt64)])])
//     .then(fcl.decode);
// }
