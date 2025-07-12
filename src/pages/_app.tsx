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
  DynamicWidget,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { SdkViewSectionType, SdkViewType } from "@dynamic-labs/sdk-api";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import useThemeSettings from "store/useThemeSettings";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { PaginatedItemsProvider } from "contexts/UserPaginatedItems";

const ThemeWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useThemeSettings();
  return <ThemeProvider theme={theme.theme}>{children}</ThemeProvider>;
};

// Debug component to log available wallet keys
const WalletDebugger: React.FC = () => {
  const { walletConnectors } = useDynamicContext();

  React.useEffect(() => {
    if (walletConnectors && walletConnectors.length > 0) {
      console.log("=== AVAILABLE WALLETS ===");
      walletConnectors.forEach((wallet) => {
        console.log(`Key: "${wallet.key}", Name: "${wallet.name}"`);
      });
    }
  }, [walletConnectors]);

  return null;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const memodGlobalStyles = React.useMemo(() => <GlobalStyles />, []);

  return (
    <>
      {memodGlobalStyles}
      <ThemeWrapper>
        <WindowsProvider>
          <ClaimBackpackProvider>
            <DynamicContextProvider
              settings={{
                environmentId: "4e1ca7d6-a9b6-4440-a87d-e44a4b110882",
                walletConnectors: [FlowWalletConnectors],
                // Remove overrides temporarily to see all available wallets
              }}
            >
              <WalletDebugger />
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
