import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUsersControllerGetUserNftsByWalletAddress } from "generated/api/users/users";
import { NftDtoMetadata } from "generated/models";
import React, { useContext, createContext, useState, useEffect } from "react";
import { getGumBalance } from "web3/script-get-gum-balance";
import { getPendingRewardsAll } from "web3/script-pending-reward-all";
import { stakeAll } from "web3/tx-stake-all";
import { useFclTransactionContext } from "./FclTransactionContext";
import { Button, Hourglass } from "react95";
import { TX_STATUS } from "reducers/TxStatusReducer";
import { useWindowsContext } from "./WindowsContext";
import ErrorWindow from "windows/ErrorWindow";
import { WINDOW_IDS } from "fixed";
import { getWalletStakeInfo } from "web3/script-get-wallet-stake-info";
import { stakeOne } from "web3/tx-stake-one";
import { unstakeOne } from "web3/tx-unstake-one";
import { claimAll } from "web3/tx-claim-all-gum";
import { track } from "@vercel/analytics";
import { getWalletInfoShallow } from "web3/script-get-wallet-items-shallow";
import { usePaginatedItems } from "./UserPaginatedItems";

interface MetadataViewsDisplayThumbnail {
  url: string;
}

interface MetadataViewsDisplay {
  name: string;
  description: string;
  thumbnail: MetadataViewsDisplayThumbnail;
}

interface Trait {
  name: string;
  value: string;
  displayType: null; // Use `any` or specific type if it can be non-null
  rarity: null; // Use `any` or specific type if it can be non-null
}

interface Traits {
  traits: Trait[];
}

export interface StakingInfo {
  staker: string;
  tokenID: string;
  stakedAtInSeconds: string;
  pool: string;
}

export interface ObjectDetails {
  owner: string;
  tokenID: string;
  MetadataViewsDisplay: MetadataViewsDisplay;
  traits: Traits;
  serialNumber: string;
  stakingInfo: StakingInfo;
  collection: string;
  rewards: number;
}

interface ContextState {
  gumBalance: number;
  pendingRewards: number;
  canStake: boolean;
  setCanStake: (canStake: boolean) => void;
  walletStakeInfo: ObjectDetails[];
  refreshStakeInfo: () => void;
  sortStakeInfo: (
    sortBy: "name" | "rewards" | "staked",
    orderBy: "asc" | "dsc"
  ) => void;
  stakeAll: () => void;
  stakeSingle: (pool: "Flunks" | "Backpack", tokenID: number) => void;
  unstakeSingle: (pool: "Flunks" | "Backpack", tokenID: number) => void;
  claimAll: () => void;
  claimSingle: (pool: "Flunks" | "Backpack", tokenID: number) => void;
}

export const StakingContext = createContext<ContextState>({
  gumBalance: 0,
  pendingRewards: 0,
  canStake: false,
  setCanStake: () => {},
  walletStakeInfo: [],
  sortStakeInfo: () => {},
  refreshStakeInfo: () => {},
  stakeAll: () => {},
  stakeSingle: () => {},
  unstakeSingle: () => {},
  claimAll: () => {},
  claimSingle: () => {},
});

interface ProviderProps {
  children: React.ReactNode;
}

const StakingProvider: React.FC<ProviderProps> = (props) => {
  const { children } = props;
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || null;
  const [gumBalance, setGumBalance] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const { allItems, refresh } = usePaginatedItems();
  const [walletStakeInfo, setWalletStakeInfo] = useState<ObjectDetails[]>([]);
  const { openWindow, closeWindow } = useWindowsContext();
  const [canStake, setCanStake] = useState(false);

  const { executeTx, state, resetState } = useFclTransactionContext();

  const getPendingRewards = () => {
    getPendingRewardsAll(walletAddress).then(setPendingRewards);
  };

  const getStakeInfo = () => {
    refresh();
  };

  const sortStakeInfo = (
    sortBy: "name" | "rewards" | "staked",
    orderBy: "asc" | "dsc"
  ) => {
    const sorted = walletStakeInfo.sort((a, b) => {
      if (sortBy === "name") {
        return orderBy === "asc"
          ? a.MetadataViewsDisplay.name.localeCompare(
              b.MetadataViewsDisplay.name
            )
          : b.MetadataViewsDisplay.name.localeCompare(
              a.MetadataViewsDisplay.name
            );
      } else if (sortBy === "rewards") {
        return orderBy === "asc"
          ? a.rewards - b.rewards
          : b.rewards - a.rewards;
      } else if (sortBy === "staked") {
        // Order items by staked !== null or staked === null asc or dsc

        return orderBy === "asc"
          ? a.stakingInfo
            ? 1
            : -1
          : a.stakingInfo
          ? -1
          : 1;
      }
    });

    setWalletStakeInfo([...sorted]);
  };

  useEffect(() => {
    if (!walletAddress) return;

    getPendingRewardsAll(walletAddress).then(setPendingRewards);
    getGumBalance(walletAddress).then(setGumBalance);
  }, [walletAddress]);

  useEffect(() => {
    if (!walletAddress) return;
    setWalletStakeInfo(allItems);
  }, [allItems]);

  const _stakeAll = () => {
    resetState();
    executeTx(stakeAll);
    track("gm_stake_all", { wallet: walletAddress });
  };

  useEffect(() => {
    if (state.txStatus === TX_STATUS.SUCCESS) {
      getPendingRewards();
      getStakeInfo();
      getGumBalance(walletAddress).then(setGumBalance);
    }

    if (state.txStatus !== TX_STATUS.ERROR)
      return closeWindow(WINDOW_IDS.ERROR);

    openWindow({
      key: WINDOW_IDS.ERROR,
      window: (
        <ErrorWindow
          title="Error during transaction"
          message={state.txMessage}
          actions={
            <Button
              onClick={() => {
                closeWindow(WINDOW_IDS.ERROR);
                resetState();
              }}
            >
              Close
            </Button>
          }
          windowId={WINDOW_IDS.ERROR}
          onClose={() => {
            resetState();
          }}
        />
      ),
    });
  }, [state.txStatus]);

  const _stakeSingle = (pool: "Flunks" | "Backpack", tokenID: number) => {
    resetState();
    executeTx(() => stakeOne(pool, tokenID));
    track("gm_stake_one", {
      wallet: walletAddress,
      tokenID: tokenID,
      pool: pool,
    });
  };

  const _unstakesingle = (pool: "Flunks" | "Backpack", tokenID: number) => {
    resetState();
    executeTx(() => unstakeOne(pool, tokenID));
    track("gm_unstake_one", {
      wallet: walletAddress,
      tokenID: tokenID,
      pool: pool,
    });
  };

  const _claimAll = () => {
    resetState();
    executeTx(claimAll, "claim-gum");
    track("gm_claim_all", { wallet: walletAddress });
  };

  return (
    <StakingContext.Provider
      value={{
        gumBalance,
        pendingRewards,
        canStake,
        setCanStake,
        walletStakeInfo: walletStakeInfo,
        refreshStakeInfo: () => {
          getPendingRewards();
          getStakeInfo();
          getGumBalance(walletAddress).then(setGumBalance);
        },
        sortStakeInfo: sortStakeInfo,
        stakeAll: _stakeAll,
        stakeSingle: _stakeSingle,
        unstakeSingle: _unstakesingle,
        claimAll: _claimAll,
        claimSingle: () => {},
      }}
    >
      <div className="relative h-[calc(100%-36px)] w-full flex flex-col">
        {children}
        {(state.txStatus === TX_STATUS.STARTED ||
          state.txStatus === TX_STATUS.PENDING) && (
          <div className="fixed inset-0 w-full h-full bg-black/60 flex flex-col gap-2 items-center justify-center z-20">
            <Hourglass />
            <span className="text-white">
              Sit tight, transactions can take a minute.
            </span>
          </div>
        )}
      </div>
    </StakingContext.Provider>
  );
};

export const useStakingContext = (): ContextState => {
  return useContext(StakingContext);
};

export default StakingProvider;
