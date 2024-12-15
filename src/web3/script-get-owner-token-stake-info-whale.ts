import * as fcl from "@onflow/fcl";
import * as t from "@onflow/types";

const CODE = `// This script will get a list of all the stake information for a particular address and its linked account(s)
import NonFungibleToken from 0x1d7e57aa55817448
import Staking from 0x807c3d470888cc48
import HybridCustodyHelper from 0x807c3d470888cc48
import Flunks from 0x807c3d470888cc48
import Backpack from 0x807c3d470888cc48
import MetadataViews from 0x1d7e57aa55817448
import GUMStakingTracker from 0x807c3d470888cc48

// mainnet test run: flow scripts execute ./cadence/scripts/GUM/get-owner-token-stake-info.cdc 0x10d4fcfcf183efd5 'flunks' [2295, 1558] --network mainnet

access(all) struct AccountTokenMetadataWithStakeInfo {
    access(all) let owner: Address
    access(all) let tokenID: UInt64
    access(all) let MetadataViewsDisplay: MetadataViews.Display
    access(all) let traits: MetadataViews.Traits
    access(all) let serialNumber: UInt64
    access(all) let stakingInfo: Staking.StakingInfo?
    access(all) let collection: String?
    access(all) let rewards: UFix64?
    access(all) let claimedRewards: UFix64?
    access(all) let pixelUrl: String?


    init(
        owner: Address,
        tokenID: UInt64,
        metadataViewsDisplay: MetadataViews.Display,
        serialNumber: UInt64,
        traits: MetadataViews.Traits,
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
    let collection = getAccount(address).capabilities.borrow<&Flunks.Collection>(Flunks.CollectionPublicPath)
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

    let pixelUrlView = item?.resolveView(Type<Flunks.PixelUrl>())
    let pixelUrlStr = pixelUrlView as! String??

    return AccountTokenMetadataWithStakeInfo(
        owner: address,
        tokenID: tokenID,
        metadataViewsDisplay: display!,
        serialNumber: edition?.number!,
        traits: traits!,
        stakingInfo: stakingInfo,
        collection: "Flunks",
        rewards: rewards,
        claimedRewards: claimedRewards,
        pixelUrl: pixelUrlStr ?? nil
    )
}

access(all) fun getItemMetadataBackpack(address: Address, tokenID: UInt64): AccountTokenMetadataWithStakeInfo? {
    let collection = getAccount(address).capabilities.borrow<&Backpack.Collection>(Backpack.CollectionPublicPath)
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
        metadataViewsDisplay: display!,
        serialNumber: edition?.number!,
        traits: traits!,
        stakingInfo: stakingInfo,
        collection: "Backpack",
        rewards: rewards,
        claimedRewards: claimedRewards,
        pixelUrl: nil
    )
}

access(all) fun main(address: Address, collection: String, tokenIDs: [UInt64]): [AccountTokenMetadataWithStakeInfo] {
    var res: [AccountTokenMetadataWithStakeInfo] = []

    if (collection == "flunks") {
        for tokenID in tokenIDs {
            if let holdingWallet = HybridCustodyHelper.getChildAccountAddressHoldingFlunksTokenId(ownerAddress: address, tokenID: tokenID) {
                if let metadata = getItemMetadataFlunks(address: holdingWallet, tokenID: tokenID) {
                    res.append(metadata)
                }
            }
        }
    }

    if (collection == "backpacks") {
        for tokenID in tokenIDs {
            if let holdingWallet = HybridCustodyHelper.getChildAccountAddressHoldingBackpackTokenId(ownerAddress: address, tokenID: tokenID) {
                if let metadata = getItemMetadataBackpack(address: holdingWallet, tokenID: tokenID) {
                    res.append(metadata)
                }
            }
        }
    }

    return res
}`;

export const getOwnerTokenStakeInfoWhale = async (
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
