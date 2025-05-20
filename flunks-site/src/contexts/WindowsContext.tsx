import React, { createContext, useContext, useState, ReactNode } from 'react';

type WindowContextType = {
  openWindows: string[];
  closeWindow: (windowId: string) => void;
  openWindow: (windowId: string) => void;
};

const WindowsContext = createContext<WindowContextType | undefined>(undefined);

export const WindowsProvider = ({ children }: { children: ReactNode }) => {
  const [openWindows, setOpenWindows] = useState<string[]>([]);

  const closeWindow = (windowId: string) => {
    setOpenWindows((prev) => prev.filter((id) => id !== windowId));
  };

  const openWindow = (windowId: string) => {
    setOpenWindows((prev) => Array.from(new Set([...prev, windowId])));
  };

  return (
    <WindowsContext.Provider value={{ openWindows, closeWindow, openWindow }}>
      {children}
    </WindowsContext.Provider>
  );
};

export const useWindowsContext = () => {
  const context = useContext(WindowsContext);
  if (context === undefined) {
    throw new Error('useWindowsContext must be used within a WindowsProvider');
  }
  return context;
};