import React, { useContext, createContext, useState, useEffect } from "react";

interface ContextState {
  windows: Record<string, React.ReactNode>;
  openWindow: (window: Record<string, React.ReactNode>) => void;
  closeWindow: (windowId: string) => void;
}

export const WindowsContext = createContext<ContextState>({
  windows: {},
  openWindow: () => {},
  closeWindow: () => {},
});

interface ProviderProps {
  children: React.ReactNode;
}

const WindowsProvider: React.FC<ProviderProps> = (props) => {
  const { children } = props;
  const [windows, setWindows] = useState<Record<string, React.ReactNode>>({});

  const openWindow = (window: { key: string; window: React.ReactNode }) => {
    const { key, window: _window } = window;
    setWindows((windows) => ({
      ...windows,
      [key]: _window,
    }));
  };

  const closeWindow = (windowKey: string) => {
    setWindows((windows) => {
      const { [windowKey]: _, ...rest } = windows;
      return rest;
    });
  };

  useEffect(() => {
    // console.log("windows", windows);
  });

  return (
    <WindowsContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
      }}
    >
      {children}
    </WindowsContext.Provider>
  );
};

export const useWindowsContext = (): ContextState => {
  const { windows, openWindow, closeWindow } = useContext(WindowsContext);

  return {
    windows,
    openWindow,
    closeWindow,
  };
};

export default WindowsProvider;
