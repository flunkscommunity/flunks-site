import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { Button, Frame, Separator } from "react95";
import { getGumBalance } from "web3/script-get-gum-balance";
import { getPendingRewardsAll } from "web3/script-pending-reward-all";

const GumDashboard = () => {
  const { user, primaryWallet, setShowDynamicUserProfile } =
    useDynamicContext();

  const [gumBalance, setGumBalance] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);

  const walletAddress = primaryWallet?.address || null;

  useEffect(() => {
    if (!walletAddress) return;

    getPendingRewardsAll(walletAddress).then(setPendingRewards);
    getGumBalance(walletAddress).then(setGumBalance);
  }, [walletAddress]);

  return (
    <div className="flex-shrink-0 grid grid-cols-1">
      <Frame variant="outside" className="w-full h-full">
        <div className="flex flex-col items-start px-4 py-2">
          <div className="flex flex-row items-center w-full justify-between">
            <Frame
              variant="field"
              className="!flex-grow-0 py-1.5 px-2 !flex gap-2 items-center"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="mt-0.5">{walletAddress}</span>
            </Frame>
            <Button
              variant="menu"
              size="sm"
              className="!flex-grow-0 py-1.5 px-2"
            >
              X
            </Button>
          </div>
          {true && (
            <>
              <div className="flex pt-4 w-full">
                <Frame
                  variant="well"
                  className="col-span-9 flex-grow items-center px-2 py-1"
                >
                  <span>GUM Balance</span>
                </Frame>
                <Frame
                  variant="well"
                  className="col-span-3 !flex items-end justify-end px-2 py-1"
                >
                  {gumBalance}
                </Frame>
              </div>
              <div className="flex w-full">
                <Frame
                  variant="well"
                  className="col-span-9 flex-grow items-center px-2 py-1"
                >
                  <span>Staked Items</span>
                </Frame>
                <Frame
                  variant="well"
                  className="col-span-3 !flex items-end justify-end px-2 py-1"
                >
                  0
                </Frame>
              </div>
              <Separator orientation="horizontal" className="!my-2" />
              <div className="flex flex-col w-full items-start gap-2">
                <div className="flex w-full">
                  <Frame
                    variant="well"
                    className="col-span-9 flex-grow items-center px-2 py-1"
                  >
                    <span>Pending Gum</span>
                  </Frame>
                  <Frame
                    variant="well"
                    className="col-span-3 !flex items-end justify-end px-2 py-1"
                  >
                    {pendingRewards}
                  </Frame>
                </div>
                <Button className="ml-auto min-w-[100px]">Claim</Button>
              </div>
            </>
          )}
        </div>
      </Frame>
    </div>
  );
};

export default GumDashboard;
