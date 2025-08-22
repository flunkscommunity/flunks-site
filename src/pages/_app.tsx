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
import { enhanceFlowWalletDetection } from '../utils/flowWalletDetection';
import { PaginatedItemsProvider } from "contexts/UserPaginatedItems";
import { UserProfileProvider } from "contexts/UserProfileContext";
import { AudioProvider } from "contexts/AudioContext";
import { RadioProvider } from "contexts/RadioContext";
import { GumProvider } from "contexts/GumContext";
import { GumDisplay } from "components/GumDisplay";
import UserProfilePrompt from "components/UserProfile/UserProfilePrompt";
import SmartWalletDetection from "components/SmartWalletDetection";
import CleanMobileWalletSelector from "components/CleanMobileWalletSelector";

const ThemeWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useThemeSettings();
  return <ThemeProvider theme={theme.theme}>{children}</ThemeProvider>;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const memodGlobalStyles = React.useMemo(() => <GlobalStyles />, []);

  // Start wallet branding fix and enhance detection on component mount
  React.useEffect(() => {
    startWalletBrandingFix();
    
    // Enhance Flow Wallet detection for Dynamic Labs
    const enhanceDetection = async () => {
      // Wait a bit for extensions to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      enhanceFlowWalletDetection();
    };
    
    enhanceDetection();
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
                    environmentId:
                      process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ||
                      "53675303-5e80-4fe5-88a4-e6caae677432",
                    walletConnectors: [FlowWalletConnectors],
                    // Simplified wallet detection for reliability
                    initialAuthenticationMode: 'connect-only',
                    walletsFilter: (wallets) => {
                      console.log('🔍 Original Dynamic wallets:', wallets.map(w => ({ 
                        key: w.key, 
                        name: w.name,
                        isInstalled: (w as any).isInstalled
                      })));

                      // Check if we're on mobile
                      const isMobile = typeof window !== "undefined" &&
                        (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
                          window.navigator.userAgent
                        ) || 'ontouchstart' in window);

                      // On mobile, show Dapper and Blocto (which work reliably on mobile)
                      if (isMobile) {
                        console.log('📱 Mobile detected - showing mobile-friendly wallets');
                        const mobileWallets = wallets.filter(w => 
                          w.key.toLowerCase().includes('dapper') || 
                          w.key.toLowerCase().includes('blocto')
                        );
                        console.log('📱 Mobile wallets:', mobileWallets.map(w => w.key));
                        return mobileWallets;
                      }

                      // On desktop, prioritize Flow wallets but keep all
                      console.log('�️ Desktop detected - showing all wallets with Flow priority');
                      const flowKeysPriority = ["flowwallet", "lilico", "flow", "blocto", "dapper"];
                      
                      const sorted = [...wallets].sort((a, b) => {
                        const ai = flowKeysPriority.findIndex(p => a.key.toLowerCase().includes(p));
                        const bi = flowKeysPriority.findIndex(p => b.key.toLowerCase().includes(p));
                        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                      });

                      console.log('️ Desktop wallets (sorted):', sorted.map(w => w.key));
                      return sorted;
                    },
                    overrides: {
                      views: [
                        {
                          type: SdkViewType.Login,
                          sections: [
                            {
                              type: SdkViewSectionType.Wallet,
                              defaultItem: (() => {
                                const isMobile = typeof window !== "undefined" &&
                                  (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
                                    window.navigator.userAgent
                                  ) || 'ontouchstart' in window);
                                
                                // On mobile, show Dapper as default (most reliable)
                                if (isMobile) {
                                  console.log('📱 Mobile: Defaulting to Dapper');
                                  return "dapper";
                                }
                                
                                // On desktop, default to flowwallet/lilico
                                console.log('�️ Desktop: Defaulting to Flow Wallet');
                                return "flowwallet";
                              })(),
                            },
                          ],
                        },
                      ],
                    },
                    events: {
                      onAuthSuccess: (args) => {
                        console.log("🎉 Dynamic Auth success", args);
                      },
                      onAuthFailure: (args) => {
                        console.log("❌ Dynamic Auth failure", args);
                      },
                      onAuthFlowOpen: () => {
                        console.log("🔓 Dynamic Auth flow opened");
                      },
                      onAuthFlowClose: () => {
                        console.log("🔒 Dynamic Auth flow closed");
                      },
                    },
                  }}
                >
                  <UserProfileProvider>
                    <PaginatedItemsProvider>
                      <GumProvider>
                        <div className="app-container min-h-screen w-full overflow-hidden">
                          <Component {...pageProps} />
                        </div>
                        <Analytics />
                        {/* Global Profile Creation Prompt - only show when needed */}
                        <UserProfilePrompt autoShow={false} showToast={false} />
                        {/* Smart Wallet Detection - handles desktop vs mobile properly */}
                        <SmartWalletDetection />
                        {/* Clean Mobile Wallet Selector - no debug components */}
                        <CleanMobileWalletSelector />
                        <DynamicUserProfile />
                      </GumProvider>
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
