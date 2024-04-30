import * as fcl from "@onflow/fcl";
import React, { useContext, useReducer } from "react";
import txStatusReducer, {
  initialState,
  TX_STATUS,
} from "reducers/TxStatusReducer";

interface FclTransactionContextType {
  state: {
    txStatus: TX_STATUS;
    txMessage: string;
  };
  dispatch: React.Dispatch<any>;
  executeTx: (tx: () => Promise<string>) => void;
  resetState: () => void;
}

const FclTransactionContext =
  React.createContext<FclTransactionContextType>(null);

export const useFclTransactionContext = () => useContext(FclTransactionContext);

export const FclTransactionProvider = ({ children }: any) => {
  const [state, dispatch] = useReducer(txStatusReducer, initialState);

  const resetState = () => {
    dispatch({ type: "RESET", txStatus: TX_STATUS.DEFAULT });
  };

  const executeTx = async (tx: () => Promise<string>) => {
    let unsub;
    try {
      dispatch({ type: "UPDATE_STATUS", txStatus: TX_STATUS.STARTED });

      const txId = await tx();

      dispatch({ type: "UPDATE_STATUS", txStatus: TX_STATUS.PENDING });

      unsub = await fcl.tx(txId).subscribe((newState) => {
        console.log("executeTx STATE CHANGED", newState);
      });

      // txStatus returns either `success` or `error`
      const txStatus = await fcl.tx(txId).onceSealed();

      // When transaction succeeds, `txStatus` will be an Object:
      // see `SAMPLE_TX_STATUS_SUCCESS` at the end of this file
      if (txStatus && txStatus.status === 4 && txStatus.statusCode === 0) {
        dispatch({
          type: "UPDATE_STATUS",
          txStatus: TX_STATUS.SUCCESS,
        });
        // printing tx data for now, since we might want to look at the transaction events
        console.log("txStatus", txStatus);
      } else {
        console.log("txStatus", txStatus);
        dispatch({
          type: "UPDATE_STATUS",
          txStatus: TX_STATUS.ERROR,
        });
      }
    } catch (error) {
      console.error(error);
      dispatch({
        type: "UPDATE_STATUS",
        txStatus: TX_STATUS.ERROR,
        txMessage: error.toString() as string,
      });
    } finally {
      if (unsub) {
        unsub();
      }
    }
  };

  return (
    <FclTransactionContext.Provider
      value={{ state, dispatch, executeTx, resetState }}
    >
      {children}
    </FclTransactionContext.Provider>
  );
};
