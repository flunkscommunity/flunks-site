import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { InfoItem } from "components/Settings/UserInformation";
import { format } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { Frame, GroupBox } from "react95";
import { getTokenStakeInfo } from "web3/script-get-token-stake-info";

const POOL_TO_MULTIPLIER = {
  Flunks: "+5 $GUM per day",
  Backpacks: "+1 $GUM per day",
};

const GumSection = ({
  pool,
  tokenId,
  slots,
}: {
  pool: string;
  tokenId: number;
  slots?: number;
}) => {
  const multiplier = useMemo(() => {
    if (pool === "Flunks") return `+5 $GUM per day`;
    if (!slots) return "+1 $GUM per day";

    return `+${(1 + 0.1 * Number(slots)).toFixed(2)} $GUM per day`;
  }, [pool, slots]);

  return (
    <div className="mt-6 flex flex-col px-3 gap-0 max-w-[1440px] mx-auto">
      <span className="text-lg font-bold mb-2">$GUM INFORMATION</span>
      <Frame variant="well" className="w-full p-4 !flex flex-col gap-2">
        <InfoItem label="Pool" value={pool} />
        {!slots && <InfoItem label="$GUM Multiplier" value={multiplier} />}
        {slots && (
          <InfoItem
            label="$GUM Multiplier"
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
      </Frame>
      <div className="flex flex-col w-full"></div>
    </div>
  );
};

export default GumSection;
