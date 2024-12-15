import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `import HybridCustodyHelper from 0x807c3d470888cc48
import Flunks from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48
import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448

// mainnet test run: flow scripts execute ./cadence/scripts/GUM/get-owner-token-ids-with-url-and-edition.cdc 0xeff7b7c7795a4d56 --network mainnet
access(all) struct AccountTokenInfo {
    access(all) let tokenID: UInt64
    access(all) let edition: UInt64
    access(all) let url: String

    init(tokenID: UInt64, edition: UInt64, url: String) {
        self.tokenID = tokenID
        self.edition = edition
        self.url = url
    }
}

access(all) fun resolveItemUrlAndEditionFlunks(address: Address, tokenID: UInt64): AccountTokenInfo? {
    let collection = getAccount(address).capabilities.borrow<&Flunks.Collection>(Flunks.CollectionPublicPath)
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(tokenID)
    let editionView = item?.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition?
    let view = item?.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display?
    let thumbnail = display?.thumbnail! as! MetadataViews.HTTPFile

    return AccountTokenInfo(
        tokenID: tokenID,
        edition: edition?.number!,
        url: display?.thumbnail?.uri() ?? ""
    )
}

access(all) fun resolveItemUrlAndEditionBackpack(address: Address, tokenID: UInt64): AccountTokenInfo? {
    let collection = getAccount(address).capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(tokenID)
    let editionView = item?.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition?
    let view = item?.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display?
    let thumbnail = display?.thumbnail as! MetadataViews.HTTPFile?

    return AccountTokenInfo(
        tokenID: tokenID,
        edition: edition?.number!,
        url: thumbnail?.uri() ?? ""
    )

}

access(all) fun main(address: Address, collection: String, tokenIDs: [UInt64]): {UInt64: AccountTokenInfo} {
    let res: {UInt64: AccountTokenInfo} = {}

    if (collection == "flunks") {
        for tokenID in tokenIDs {
            if let holdingWallet = HybridCustodyHelper.getChildAccountAddressHoldingFlunksTokenId(ownerAddress: address, tokenID: tokenID) {
                if let metadata = resolveItemUrlAndEditionFlunks(address: holdingWallet, tokenID: tokenID) {
                    res[tokenID] = metadata
                }
            }
        }
    }

    if (collection == "backpacks") {
        for tokenID in tokenIDs {
            if let holdingWallet = HybridCustodyHelper.getChildAccountAddressHoldingBackpackTokenId(ownerAddress: address, tokenID: tokenID) {
                if let metadata = resolveItemUrlAndEditionBackpack(address: holdingWallet, tokenID: tokenID) {
                    res[tokenID] = metadata
                }
            }
        }
    }

    return res
}`;

export const getOwnerTokenIdsWithUrlAndEditionWhale = async (
  address: string,
  collection: string,
  tokenIDs: number[]
) => {
  if (!address || !tokenIDs.length) return [];
  return await fcl
    .send([
      fcl.script(CODE),
      fcl.args([
        fcl.arg(address, t.Address),
        fcl.arg(collection, t.String),
        fcl.arg(tokenIDs, t.Array(t.UInt64)),
      ]),
    ])
    .then(fcl.decode);
};
