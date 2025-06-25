import { FormattedBackpackClaimData } from "pages/api/getBackpackClaimedData";

export interface ClaimDataReducerActions {
  type: "LOADING" | "REFRESHED";
  payload?: FormattedBackpackClaimData;
}

const reducer = (
  state: FormattedBackpackClaimData,
  action: ClaimDataReducerActions
) => {
  const { type, payload } = action;

  switch (type) {
    case "LOADING": {
      return {
        ...state,
        flunksData: null,
        backpackData: null,
      };
    }
    case "REFRESHED": {
      if (!payload) {
        return state;
      }

      return payload;
    }
  }
};

export const init = (
  payload = {
    flunksData: {},
    backpackData: {},
  }
) => {
  return payload;
};

export default reducer;
