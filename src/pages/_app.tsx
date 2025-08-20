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
import MobileWalletDebugger from '../components/MobileWalletDebugger';
import { PaginatedItemsProvider } from "contexts/UserPaginatedItems";
import { UserProfileProvider } from "contexts/UserProfileContext";
import { AudioProvider } from "contexts/AudioContext";
import { RadioProvider } from "contexts/RadioContext";
import { GumProvider } from "contexts/GumContext";
import { GumDisplay } from "components/GumDisplay";
import UserProfilePrompt from "components/UserProfile/UserProfilePrompt";
import MobileFlowWalletConnection from "components/MobileFlowWalletConnection";

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
                    // Enhanced wallet detection
                    initialAuthenticationMode: 'connect-only',
                    // Custom wallet filtering + ordering for better mobile UX
                    walletsFilter: (wallets) => {
                      const isMobile =
                        typeof window !== "undefined" &&
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                          window.navigator.userAgent
                        );

                      // Check for force override (for debugging)
                      const forceShowAll = typeof window !== "undefined" && 
                        (window as any).FORCE_SHOW_ALL_WALLETS;

                      if (forceShowAll) {
                        console.log('🚨 FORCE_SHOW_ALL_WALLETS enabled - showing all wallets');
                        return wallets;
                      }

                      // Log once per render pass
                      try {
                        console.log(
                          "🔍 Dynamic wallets (pre-filter)",
                          wallets.map((w) => ({ key: w.key, name: w.name }))
                        );
                        console.log("🔍 Device detection:", { isMobile, forceShowAll });
                      } catch {}

                      // Base Flow wallet keys we care about
                      const flowKeysPriority = [
                        "flowwallet", // official Flow Wallet (rebranded Lilico)
                        "lilico",     // Legacy Lilico name
                        "flow",       // Generic Flow wallet
                        "blocto",     // Blocto wallet
                        "dapper",     // Dapper wallet
                      ];

                      let filtered = wallets;
                      if (isMobile) {
                        // On mobile, filter to Flow ecosystem wallets
                        filtered = wallets.filter((w) => {
                          const k = w.key.toLowerCase();
                          return (
                            flowKeysPriority.some((p) => k.includes(p)) ||
                            // Also include any wallet that looks like Flow-related
                            k.includes('flow') ||
                            k.includes('wallet')
                          );
                        });

                        // If for some reason nothing matched, keep all wallets
                        if (!filtered.length) filtered = wallets;
                      } else {
                        // On desktop, ensure all Flow wallets are available
                        // but prioritize them at the top
                        filtered = wallets;
                      }

                      // Sort so priority Flow wallets surface first
                      filtered = [...filtered].sort((a, b) => {
                        const ai = flowKeysPriority.findIndex((p) =>
                          a.key.toLowerCase().includes(p)
                        );
                        const bi = flowKeysPriority.findIndex((p) =>
                          b.key.toLowerCase().includes(p)
                        );
                        return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
                      });

                      try {
                        console.log(
                          isMobile ? "📱 Mobile wallets (post-filter)" : "🖥️ Desktop wallets (ordered)",
                          filtered.map((w) => w.key)
                        );
                      } catch {}
                      return filtered;
                    },
                    overrides: {
                      views: [
                        {
                          type: SdkViewType.Login,
                          sections: [
                            {
                              type: SdkViewSectionType.Wallet,
                              // Prefer Blocto on mobile (robust deep-link), Flow Wallet on desktop
                              defaultItem:
                                typeof window !== "undefined" &&
                                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                                  window.navigator.userAgent
                                )
                                  ? "blocto"
                                  : "flowwallet",
                            },
                          ],
                        },
                      ],
                    },
                    events: {
                      onAuthSuccess: (args) =>
                        console.log("🎉 Auth success", args),
                      onAuthFailure: (args) =>
                        console.log("❌ Auth failure", args),
                      onAuthFlowOpen: () =>
                        console.log("� Auth flow opened"),
                      onAuthFlowClose: () =>
                        console.log("� Auth flow closed"),
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
                        {/* Global Profile Creation Prompt */}
                        <UserProfilePrompt autoShow={true} showToast={false} />
                        {/* Mobile Flow Wallet Connection Helper */}
                        <MobileFlowWalletConnection />
                        {/* Mobile Wallet Debugger - only shows on mobile */}
                        <MobileWalletDebugger />
                        {/* Global wallet connect entry point */}
                        <div
                          style={{
                            position: "fixed",
                            bottom: 16,
                            right: 16,
                            zIndex: 10000,
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                          }}
                        >
                          <DynamicWidget
                            buttonClassName="dynamic-connect-wallet"
                            buttonContainerClassName="dynamic-widget-container"
                            innerButtonComponent={<span>Connect Wallet</span>}
                          />
                        </div>
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
