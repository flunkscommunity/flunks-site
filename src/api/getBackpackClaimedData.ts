// https://prod-main-net-dashboard-api.azurewebsites.net/api/company/ab832502-41e5-456c-95ec-a572bf5c10aa/search?eventType=A.807c3d470888cc48.BackpackMinter.BackpackClaimed
import client from "./axios";

type ClaimBlockEventData = {
  backpackTokenID: string;
  flunkTokenID: string;
  signer: string;
};

type ClaimEventData = {
  blockEventData: ClaimBlockEventData;
  blockHeight: number;
  eventDate: string;
  flowEventId: string;
  flowTransactionId: string;
  id: string;
};

export interface FormattedClaimEventData {
  backpackTokenID?: string;
  flunkTokenID?: string;
  eventDate: string;
  flowTransactionId: string;
  signer: string;
}

export interface FormattedBackpackClaimData {
  flunksData: {
    [key: string]: FormattedClaimEventData;
  } | null;
  backpackData: {
    [key: string]: FormattedClaimEventData;
  } | null;
}

const getBackpackClaimedData =
  async (): Promise<FormattedBackpackClaimData> => {
    const url = `https://prod-main-net-dashboard-api.azurewebsites.net/api/company/ab832502-41e5-456c-95ec-a572bf5c10aa/search?eventType=A.807c3d470888cc48.BackpackMinter.BackpackClaimed`;

    const cb = (curr: any, event: ClaimEventData) => {
      const { blockEventData, eventDate, flowTransactionId } = event;
      const { backpackTokenID, flunkTokenID, signer } = blockEventData;
      return {
        flunksData: {
          ...curr["flunksData"],
          [flunkTokenID]: {
            backpackTokenID,
            eventDate,
            flowTransactionId,
            signer,
          },
        },
        backpackData: {
          ...curr["backpackData"],
          [backpackTokenID]: {
            flunkTokenID,
            eventDate,
            flowTransactionId,
            signer,
          },
        },
      };
    };

    return client
      .get(url)
      .then((res) => res.data)
      .then((data) => {
        const formatted = data.reduce(cb, { flunksData: {}, backpackData: {} });
        return formatted;
      });
  };

export default getBackpackClaimedData;
