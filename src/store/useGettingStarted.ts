import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isMobileApp } from "utils/buildMode";

interface GettingStartedStore {
  showGettingStartedOnStartup: boolean;
  setShowGettingStartedOnStartup: (arg: boolean) => void;
}

const useGettingStarted = create<GettingStartedStore>()(
  persist(
    // @ts-ignore
    (set, get) => {
      return {
        showGettingStartedOnStartup: false,
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
          const parsed = str ? JSON.parse(str) : null;
          // NEVER show Getting Started on mobile app, regardless of stored value
          if (parsed && typeof window !== 'undefined') {
            // Check if mobile after a tiny delay to ensure Capacitor is loaded
            const checkMobile = () => {
              if (isMobileApp()) {
                parsed.state.showGettingStartedOnStartup = false;
              }
            };
            // Run check immediately and also after delay
            checkMobile();
            setTimeout(checkMobile, 50);
          }
          return parsed;
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
