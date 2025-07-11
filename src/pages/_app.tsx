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

  // Fix: Call the function to get the wallet connectors
  const walletConnectors = React.useMemo(() => {
    console.log('FlowWalletConnectors type:', typeof FlowWalletConnectors);
    
    if (typeof FlowWalletConnectors === 'function') {
      const connectors = FlowWalletConnectors(); // Call the function!
      console.log('Called FlowWalletConnectors():', connectors);
      return connectors;
    }
    
    if (Array.isArray(FlowWalletConnectors)) {
      return FlowWalletConnectors;
    }
    
    console.warn('FlowWalletConnectors is not in expected format');
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
