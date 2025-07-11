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

  // Enhanced debugging for wallet connectors
  const walletConnectors = React.useMemo(() => {
    console.log('=== WALLET CONNECTOR DEBUG ===');
    console.log('FlowWalletConnectors type:', typeof FlowWalletConnectors);
    console.log('FlowWalletConnectors:', FlowWalletConnectors);
    
    if (typeof FlowWalletConnectors === 'function') {
      try {
        const connectorClasses = FlowWalletConnectors();
        console.log('connectorClasses:', connectorClasses);
        console.log('connectorClasses isArray:', Array.isArray(connectorClasses));
        console.log('connectorClasses length:', connectorClasses?.length);
        
        if (Array.isArray(connectorClasses) && connectorClasses.length > 0) {
          const instantiatedConnectors = connectorClasses.map((ConnectorClass, index) => {
            console.log(`Trying to instantiate connector ${index}:`, ConnectorClass);
            try {
              const instance = new ConnectorClass();
              console.log(`Successfully instantiated connector ${index}:`, instance);
              return instance;
            } catch (error) {
              console.error(`Error instantiating connector ${index}:`, error);
              return null;
            }
          }).filter(Boolean);
          
          console.log('Final instantiated connectors:', instantiatedConnectors);
          console.log('Final connectors length:', instantiatedConnectors.length);
          return instantiatedConnectors;
        } else {
          console.error('connectorClasses is empty or not an array');
          return [];
        }
      } catch (error) {
        console.error('Error calling FlowWalletConnectors():', error);
        return [];
      }
    }
    
    console.warn('FlowWalletConnectors is not a function');
    return [];
  }, []);

  console.log('FINAL walletConnectors being passed to Dynamic:', walletConnectors);
  console.log('FINAL walletConnectors length:', walletConnectors.length);

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
