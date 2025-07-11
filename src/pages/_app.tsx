import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";
import "config/fcl";

import "../styles/globals.css";
import WindowsProvider from "contexts/WindowsContext";
import ClaimBackpackProvider from "contexts/BackpackClaimContext";
import {
  DynamicContextProvider,
  DynamicUserProfile,
} from "@dynamic-labs/sdk-react-core";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import useThemeSettings from "store/useThemeSettings";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { PaginatedItemsProvider } from "contexts/UserPaginatedItems";

const ThemeWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useThemeSettings();
  return <ThemeProvider theme={theme.theme}>{children}</ThemeProvider>;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const memodGlobalStyles = React.useMemo(() => <GlobalStyles />, []);

  // Debug and fix FlowWalletConnectors
  const walletConnectors = React.useMemo(() => {
    console.log('FlowWalletConnectors type:', typeof FlowWalletConnectors);
    console.log('FlowWalletConnectors:', FlowWalletConnectors);
    console.log('Is array:', Array.isArray(FlowWalletConnectors));
    
    // If it's already an array, use it
    if (Array.isArray(FlowWalletConnectors)) {
      return FlowWalletConnectors;
    }
    
    // If it's an object with values that are functions, convert to array
    if (FlowWalletConnectors && typeof FlowWalletConnectors === 'object') {
      const connectors = Object.values(FlowWalletConnectors);
      console.log('Object values:', connectors);
      return connectors.filter(connector => typeof connector === 'function');
    }
    
    // Fallback to empty array to prevent crashes
    console.warn('FlowWalletConnectors is not in expected format, using empty array');
    return [];
  }, []);

  return (
    <>
      {memodGlobalStyles}
      <ThemeWrapper>
        <WindowsProvider>
          <ClaimBackpackProvider>
            <DynamicContextProvider
              settings={{
                environmentId: "379fb92a-c707-4bcb-bf51-37d9f64ff415",
                walletConnectors: walletConnectors,
              }}
            >
              <PaginatedItemsProvider>
                <Component {...pageProps} />
                <Analytics />
                <DynamicUserProfile />
              </PaginatedItemsProvider>
            </DynamicContextProvider>
          </ClaimBackpackProvider>
        </WindowsProvider>
      </ThemeWrapper>
    </>
  );
};

export default MyApp;
