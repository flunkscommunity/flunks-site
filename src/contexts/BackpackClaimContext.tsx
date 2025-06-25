import getBackpackClaimedData, {
  FormattedBackpackClaimData,
} from "pages/api/getBackpackClaimedData";
import React, { createContext, useContext } from "react";
import useSWR from "swr";

interface ContextProps {
  state: FormattedBackpackClaimData;
  refreshClaimData: () => void;
}

export const ClaimBackpackContext = createContext<ContextProps>(null!);

const ClaimBackpackProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const { children } = props;

  const { data, mutate } = useSWR("claimData", getBackpackClaimedData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateIfStale: false,
  });

  return (
    <ClaimBackpackContext.Provider
      value={{
        state: data,
        refreshClaimData: mutate,
      }}
    >
      {children}
    </ClaimBackpackContext.Provider>
  );
};

export const useBackpackClaimed = () => {
  const { state, refreshClaimData } = useContext(ClaimBackpackContext);

  const { flunksData, backpackData } = state || {};

  return { flunksData, backpackData, refreshClaimData };
};

export default ClaimBackpackProvider;
