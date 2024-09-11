import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import Staking from 0x807c3d470888cc48

access(all) fun main(pool: String, ownerAddress: Address, tokenID: UInt64): UFix64 {
  return Staking.pendingRewards(pool: pool, ownerAddress: ownerAddress, tokenID: tokenID)
}
`;

export const getPendingRewardsOne = async (
  pool: "Flunks" | "Backpack",
  ownerAddress: string,
  tokenId: number
) => {
  if (!pool) return Promise.resolve(null);
  if (!tokenId?.toString()) return Promise.resolve(null);

  const capitalizedPool = pool.charAt(0).toUpperCase() + pool.slice(1);

  return await fcl
    .send([
      fcl.script(CODE),
      fcl.args([
        fcl.arg(capitalizedPool, t.String),
        fcl.arg(ownerAddress, t.Address),
        fcl.arg(tokenId, t.UInt64),
      ]),
    ])
    .then(fcl.decode);
};
