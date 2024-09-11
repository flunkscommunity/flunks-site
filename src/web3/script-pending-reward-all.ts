import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import Staking from 0x807c3d470888cc48

access(all) fun main(address: Address): UFix64 {
  return Staking.pendingRewardsPerWallet(address: address)
}
`;

export const getPendingRewardsAll = async (address: string) => {
  if (!address) return Promise.resolve(null);

  return await fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(address, t.Address)])])
    .then(fcl.decode);
};
