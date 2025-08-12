import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";
import "config/fcl";

import "../styles/globals.css";
import "../styles/dynamic-fixes.css";
import WindowsProvider from "contexts/WindowsContext";
import ClaimBackpackProvider from "contexts/BackpackClaimContext";
import {
  DynamicContextProvider,
  DynamicUserProfile,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { SdkViewSectionType, SdkViewType } from "@dynamic-labs/sdk-api";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import useThemeSettings from "store/useThemeSettings";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { startWalletBrandingFix } from "utils/walletBrandingFix";
import { PaginatedItemsProvider } from "contexts/UserPaginatedItems";
import { UserProfileProvider } from "contexts/UserProfileContext";
import { AudioProvider } from "contexts/AudioContext";
import { RadioProvider } from "contexts/RadioContext";

const ThemeWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useThemeSettings();
  return <ThemeProvider theme={theme.theme}>{children}</ThemeProvider>;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const memodGlobalStyles = React.useMemo(() => <GlobalStyles />, []);

  // Start wallet branding fix on component mount
  React.useEffect(() => {
    startWalletBrandingFix();
  }, []);

  return (
    <>
      {memodGlobalStyles}
      <ThemeWrapper>
        <AudioProvider>
          <RadioProvider>
            <WindowsProvider>
              <ClaimBackpackProvider>
                <DynamicContextProvider
                  settings={{
                    environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "53675303-5e80-4fe5-88a4-e6caae677432",
                    walletConnectors: [FlowWalletConnectors],
                    walletsFilter: (wallets) => {
                      // Enhanced debugging for all available wallets
                      console.log('🔍 ALL AVAILABLE WALLETS:', wallets.map(w => ({ 
                        key: w.key, 
                        name: w.name
                      })));
                      
                      // Return ALL wallets to see what's available
                      return wallets;
                    },
                    overrides: {
                      views: [
                        {
                          type: SdkViewType.Login,
                          sections: [
                            {
                              type: SdkViewSectionType.Wallet,
                              // Default to Flow Wallet instead of Lilico
                              defaultItem: "flowwallet",
                            },
                          ],
                        },
                      ],
                    },
                    // Additional settings to ensure proper wallet detection
                    eventsCallbacks: {
                      onAuthSuccess: (args) => {
                        console.log('🎉 Auth success:', args);
                      },
                      onAuthFailure: (args) => {
                        console.log('❌ Auth failure:', args);
                      },
                      onWalletAdded: (args) => {
                        console.log('🔗 Wallet added:', args);
                      },
                      onWalletRemoved: (args) => {
                        console.log('🔌 Wallet removed:', args);
                      }
                    }
                  }}
                >
                  <UserProfileProvider>
                    <PaginatedItemsProvider>
                      <div className="app-container min-h-screen w-full overflow-hidden">
                        <Component {...pageProps} />
                      </div>
                      <Analytics />
                      <DynamicUserProfile />
                    </PaginatedItemsProvider>
                  </UserProfileProvider>
                </DynamicContextProvider>
              </ClaimBackpackProvider>
            </WindowsProvider>
          </RadioProvider>
        </AudioProvider>
      </ThemeWrapper>
    </>
  );
};

export default MyApp;
