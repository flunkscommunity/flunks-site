import { create } from "zustand";
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
          "/images/my-background.png",
        setBackgroundImage: (backgroundImage: string) =>
          set((state) => ({ backgroundImage })),
        // Desktop background settings (separate from login background)
        desktopBackground: "/images/my-background.png",
        setDesktopBackground: (desktopBackground: string) =>
          set((state) => ({ desktopBackground })),
        desktopBackgroundType: 'image' as 'image',
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
    }
  )
);

export default useThemeSettings;
