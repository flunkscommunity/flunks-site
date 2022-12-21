import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE =
  process.env.NEXT_PUBLIC_REMOTE_NODE === "production"
    ? `import BackpackMinter from 0x807c3d470888cc48

pub fun main(templateID: UInt64): Bool{
  let map = BackpackMinter.getClaimedBackPacksPerFlunkTemplateID()
  return map.containsKey(templateID)
}
`
    : `import BackpackMinter from 0xe666c53e1758dec6

pub fun main(templateID: UInt64): Bool{
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
