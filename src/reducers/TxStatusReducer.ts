export enum TX_STATUS {
  PENDING = "PENDING",
  STARTED = "STARTED",
  SUCCESS = "SEALED",
  ERROR = "ERROR",
  DEFAULT = "DEFAULT",
}

export interface TxReducerState {
  txStatus: TX_STATUS;
  txMessage: string;
  txName?: string;
}

export interface TxReducerActions {
  type: "UPDATE_STATUS" | "RESET";
  txStatus: TX_STATUS;
  txMessage?: string;
  txName?: string;
}

const reducer = (state: TxReducerState, action: TxReducerActions) => {
  const { type, txStatus, txMessage, txName } = action;

  switch (type) {
    case "UPDATE_STATUS": {
      return {
        ...state,
        txStatus,
        txMessage: txMessage || state.txMessage,
        txName: txName || state.txName,
      };
    }
    case "RESET": {
      return {
        ...state,
        txStatus: TX_STATUS.DEFAULT,
        txMessage: "",
        txName: "",
      };
    }
    default:
      return state;
  }
};

export const initialState: TxReducerState = {
  txStatus: TX_STATUS.DEFAULT,
  txMessage: "",
  txName: "",
};

export default reducer;
