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
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
      version: 1,
    }
  )
);

export default useGettingStarted;
