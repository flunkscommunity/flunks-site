import { create } from "zustand";
import { persist } from "zustand/middleware";

interface GettingStartedStore {
  showGettingStartedOnStartup: boolean;
  setShowGettingStartedOnStartup: (arg: boolean) => void;
}

const useGettingStarted = create<GettingStartedStore>()(
  persist(
    // @ts-ignore
    (set) => {
      return {
        showGettingStartedOnStartup: true,
        setShowGettingStartedOnStartup: (
          showGettingStartedOnStartup: boolean
        ) => set((state) => ({ showGettingStartedOnStartup })),
      };
    },
    {
      name: "GETTING_STARTED_SETTINGS",
      getStorage: () => localStorage,
      version: 1,
    }
  )
);

export default useGettingStarted;
