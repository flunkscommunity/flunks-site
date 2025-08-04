import create from "zustand";
import { persist } from "zustand/middleware";
import index from "react95/dist/themes/index";
import { Theme } from "react95/dist/types";

interface useThemeSettings {
  backgroundColor: string;
  setBackgroundColor: (arg: string) => void;
  backgroundImage: string;
  setBackgroundImage: (arg: string) => void;
  desktopBackground: string;
  setDesktopBackground: (arg: string) => void;
  desktopBackgroundType: 'image' | 'pattern' | 'gradient';
  setDesktopBackgroundType: (arg: 'image' | 'pattern' | 'gradient') => void;
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
        // Desktop background settings (separate from login background)
        desktopBackground: `
          background: linear-gradient(45deg, #008080 25%, transparent 25%), 
                      linear-gradient(-45deg, #008080 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #4FD0D0 75%), 
                      linear-gradient(-45deg, transparent 75%, #4FD0D0 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: #C0C0C0;
        `,
        setDesktopBackground: (desktopBackground: string) =>
          set((state) => ({ desktopBackground })),
        desktopBackgroundType: 'pattern' as 'pattern',
        setDesktopBackgroundType: (desktopBackgroundType: 'image' | 'pattern' | 'gradient') =>
          set((state) => ({ desktopBackgroundType })),
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
