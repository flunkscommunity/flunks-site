import { animated, config, useSpring, useSpringRef } from "@react-spring/web";
import { useFclTransactionContext } from "contexts/FclTransactionContext";
import { useStakingContext } from "contexts/StakingContext";
import useSounds from "hooks/useSounds";
import { useEffect, useRef, useState } from "react";
import { Frame, Handle, Hourglass, MenuList, MenuListItem } from "react95";
import { TX_STATUS } from "reducers/TxStatusReducer";

const GumAnimation = () => {
  const { playSound, sounds } = useSounds();
  const { state, resetState } = useFclTransactionContext();

  const transitionUpRef = useSpringRef();
  const transitionUp = useSpring({
    to: { opacity: 0 },
    ref: transitionUpRef,
  });

  useEffect(() => {
    if (state.txStatus === TX_STATUS.SUCCESS && state.txName === "claim-gum") {
      transitionUpRef.start({
        from: { y: "500%", opacity: 1, scale: 1 },
        to: { y: "-25%", opacity: 1, scale: 1 },
        config: config.wobbly,
        onRest: () => {
          playSound(sounds.successGumClaim);
          setTimeout(
            () =>
              transitionUpRef.start({
                from: { opacity: 1, scale: 1 },
                to: { opacity: 0, scale: 10 },
                config: config.stiff,
                onRest: () => {
                  resetState();
                },
              }),
            500
          );
        },
      });
    }
  }, [state]);

  return (
    <div className="pointer-events-none absolute w-full h-full inset-0 flex items-center justify-center z-20">
      <animated.div
        style={transitionUp}
        className="absolute w-[200px] h-[200px] origin-center"
      >
        <div className="gumcoin" />
      </animated.div>
    </div>
  );
};

const GumDashboard = () => {
  const {
    gumBalance,
    pendingRewards,
    stakeAll,
    claimAll,
    canStake,
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
      <div className="relative flex-shrink-0 grid grid-cols-1">
        <Frame
          variant="outside"
          className="w-full h-full !min-h-[212px] !bg-bottom !bg-cover !bg-no-repeat !flex !items-center !justify-center"
          style={{
            backgroundImage: "url('/images/gum-bg.webp')",
          }}
        >
          <Frame variant="field" className="!px-3 !py-3 !flex flex-col w-[80%]">
            <div className="flex flex-row gap-4 items-center w-full justify-between">
              <span className="text-lg">Accrued $GUM</span>
              <animated.span className="font-black text-lg">
                {pendingRewardsProps.number &&
                  pendingRewardsProps.number.to((n) => n.toFixed(5))}
              </animated.span>
            </div>
            <div className="flex flex-row gap-4 items-center w-full justify-between">
              <span className="text-lg">$GUM Balance</span>
              <animated.span className="font-black text-lg">
                {gumBalanceProps.number &&
                  gumBalanceProps.number.to((n) => n.toFixed(5))}
              </animated.span>
            </div>
          </Frame>
        </Frame>
      </div>
      <MenuList inline>
        <MenuListItem square={true} disabled className="!relative">
          <img
            src={
              !canStake
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
            !canStake ||
            (walletStakeInfo.every((info) => info.stakingInfo !== null)) ||
            (walletStakeInfo.length < 1)
          }
          className="mr-auto !cursor-pointer"
        >
          Stake All
        </MenuListItem>
        <MenuListItem
          className="!cursor-pointer flex items-center gap-2"
          onClick={handleRefreshInfo}
          disabled={!canStake || refreshTimer > 0 || (walletStakeInfo.length < 1)}
        >
          {refreshTimer > 0 && (
            <Hourglass size={16} className="opacity-50 mb-0.5" />
          )}
          {refreshTimer === 0 ? "Reload" : `${refreshTimer}s`}
        </MenuListItem>
        <MenuListItem
          onClick={claimAll}
          disabled={
            !canStake || (walletStakeInfo.length < 1) || pendingRewards === 0
          }
          className="!cursor-pointer"
        >
          Claim
        </MenuListItem>
      </MenuList>
      <GumAnimation />
    </>
  );
};

export default GumDashboard;
