import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { animated, config, useSpring } from "@react-spring/web";
import { useStakingContext } from "contexts/StakingContext";
import { useEffect, useRef, useState } from "react";
import {
  Button,
  Frame,
  Handle,
  Hourglass,
  MenuList,
  MenuListItem,
  Separator,
} from "react95";
import { getGumBalance } from "web3/script-get-gum-balance";
import { getPendingRewardsAll } from "web3/script-pending-reward-all";

const GumDashboard = () => {
  const { user, primaryWallet, setShowDynamicUserProfile } =
    useDynamicContext();
  const {
    gumBalance,
    pendingRewards,
    stakeAll,
    claimAll,
    isDapper,
    refreshStakeInfo,
    walletStakeInfo,
  } = useStakingContext();
  const [refreshTimer, setRefreshTimer] = useState(0);
  const previousGumBalace = useRef<number>(gumBalance || 0);
  const previousPendingRewards = useRef<number>(pendingRewards || 0);

  const handleRefreshInfo = () => {
    // Can only refresh every 30 seconds
    if (refreshTimer === 0) {
      refreshStakeInfo();
      setRefreshTimer(30);
      const interval = setInterval(() => {
        setRefreshTimer((prev) => prev - 1);
      }, 1000);
      setTimeout(() => {
        clearInterval(interval);
      }, 30000);
    }

    return;
  };

  const walletAddress = primaryWallet?.address || null;

  const gumBalanceProps = useSpring({
    from: { number: Number(previousGumBalace?.current || 0) },
    number: Number(gumBalance),
    duration: 1000,
  });

  const pendingRewardsProps = useSpring({
    from: { number: Number(previousPendingRewards?.current || 0) },
    number: Number(pendingRewards),
    duration: 1000,
  });

  useEffect(() => {
    setTimeout(() => {
      previousGumBalace.current = gumBalance;
    }, 0);
  }, [gumBalance]);

  useEffect(() => {
    setTimeout(() => {
      previousPendingRewards.current = pendingRewards;
    }, 0);
  }, [pendingRewards]);

  return (
    <>
      <div className="flex-shrink-0 grid grid-cols-1">
        <Frame variant="outside" className="w-full h-full">
          <div className="flex flex-col items-start px-4 py-2">
            <div className="relative flex flex-row items-center w-full justify-between">
              <div className="flex flex-col items-start">
                <span className="text-base font-bold">Flunks</span>

                <span className="text-base">Exclusive</span>
              </div>
              <Frame
                variant="field"
                className="!flex-grow-0 py-1.5 px-2 !flex gap-2 items-center ml-auto"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="mt-0.5">{walletAddress}</span>
              </Frame>
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
                    className="col-span-3 !flex items-end justify-end px-2 py-1 z-[1]"
                  >
                    {/* {gumBalance} */}
                    <animated.span>
                      {gumBalanceProps.number &&
                        gumBalanceProps.number.to((n) => n.toFixed(5))}
                    </animated.span>
                  </Frame>
                </div>
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
                      <animated.span>
                        {pendingRewardsProps.number &&
                          pendingRewardsProps.number.to((n) => n.toFixed(5))}
                      </animated.span>
                    </Frame>
                  </div>
                </div>
              </>
            )}
          </div>
        </Frame>
      </div>
      <MenuList inline>
        <MenuListItem square={true} disabled className="!relative">
          <img
            src={
              isDapper
                ? "/images/icons/gum-inactive.png"
                : "/images/icons/gum-active.png"
            }
            className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 !scale-125"
          />
        </MenuListItem>
        <Handle size={38} />
        <MenuListItem
          onClick={stakeAll}
          disabled={
            isDapper ||
            walletStakeInfo.every((info) => info.stakingInfo !== null)
          }
          className="mr-auto !cursor-pointer"
        >
          Stake All
        </MenuListItem>
        <MenuListItem
          className="!cursor-pointer flex items-center gap-2"
          onClick={handleRefreshInfo}
          disabled={isDapper || refreshTimer > 0}
        >
          {refreshTimer > 0 && (
            <Hourglass size={16} className="opacity-50 mb-0.5" />
          )}
          {refreshTimer === 0 ? "Reload" : `${refreshTimer}s`}
        </MenuListItem>
        <MenuListItem
          onClick={claimAll}
          disabled={isDapper}
          className="!cursor-pointer"
        >
          Claim
        </MenuListItem>
      </MenuList>
    </>
  );
};

export default GumDashboard;
