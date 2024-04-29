import * as fcl from "@onflow/fcl";

const TRANSACTION: string = `import Staking from 0x807c3d470888cc48

transaction(pool: String, tokenID: UInt64) {
    prepare(signer: AuthAccount) {
        Staking.stakeOne(signerAuth: signer, pool: pool, tokenID: tokenID)
    }
}`;

export const stakeOne = async (
  pool: "Flunks" | "Backpack",
  tokenId: number
) => {
  if (!pool) return Promise.resolve(null);
  if (!tokenId) return Promise.resolve(null);

  const capitalizedPool = pool.charAt(0).toUpperCase() + pool.slice(1);

  return await fcl.mutate({
    cadence: TRANSACTION as string,
    args: (arg, t) => [arg(capitalizedPool, t.String), arg(tokenId, t.UInt64)],
    // @ts-ignore
    authorizations: [fcl.authz],
    limit: 1000,
  });
};
