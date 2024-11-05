import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import FlunksGraduationV2 from 0x807c3d470888cc48

access(all) fun main(tokenID: UInt64): Bool {
  let isGraduated = !FlunksGraduationV2.isFlunkGraduated(tokenID: tokenID)
  return isGraduated
}
`;

export async function checkCanGraduate(tokenId: number) {
  if (!tokenId?.toString()) return Promise.resolve(null);

  return fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(tokenId, t.UInt64)])])
    .then(fcl.decode);
}
