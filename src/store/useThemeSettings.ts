import create from "zustand";
import { persist } from "zustand/middleware";
import index from "react95/dist/themes/index";
import { Theme } from "react95/dist/types";

interface useThemeSettings {
  backgroundColor: string;
  setBackgroundColor: (arg: string) => void;
  backgroundImage: string;
  setBackgroundImage: (arg: string) => void;
  oldMonitorMode: boolean;
  setOldMonitorMode: (arg: boolean) => void;
  theme: {
    name: keyof typeof index;
    theme: typeof index;
  };
  setTheme: (arg: { name: keyof typeof index; theme: typeof index }) => void;
}

const useThemeSettings = create<useThemeSettings>()(
  persist(
    // @ts-ignore
    (set) => {
      return {
        backgroundColor: "#008585",
        setBackgroundColor: (backgroundColor: string) =>
          set((state) => ({ backgroundColor })),
        backgroundImage:
          "https://storage.googleapis.com/flunks_public/desktop-backgrounds/posterized.webp",
        setBackgroundImage: (backgroundImage: string) =>
          set((state) => ({ backgroundImage })),
        oldMonitorMode: false,
        setOldMonitorMode: (oldMonitorMode: boolean) =>
          set((state) => ({ oldMonitorMode })),
        theme: {
          name: "millenium",
          theme: index.millenium as Theme,
        },
        setTheme: (theme: { name: keyof typeof index; theme: typeof index }) =>
          set((state) => ({ theme })),
      };
    },
    {
      name: "THEME_SETTINGS",
      getStorage: () => localStorage,
    }
  )
);

export default useThemeSettings;
