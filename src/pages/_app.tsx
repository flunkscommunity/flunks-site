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
import WalletDebugger from "../components/WalletDebugger";
import useThemeSettings from "store/useThemeSettings";
import React from "react";
import { Analytics } from "@vercel/analytics/react";
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
                      // Enhanced debugging for Lilico wallet detection
                      console.log('🔍 All available wallets:', wallets.map(w => ({ 
                        key: w.key, 
                        name: w.name
                      })));
                      
                      // Filter to include specific Flow wallets we want
                      const flowWallets = wallets.filter(wallet => 
                        wallet.key === 'flowwallet' || // Lilico/Flow Wallet
                        wallet.key === 'lilico' ||     // Alternative key for Lilico
                        wallet.key === 'flow' ||       // Alternative key for Flow Wallet
                        wallet.key === 'blocto' ||     // Blocto
                        wallet.key === 'dapper' ||     // Dapper
                        wallet.name?.toLowerCase().includes('lilico') || // Name-based matching
                        wallet.name?.toLowerCase().includes('flow wallet')
                      );
                      
                      console.log('✅ Filtered Flow wallets:', flowWallets.map(w => ({ 
                        key: w.key, 
                        name: w.name
                      })));
                      
                      // Log specifically for Lilico detection
                      const lilicoWallet = flowWallets.find(w => 
                        w.key === 'lilico' || 
                        w.key === 'flowwallet' ||
                        w.name?.toLowerCase().includes('lilico')
                      );
                      console.log('🌊 Lilico wallet found:', lilicoWallet);
                      
                      // If no specific Flow wallets found, return all (fallback)
                      return flowWallets.length > 0 ? flowWallets : wallets;
                    },
                    overrides: {
                      views: [
                        {
                          type: SdkViewType.Login,
                          sections: [
                            {
                              type: SdkViewSectionType.Wallet,
                              // Try multiple potential keys for Lilico
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
                      }
                    }
                  }}
                >
                  <UserProfileProvider>
                    <PaginatedItemsProvider>
                      <div className="app-container min-h-screen w-full overflow-hidden">
                        <Component {...pageProps} />
                        {process.env.NODE_ENV === 'development' && <WalletDebugger />}
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
