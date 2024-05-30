import axios from "axios";

// Types for the raw event data structure
interface RawClaimBlockEventData {
  backpackTokenID: string;
  flunkTokenID: string;
  signer: string;
}

interface RawClaimEventData {
  blockEventData: RawClaimBlockEventData;
  blockHeight: number;
  eventDate: string;
  flowEventId: string;
  flowTransactionId: string;
  id: string;
}

// Types for the formatted event data to be used in UI or further processing
interface FormattedClaimEventData {
  backpackTokenID?: string;
  flunkTokenID?: string;
  eventDate: string;
  flowTransactionId: string;
  signer: string;
}

export interface FormattedBackpackClaimData {
  flunksData: Record<string, FormattedClaimEventData> | null;
  backpackData: Record<string, FormattedClaimEventData> | null;
}

// The function to fetch and format the data
const getBackpackClaimedData =
  async (): Promise<FormattedBackpackClaimData> => {
    const url =
      "https://prod-main-net-dashboard-api.azurewebsites.net/api/company/ab832502-41e5-456c-95ec-a572bf5c10aa/search?eventType=A.807c3d470888cc48.BackpackMinter.BackpackClaimed";

    try {
      const response = await axios.get<RawClaimEventData[]>(url);
      const { data } = response;
      const formattedData = data.reduce(
        (accumulator, current) => {
          const { blockEventData, eventDate, flowTransactionId } = current;
          const { backpackTokenID, flunkTokenID, signer } = blockEventData;

          accumulator.flunksData[flunkTokenID] = {
            backpackTokenID,
            eventDate,
            flowTransactionId,
            signer,
          };

          accumulator.backpackData[backpackTokenID] = {
            flunkTokenID,
            eventDate,
            flowTransactionId,
            signer,
          };

          return accumulator;
        },
        { flunksData: {}, backpackData: {} } as FormattedBackpackClaimData
      );

      return formattedData;
    } catch (error) {
      console.error("Failed to fetch Backpack Claimed data:", error);
      return { flunksData: null, backpackData: null };
    }
  };

export default getBackpackClaimedData;
