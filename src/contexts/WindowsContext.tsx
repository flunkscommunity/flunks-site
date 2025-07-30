import { WINDOW_APP_INFO_TO_WINDOW_ID, WINDOW_IDS } from "fixed";
import React, { useContext, createContext, useState, useEffect } from "react";
import { track } from "@vercel/analytics";

interface WindowApp {
  key: string;
  appName: string;
  appIcon: string;
  isMinimized?: boolean;
}

interface ContextState {
  windows: Record<string, React.ReactNode>;
  windowApps: WindowApp[];
  openWindow: (window: { key: string; window: React.ReactNode }) => void;
  closeWindow: (windowId: string) => void;
  bringWindowToFront: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  activeWindow: string;
}

export const WindowsContext = createContext<ContextState>({
  windows: {},
  windowApps: [],
  openWindow: () => { },
  closeWindow: () => { },
  bringWindowToFront: () => { },
  activeWindow: "",
  minimizeWindow: function (windowId: string): void {
    throw new Error("Function not implemented.");
  },
  restoreWindow: function (windowId: string): void {
    throw new Error("Function not implemented.");
  }
});

interface ProviderProps {
  children: React.ReactNode;
}

const WindowsProvider: React.FC<ProviderProps> = (props) => {
  const { children } = props;
  const [windows, setWindows] = useState<Record<string, React.ReactNode>>({});
  const [windowApps, setWindowApps] = useState<WindowApp[]>([]);
  const [activeWindow, setActiveWindow] = useState<string>("");

  const bringWindowToFront = (windowKey: string) => {
    const windowElement = document.getElementById(windowKey);
    let maxZ = 0;

    if (!windowElement?.parentElement) return;

    for (let child of Array.from(
      windowElement?.parentElement?.children || []
    )) {
      if ((child as HTMLDivElement).style.zIndex) {
        const zIndex = parseInt((child as HTMLDivElement).style.zIndex);
        if (zIndex > maxZ) {
          maxZ = zIndex;
        }
      }
    }

    windowElement.style.zIndex = `${maxZ + 1}`;
    setActiveWindow(windowKey);
  };

  const openWindow = (window: { key: string; window: React.ReactNode }) => {
    const { key, window: _window } = window;

    if (key !== WINDOW_IDS.WELCOME) {
      track("Window Opened", { window: key });
    }

    // If window is already open, bring it to the front of the UI by setting z-index
    if (windows[key]) {
      setTimeout(() => {
        bringWindowToFront(key);
      }, 0);

      return;
    }

    setWindows((windows) => ({
      ...windows,
      [key]: _window,
    }));

    if (WINDOW_APP_INFO_TO_WINDOW_ID[key]) {
      setActiveWindow(key);
      addWindowApp(WINDOW_APP_INFO_TO_WINDOW_ID[key]);
    }
  };

  const closeWindow = (windowKey: string) => {
    setWindows((windows) => {
      const { [windowKey]: _, ...rest } = windows;
      return rest;
    });

    if (WINDOW_APP_INFO_TO_WINDOW_ID[windowKey]) {
      removeWindowApp(WINDOW_APP_INFO_TO_WINDOW_ID[windowKey]);
    }
  };

  const addWindowApp = (windowApp: WindowApp) => {
    setWindowApps((windowApps) => [...windowApps, windowApp]);
  };

  const removeWindowApp = (windowApp: WindowApp) => {
    setWindowApps((windowApps) => {
      return windowApps.filter((app) => app.key !== windowApp.key);
    });
  };

const minimizeWindow = (windowKey: string) => {
  setWindowApps((apps) =>
    apps.map((app) =>
      app.key === windowKey ? { ...app, isMinimized: true } : app
    )
  );
};

const restoreWindow = (windowKey: string) => {
  setWindowApps((apps) =>
    apps.map((app) =>
      app.key === windowKey ? { ...app, isMinimized: false } : app
    )
  );
  bringWindowToFront(windowKey);
};


  return (
    <WindowsContext.Provider
      value={{
        windows,
        windowApps,
        openWindow,
        closeWindow,
        bringWindowToFront,
        minimizeWindow,
        restoreWindow,
        activeWindow,
      }}
    >
      {children}
    </WindowsContext.Provider>
  );
};

export const useWindowsContext = (): ContextState => {
  return useContext(WindowsContext);
};

export default WindowsProvider;
