import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `
// This script will get a list of all the stake information for a particular address and its linked account(s)
import NonFungibleToken from 0x1d7e57aa55817448
import Staking from 0x807c3d470888cc48
import HybridCustody from 0xd8a7e05a7ac670c0
import Flunks from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48
import MetadataViews from 0x1d7e57aa55817448

// mainnet test run: flow scripts execute ./cadence/scripts/GUM/get-owner-stake-info.cdc 0xeff7b7c7795a4d56 --network mainnet

pub struct AccountTokenMetadataWithStakeInfo {
    pub let owner: Address
    pub let tokenID: UInt64
    pub let MetadataViewsDisplay: MetadataViews.Display
    pub let traits: MetadataViews.Traits
    pub let serialNumber: UInt64
    pub let stakingInfo: Staking.StakingInfo?
    pub let collection: String?
    pub let rewards: UFix64?

    init(owner: Address, tokenID: UInt64, metadataViewsDisplay: MetadataViews.Display, serialNumber: UInt64, traits: MetadataViews.Traits, stakingInfo: Staking.StakingInfo?, collection: String?, rewards: UFix64?) {
        self.owner = owner
        self.tokenID = tokenID
        self.MetadataViewsDisplay = metadataViewsDisplay
        self.traits = traits
        self.serialNumber = serialNumber
        self.stakingInfo = stakingInfo
        self.collection = collection
        self.rewards = rewards
    }
}

pub fun getChildAccounts(parentAddress: Address): [Address] {
    // Attempt to borrow a reference to the parent's Manager resource via the public path
    let parentPublic = getAccount(parentAddress)
        .getCapability(HybridCustody.ManagerPublicPath)
        .borrow<&HybridCustody.Manager{HybridCustody.ManagerPublic}>()

    // Check if the borrowing was successful
    if let parentManager = parentPublic {
        // Retrieve and return the child account addresses if the reference was successfully borrowed
        return parentManager.getChildAddresses()
    } else {
        // Return an empty array if the reference could not be borrowed
        return []
    }
}

pub fun getItemMetadataFlunks(address: Address, tokenID: UInt64): AccountTokenMetadataWithStakeInfo? {
    let collection = getAccount(address).getCapability<&Flunks.Collection{NonFungibleToken.CollectionPublic}>(Flunks.CollectionPublicPath).borrow()
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(id: tokenID)

    let view = item.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display
    
    let editionView = item.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition

    let traitsView = item.resolveView(Type<MetadataViews.Traits>())
        ?? panic("Could not get the item's traits view")
    let traits = traitsView as! MetadataViews.Traits

    let stakingInfo = Staking.getStakingInfo(signerAddress: address, pool: "Flunks", tokenID: tokenID)

    let rewards = Staking.pendingRewards(pool: "Flunks", tokenID: tokenID)

    return AccountTokenMetadataWithStakeInfo(
        owner: address,
        tokenID: tokenID,
        metadataViewsDisplay: display,
        serialNumber: edition.number,
        traits: traits,
        stakingInfo: stakingInfo,
        collection: "Flunks",
        rewards: rewards
    )
}

pub fun getItemMetadataBackpack(address: Address, tokenID: UInt64): AccountTokenMetadataWithStakeInfo? {
    let collection = getAccount(address).getCapability<&Backpack.Collection{NonFungibleToken.CollectionPublic}>(Backpack.CollectionPublicPath).borrow()
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(id: tokenID)

    let view = item.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display
    
    let editionView = item.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition

    let traitsView = item.resolveView(Type<MetadataViews.Traits>())
        ?? panic("Could not get the item's traits view")
    let traits = traitsView as! MetadataViews.Traits

    let stakingInfo = Staking.getStakingInfo(signerAddress: address, pool: "Backpack", tokenID: tokenID)

    let rewards = Staking.pendingRewards(pool: "Backpack", tokenID: tokenID)

    return AccountTokenMetadataWithStakeInfo(
        owner: address,
        tokenID: tokenID,
        metadataViewsDisplay: display,
        serialNumber: edition.number,
        traits: traits,
        stakingInfo: stakingInfo,
        collection: "Backpack",
        rewards: rewards
    )
}

pub fun main(address: Address): [AccountTokenMetadataWithStakeInfo] {
    var res: [AccountTokenMetadataWithStakeInfo] = []

    // Get tokenIDs for main account (Flunks)
    let collection: &Flunks.Collection{NonFungibleToken.CollectionPublic}? = getAccount(address)
        .getCapability<&Flunks.Collection{NonFungibleToken.CollectionPublic}>(Flunks.CollectionPublicPath).borrow()
    let mainCollectionTokenIDs = collection?.getIDs() ?? []
    for tokenID in mainCollectionTokenIDs {
        let accountTokenMetadata = getItemMetadataFlunks(address: address, tokenID: tokenID)!
        res = res.concat([accountTokenMetadata])
    }

    // Get tokenIDs for child accounts (Flunks)
    let childAddresses = getChildAccounts(parentAddress: address)
    if childAddresses.length != 0 {
        for childAddress in childAddresses {
            let childCollection: &Flunks.Collection{NonFungibleToken.CollectionPublic}? = getAccount(childAddress)
                .getCapability<&Flunks.Collection{NonFungibleToken.CollectionPublic}>(Flunks.CollectionPublicPath).borrow()
            let childCollectionTokenIDs = childCollection?.getIDs() ?? []
            for tokenID in childCollectionTokenIDs {
                let accountTokenMetadata = getItemMetadataFlunks(address: childAddress, tokenID: tokenID)!
                res = res.concat([accountTokenMetadata])
            }
        }     
    }

    // Get tokenIDs for main account (Backpacks)
    let backpackCollection: &Backpack.Collection{NonFungibleToken.CollectionPublic}? = getAccount(address)
        .getCapability<&Backpack.Collection{NonFungibleToken.CollectionPublic}>(Backpack.CollectionPublicPath).borrow()
    let mainBackpackCollectionTokenIDs = backpackCollection?.getIDs() ?? []
    for tokenID in mainBackpackCollectionTokenIDs {
        let accountTokenMetadata = getItemMetadataBackpack(address: address, tokenID: tokenID)!
        res = res.concat([accountTokenMetadata])
    }

    // Get tokenIDs for child accounts (Backpacks)
    if childAddresses.length != 0 {
        for childAddress in childAddresses {
            let childCollection: &Backpack.Collection{NonFungibleToken.CollectionPublic}? = getAccount(childAddress)
                .getCapability<&Backpack.Collection{NonFungibleToken.CollectionPublic}>(Backpack.CollectionPublicPath).borrow()
            let childCollectionTokenIDs = childCollection?.getIDs() ?? []
            for tokenID in childCollectionTokenIDs {
                let accountTokenMetadata = getItemMetadataBackpack(address: childAddress, tokenID: tokenID)!
                res = res.concat([accountTokenMetadata])
            }
        }     
    }

    // Return consolidated tokenIDs by address
    return res
}`;

export const getWalletStakeInfo = async (address: string) => {
  if (!address) return Promise.resolve(null);

  return await fcl
    .send([fcl.script(CODE), fcl.args([fcl.arg(address, t.Address)])])
    .then(fcl.decode);
};
