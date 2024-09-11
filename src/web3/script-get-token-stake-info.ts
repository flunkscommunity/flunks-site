import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import Staking from 0x807c3d470888cc48
access(all) fun main(signerAddress: Address, pool: String, tokenID: UInt64): Staking.StakingInfo? {
  return Staking.getStakingInfo(signerAddress: signerAddress, pool: pool, tokenID: tokenID)
}`;

export const getTokenStakeInfo = async (
  address: string,
  pool: "Flunks" | "Backpack",
  tokenId: number
) => {
  if (!tokenId?.toString()) return Promise.resolve(null);
  if (!address) return Promise.resolve(null);
  if (!pool) return Promise.resolve(null);

  const capitalizedPool = pool.charAt(0).toUpperCase() + pool.slice(1);

  return await fcl
    .send([
      fcl.script(CODE),
      fcl.args([
        fcl.arg(address, t.Address),
        fcl.arg(capitalizedPool, t.String),
        fcl.arg(tokenId, t.UInt64),
      ]),
    ])
    .then(fcl.decode);
};
