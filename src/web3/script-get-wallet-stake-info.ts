import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `
// This script will get a list of all the stake information for a particular address and its linked account(s)
import NonFungibleToken from 0x1d7e57aa55817448
import Staking from 0x807c3d470888cc48
import HybridCustodyHelper from 0x807c3d470888cc48
import Flunks from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48
import MetadataViews from 0x1d7e57aa55817448
import GUMStakingTracker from 0x807c3d470888cc48


// mainnet test run: flow scripts execute ./cadence/scripts/GUM/get-owner-stake-info.cdc 0xeff7b7c7795a4d56 --network mainnet

access(all) struct AccountTokenMetadataWithStakeInfo {
    access(all) let owner: Address
    access(all) let tokenID: UInt64
    access(all) let MetadataViewsDisplay: MetadataViews.Display?
    access(all) let traits: MetadataViews.Traits?
    access(all) let serialNumber: UInt64
    access(all) let stakingInfo: Staking.StakingInfo?
    access(all) let collection: String?
    access(all) let rewards: UFix64?
    access(all) let claimedRewards: UFix64?
    access(all) let pixelUrl: String?


    init(
        owner: Address,
        tokenID: UInt64,
        metadataViewsDisplay: MetadataViews.Display?,
        serialNumber: UInt64,
        traits: MetadataViews.Traits?,
        stakingInfo: Staking.StakingInfo?,
        collection: String?,
        rewards: UFix64?,
        claimedRewards: UFix64?,
        pixelUrl: String?
    ) {
        self.owner = owner
        self.tokenID = tokenID
        self.MetadataViewsDisplay = metadataViewsDisplay
        self.traits = traits
        self.serialNumber = serialNumber
        self.stakingInfo = stakingInfo
        self.collection = collection
        self.rewards = rewards
        self.claimedRewards = claimedRewards
        self.pixelUrl = pixelUrl
    }
}

access(all) fun getItemMetadataFlunks(address: Address, tokenID: UInt64): AccountTokenMetadataWithStakeInfo? {
    let collection = getAccount(address)
        .capabilities.borrow<&Flunks.Collection>(Flunks.CollectionPublicPath)
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(tokenID)

    let view = item?.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display?
    
    let editionView = item?.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition?

    let traitsView = item?.resolveView(Type<MetadataViews.Traits>())
        ?? panic("Could not get the item's traits view")
    let traits = traitsView as! MetadataViews.Traits?

    let stakingInfo = Staking.getStakingInfo(signerAddress: address, pool: "Flunks", tokenID: tokenID)

    let rewards = Staking.pendingRewards(pool: "Flunks", ownerAddress: address, tokenID: tokenID)

    let claimedRewards = GUMStakingTracker.getClaimedFlunksTracker()[tokenID] ?? 0.0

    let pixelUrlView = item?.resolveView(Type<Flunks.PixelUrl>()) ?? ""
    let pixelUrlStr = pixelUrlView as! String?

    return AccountTokenMetadataWithStakeInfo(
        owner: address,
        tokenID: tokenID,
        metadataViewsDisplay: display,
        serialNumber: edition?.number ?? 0,
        traits: traits,
        stakingInfo: stakingInfo,
        collection: "Flunks",
        rewards: rewards,
        claimedRewards: claimedRewards,
        pixelUrl: pixelUrlStr
    )
}

access(all) fun getItemMetadataBackpack(address: Address, tokenID: UInt64): AccountTokenMetadataWithStakeInfo? {
    let collection = getAccount(address)
        .capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
        ?? panic("Could not borrow a reference to the account's NFT collection")

    let item = collection.borrowNFT(tokenID)

    let view = item?.resolveView(Type<MetadataViews.Display>())
        ?? panic("Could not resolve the item's metadata view")
    let display = view as! MetadataViews.Display?
    
    let editionView = item?.resolveView(Type<MetadataViews.Edition>())
        ?? panic("Could not get the item's edition view")
    let edition = editionView as! MetadataViews.Edition?

    let traitsView = item?.resolveView(Type<MetadataViews.Traits>())
        ?? panic("Could not get the item's traits view")
    let traits = traitsView as! MetadataViews.Traits?

    let stakingInfo = Staking.getStakingInfo(signerAddress: address, pool: "Backpack", tokenID: tokenID)

    let rewards = Staking.pendingRewards(pool: "Backpack", ownerAddress: address, tokenID: tokenID)

    let claimedRewards = GUMStakingTracker.getClaimedBackpackTracker()[tokenID] ?? 0.0

    return AccountTokenMetadataWithStakeInfo(
        owner: address,
        tokenID: tokenID,
        metadataViewsDisplay: display,
        serialNumber: edition?.number ?? 0,
        traits: traits,
        stakingInfo: stakingInfo,
        collection: "Backpack",
        rewards: rewards,
        claimedRewards: claimedRewards,
        pixelUrl: nil
    )
}

access(all) fun main(address: Address): [AccountTokenMetadataWithStakeInfo] {
    var res: [AccountTokenMetadataWithStakeInfo] = []

    // Get tokenIDs for main account (Flunks)
    let collection: &Flunks.Collection? = getAccount(address)
        .capabilities.borrow<&Flunks.Collection>(Flunks.CollectionPublicPath)
    let mainCollectionTokenIDs = collection?.getIDs() ?? []
    for tokenID in mainCollectionTokenIDs {
        let accountTokenMetadata = getItemMetadataFlunks(address: address, tokenID: tokenID)!
        res = res.concat([accountTokenMetadata])
    }

    // Get tokenIDs for child accounts (Flunks)
    let childAddresses = HybridCustodyHelper.getChildAccounts(parentAddress: address)
    if childAddresses.length != 0 {
        for childAddress in childAddresses {
            let childCollection: &Flunks.Collection? = getAccount(childAddress)
                .capabilities.borrow<&Flunks.Collection>(Flunks.CollectionPublicPath)
            let childCollectionTokenIDs = childCollection?.getIDs() ?? []
            for tokenID in childCollectionTokenIDs {
                let accountTokenMetadata = getItemMetadataFlunks(address: childAddress, tokenID: tokenID)!
                res = res.concat([accountTokenMetadata])
            }
        }     
    }

    // Get tokenIDs for main account (Backpacks)
    let backpackCollection: &Backpack.Collection? = getAccount(address)
        .capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath) 
    let mainBackpackCollectionTokenIDs = backpackCollection?.getIDs() ?? []
    for tokenID in mainBackpackCollectionTokenIDs {
        let accountTokenMetadata = getItemMetadataBackpack(address: address, tokenID: tokenID)!
        res = res.concat([accountTokenMetadata])
    }

    // Get tokenIDs for child accounts (Backpacks)
    if childAddresses.length != 0 {
        for childAddress in childAddresses {
            let childCollection: &Backpack.Collection? = getAccount(childAddress)
                .capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
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
