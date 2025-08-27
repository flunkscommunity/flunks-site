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
import { AuthProvider } from "contexts/AuthContext";
import { GumDisplay } from "components/GumDisplay";
import UserProfilePrompt from "components/UserProfile/UserProfilePrompt";
// Removed mobile wallet components to show standard Dynamic installation
// import SmartWalletDetection from "components/SmartWalletDetection";
// import CleanMobileWalletSelector from "components/CleanMobileWalletSelector";

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
                    // Debug what wallets are available in v3
                    walletsFilter: (wallets) => {
                      console.log('🔍 Dynamic v3 available wallets:', wallets.map(w => ({ 
                        key: w.key, 
                        name: w.name,
                        mobile: (w as any).mobile,
                        installed: (w as any).isInstalled
                      })));
                      
                      // Return all wallets for now to see what's available
                      return wallets;
                    },
                    // Simplified configuration for mobile compatibility
                    initialAuthenticationMode: 'connect-only',
                    overrides: {
                      views: [
                        {
                          type: SdkViewType.Login,
                          sections: [
                            {
                              type: SdkViewSectionType.Wallet,
                              // No default wallet selection - let Dynamic Labs choose naturally
                              defaultItem: undefined,
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
                      <AuthProvider>
                        <GumProvider>
                          <div className="app-container min-h-screen w-full overflow-hidden">
                            <Component {...pageProps} />
                          </div>
                          <Analytics />
                          {/* Global Profile Creation Prompt - only show when needed */}
                          <UserProfilePrompt autoShow={false} showToast={false} />
                          {/* Removed all mobile wallet helper components to show standard Dynamic installation */}
                          {/* <SmartWalletDetection /> */}
                          {/* <CleanMobileWalletSelector /> */}
                          <DynamicUserProfile />
                        </GumProvider>
                      </AuthProvider>
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
