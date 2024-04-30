import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useUsersControllerGetUserNftsByWalletAddress } from "generated/api/users/users";
import { NftDtoMetadata } from "generated/models";
import React, { useContext, createContext, useState, useEffect } from "react";
import { getGumBalance } from "web3/script-get-gum-balance";
import { getPendingRewardsAll } from "web3/script-pending-reward-all";
import { getPendingRewardsOne } from "web3/script-pending-reward-one";
import { stakeAll } from "web3/tx-stake-all";
import { useFclTransactionContext } from "./FclTransactionContext";
import { Button, Hourglass } from "react95";
import { TX_STATUS } from "reducers/TxStatusReducer";
import { useWindowsContext } from "./WindowsContext";
import ErrorWindow from "windows/ErrorWindow";
import { WINDOW_IDS } from "fixed";

interface ContextState {
  gumBalance: number;
  pendingRewards: number;
  stakeAll: () => void;
  claimAll: () => void;
}

export const StakingContext = createContext<ContextState>({
  gumBalance: 0,
  pendingRewards: 0,
  stakeAll: () => {},
  claimAll: () => {},
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
  const { openWindow, closeWindow } = useWindowsContext();

  const { executeTx, state, resetState } = useFclTransactionContext();

  // const { data } = useUsersControllerGetUserNftsByWalletAddress(walletAddress);
  // const flunks = data?.data?.Flunks || [];
  // const backpacks = data?.data?.Backpack || [];
  // const items = flunks?.concat(backpacks);

  // const getPendingReward = (pool: "Flunks" | "Backpack", tokenId: number) => {
  //   getPendingRewardsOne(pool, tokenId).then(setPendingRewards);
  // };

  const getPendingRewards = () => {
    getPendingRewardsAll(walletAddress).then(setPendingRewards);
  };

  useEffect(() => {
    if (!walletAddress) return;

    // poll every 30 seconds
    const interval = setInterval(() => {
      getPendingRewards();
    }, 30000);

    getPendingRewardsAll(walletAddress).then(setPendingRewards);
    getGumBalance(walletAddress).then(setGumBalance);

    return () => clearInterval(interval);
  }, [walletAddress]);

  const _stakeAll = () => {
    executeTx(stakeAll);
  };

  useEffect(() => {
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

  return (
    <StakingContext.Provider
      value={{
        gumBalance,
        pendingRewards,
        stakeAll: _stakeAll,
        claimAll: () => {},
      }}
    >
      <div className="relative h-full w-full flex flex-col">
        {children}
        {(state.txStatus === TX_STATUS.STARTED ||
          state.txStatus === TX_STATUS.PENDING) && (
          <div className="absolute inset-0 w-full h-full bg-black/60 flex items-center justify-center z-20">
            <Hourglass />
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
