// prettier-ignore
import { mutate, authz } from "@onflow/fcl";

const TRANSACTION = `import HybridCustodyHelper from 0x807c3d470888cc48

transaction() {
  prepare(signer: auth(SaveValue, Capabilities, Storage, BorrowValue) &Account) {
    HybridCustodyHelper.forceRelinkCollections(signer: signer)
  }
}`;

export const initAllCollections = async () => {
  return await mutate({
    cadence: TRANSACTION as string,
    // @ts-ignore
    authorizations: [authz],
    limit: 9999,
  });
};
