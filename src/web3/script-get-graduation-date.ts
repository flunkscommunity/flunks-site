import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import FlunksGraduation from 0x807c3d470888cc48

pub fun main(): {UInt64: UInt64} {
  return FlunksGraduation.getFlunksGraduationTimeTable()
}`;

export async function checkGraduationDates() {
  return fcl.send([fcl.script(CODE), fcl.args([])]).then(fcl.decode);
}
