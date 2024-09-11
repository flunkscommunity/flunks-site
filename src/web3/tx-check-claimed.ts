import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import BackpackMinter from 0x807c3d470888cc48

access(all) fun main(templateID: UInt64): Bool{
  let map = BackpackMinter.getClaimedBackPacksPerFlunkTemplateID()
  return map.containsKey(templateID)
}
`;

export async function checkBackpackClaimed({ templateId }) {
  if (!templateId) return Promise.resolve(null);
  return fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(templateId, t.UInt64)])])
    .then(fcl.decode);
}
