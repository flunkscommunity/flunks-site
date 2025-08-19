import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { InfoItem } from "components/Settings/UserInformation";
import { useWindowsContext } from "contexts/WindowsContext";
import { format } from "date-fns";
import { WINDOW_IDS } from "fixed";
import { useEffect, useMemo, useState } from "react";
import { Button, Frame, GroupBox, MenuList, MenuListItem } from "react95";
import { getTokenStakeInfo } from "web3/script-get-token-stake-info";
import GumballMachine from "windows/GumCenterNew";

const GumSection = ({
  pool,
  tokenId,
  slots,
  claimedRewards,
  rewards,
}: {
  pool: string;
  tokenId: number | string;
  slots?: number;
  claimedRewards?: string | number;
  rewards?: string | number;
}) => {
  const { openWindow } = useWindowsContext();

  const multiplier = useMemo(() => {
    if (pool === "Flunks") return `+5 $GUM/day`;
    if (!slots) return "+1 $GUM/day";

    return `+${(1 + 0.1 * Number(slots)).toFixed(2)} $GUM/day`;
  }, [pool, slots]);

  return (
    <div className="mt-6 flex flex-col px-3 gap-0 max-w-[1440px] mx-auto">
      <Frame className="w-full !flex flex-col">
        <Frame
          variant="well"
          className="!flex items-center justify-between pl-2"
        >
          <span className="text-lg font-bold">$GUM INFORMATION</span>
          <Button
            className="!h-10"
            onClick={() => {
              openWindow({
                key: WINDOW_IDS.GUMBALL_MACHINE,
                window: <GumballMachine />,
              });
            }}
          >
            <img src="/images/icons/gum-machine.png" className="w-6 h-6" />
          </Button>
        </Frame>
        <Frame
          variant="field"
          className="!flex items-start justify-between px-3 py-3"
        >
          <span className="text-pretty text-lg font-bold">Earning rate</span>
          {slots && (
            <div className="flex flex-col items-end">
              <span className="text-pretty text-lg">{multiplier}</span>
              <div className="flex items-center justify-between gap-1  opacity-50">
                <span className="text-pretty text-lg">Base</span>
                <span className="text-pretty text-lg">+1.00 GUM</span>
              </div>
              <div className="flex items-center justify-between gap-1  opacity-50">
                <span className="text-pretty text-lg">{slots} Slots</span>
                <span className="text-pretty text-lg">
                  +{(0.1 * Number(slots)).toFixed(2)} GUM
                </span>
              </div>
            </div>
          )}
          {!slots && <span className="text-pretty text-lg">{multiplier}</span>}
        </Frame>
        {rewards && (
          <Frame
            variant="field"
            className="!flex items-start justify-between px-3 py-3"
          >
            <span className="text-pretty text-lg font-bold">Pending</span>
            <span className="text-pretty text-lg">
              {rewards.toLocaleString("en-US", {
                // add suffixes for thousands, millions, and billions
                // the maximum number of decimal places to use
                maximumFractionDigits: 2,
                // specify the abbreviations to use for the suffixes
                notation: "compact",
                compactDisplay: "short",
              })}{" "}
              $GUM
            </span>
          </Frame>
        )}
        {claimedRewards && (
          <Frame
            variant="field"
            className="!flex items-start justify-between px-3 py-3"
          >
            <span className="text-pretty text-lg font-bold">Total earned</span>
            <span className="text-pretty text-lg">
              {claimedRewards.toLocaleString("en-US", {
                // add suffixes for thousands, millions, and billions
                // the maximum number of decimal places to use
                maximumFractionDigits: 2,
                // specify the abbreviations to use for the suffixes
                notation: "compact",
                compactDisplay: "short",
              })}{" "}
              $GUM
            </span>
          </Frame>
        )}

        {/* <InfoItem label="Pool" value={pool} />
        {!slots && <InfoItem label="Earning Rate" value={multiplier} />}
        {slots && (
          <InfoItem
            label="Earning Rate"
            value={
              <div className="flex flex-col max-w-fit w-full min-w-[200px]">
                <span className="text-pretty text-lg">{multiplier}</span>
                <div className="flex items-center justify-between gap-1  opacity-50">
                  <span className="text-pretty text-lg">Base</span>
                  <span className="text-pretty text-lg">+1.00 GUM</span>
                </div>
                <div className="flex items-center justify-between gap-1  opacity-50">
                  <span className="text-pretty text-lg">{slots} Slots</span>
                  <span className="text-pretty text-lg">
                    +{(0.1 * Number(slots)).toFixed(2)} GUM
                  </span>
                </div>
                <span className="text-pretty text-lg"></span>
              </div>
            }
          />
        )}
        {claimedRewards && (
          <InfoItem label="Total Earned" value={claimedRewards} />
        )} */}
      </Frame>
      <div className="flex flex-col w-full"></div>
    </div>
  );
};

export default GumSection;
