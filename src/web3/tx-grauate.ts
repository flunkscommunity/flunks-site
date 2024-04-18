// import * as fcl from "@onflow/fcl";

// const TRANSACTION: string = `import FlunksGraduation from 0x807c3d470888cc48

// transaction(tokenID: UInt64) {
//     prepare(signer: AuthAccount) {
//       FlunksGraduation.graduateFlunk(owner: signer, tokenID: tokenID)
//     }
// }`;

// interface GraduateOpts {
//   tokenID: number;
// }

// // prettier-ignore
// export function graduate({tokenID}: GraduateOpts) {
//     return async () => await fcl.mutate({
//       cadence: TRANSACTION as string,
//         args: (arg, t) => [
//           arg(tokenID, t.UInt64),
//         ],
//         authorizations: [fcl.authz],
//         limit: 1000,
//     })
//   }
