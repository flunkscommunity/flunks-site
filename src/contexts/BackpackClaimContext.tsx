import getBackpackClaimedData, {
  FormattedBackpackClaimData,
} from "api/getBackpackClaimedData";
import { useRouter } from "next/router";
import React, { createContext, useContext, useEffect, useReducer } from "react";
import reducer from "reducers/ClaimDataReducer";

interface ContextProps {
  state: FormattedBackpackClaimData;
  refreshClaimData: () => void;
}

export const ClaimBackpackContext = createContext<ContextProps>(null!);

const ClaimBackpackProvider: React.FC<{ children: React.ReactNode }> = (
  props
) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, {
    flunksData: null,
    backpackData: null,
  });
  const router = useRouter();

  const refreshClaimData = () => {
    dispatch({ type: "LOADING" });
    getBackpackClaimedData().then((data) => {
      dispatch({ type: "REFRESHED", payload: data });
    });
  };

  useEffect(() => {
    const negateLoadingTime = router.asPath === "/" ? 30000 : 10000;
    setTimeout(refreshClaimData, negateLoadingTime);
  }, []);

  return (
    <ClaimBackpackContext.Provider
      value={{
        state,
        refreshClaimData,
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
