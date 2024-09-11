import * as fcl from "@onflow/fcl";

const TRANSACTION: string = `
import Staking from 0x807c3d470888cc48

transaction() {
    prepare(signer: auth(SaveValue, Capabilities, Storage, BorrowValue) &Account) {
        Staking.stakeAll(signerAuth: signer)
    }
}`;

export const stakeAll = async () => {
  return await fcl.mutate({
    cadence: TRANSACTION as string,
    // @ts-ignore
    authorizations: [fcl.authz],
    limit: 9999,
  });
};
