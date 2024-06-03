import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `
// This script will get a list of all the stake information for a particular address and its linked account(s)
import NonFungibleToken from 0x1d7e57aa55817448
import HybridCustodyHelper from 0x807c3d470888cc48
import Flunks from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48
import MetadataViews from 0x1d7e57aa55817448


// mainnet test run: flow scripts execute ./cadence/scripts/GUM/get-owner-token-ids-with-url-and-edition.cdc 0xeff7b7c7795a4d56 --network mainnet
pub struct AccountTokenInfo {
    pub let tokenID: UInt64
    pub let edition: UInt64
    pub let url: String

    init(tokenID: UInt64, edition: UInt64, url: String) {
        self.tokenID = tokenID
        self.edition = edition
        self.url = url
    }
}

pub fun resolveItemUrlAndEditionFlunks(address: Address, tokenID: UInt64): AccountTokenInfo? {
    let collection = getAccount(address).getCapability<&Flunks.Collection{NonFungibleToken.CollectionPublic}>(Flunks.CollectionPublicPath).borrow()
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(id: tokenID)
    let editionView = item.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition
    let view = item.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display
    let thumbnail = display.thumbnail as! MetadataViews.HTTPFile

    return AccountTokenInfo(
        tokenID: tokenID,
        edition: edition.number,
        url: display.thumbnail.uri()
    )
}

pub fun resolveItemUrlAndEditionBackpack(address: Address, tokenID: UInt64): AccountTokenInfo? {
    let collection = getAccount(address).getCapability<&Backpack.Collection{NonFungibleToken.CollectionPublic}>(Backpack.CollectionPublicPath).borrow()
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(id: tokenID)
    let editionView = item.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition
    let view = item.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display
    let thumbnail = display.thumbnail as! MetadataViews.HTTPFile

    return AccountTokenInfo(
        tokenID: tokenID,
        edition: edition.number,
        url: display.thumbnail.uri()
    )

}

pub fun main(address: Address): {String: {UInt64: AccountTokenInfo}} {
    let flunksTokenIds = HybridCustodyHelper.getFlunksTokenIDsFromAllLinkedAccounts(ownerAddress: address)
    let backpackTokenIds = HybridCustodyHelper.getBackpackTokenIDsFromAllLinkedAccounts(ownerAddress: address)

    let flunksRes: {UInt64: AccountTokenInfo} = {}
    let backpackRes: {UInt64: AccountTokenInfo} = {}

    for tokenID in flunksTokenIds {
        if let holdingWallet = HybridCustodyHelper.getChildAccountAddressHoldingFlunksTokenId(ownerAddress: address, tokenID: tokenID) {
            if let metadata = resolveItemUrlAndEditionFlunks(address: holdingWallet, tokenID: tokenID) {
                flunksRes[tokenID] = metadata
            }
        }
    }

    for tokenID in backpackTokenIds {
        if let holdingWallet = HybridCustodyHelper.getChildAccountAddressHoldingBackpackTokenId(ownerAddress: address, tokenID: tokenID) {
            if let metadata = resolveItemUrlAndEditionBackpack(address: holdingWallet, tokenID: tokenID) {
                backpackRes[tokenID] = metadata
            }
        }
    }

    return {
        "flunks": flunksRes,
        "backpack": backpackRes
    }
}`;

export const getWalletInfo = async (address: string) => {
  if (!address) return Promise.resolve(null);

  return await fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(address, t.Address)])])
    .then(fcl.decode);
};
