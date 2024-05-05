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

const GumSection = ({ pool, tokenId }) => {
  return (
    <div className="mt-6 flex flex-col px-3 gap-0">
      <span className="text-lg font-bold mb-2">$GUM INFORMATION</span>
      <Frame variant="well" className="w-full p-4 !flex flex-col gap-2">
        <InfoItem label="Pool" value={pool} />
        <InfoItem label="Token ID" value={tokenId} />
        <InfoItem
          label="$GUM Multiplier"
          value={POOL_TO_MULTIPLIER[pool as keyof typeof POOL_TO_MULTIPLIER]}
        />
      </Frame>
      <div className="flex flex-col w-full"></div>
    </div>
  );
};

export default GumSection;
