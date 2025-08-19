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
import { GumProvider } from "contexts/GumContext";
import { GumDisplay } from "components/GumDisplay";
import UserProfilePrompt from "components/UserProfile/UserProfilePrompt";

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
                    environmentId:
                      process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ||
                      "53675303-5e80-4fe5-88a4-e6caae677432",
                    walletConnectors: [FlowWalletConnectors],
                    // Custom wallet filtering + ordering for better mobile UX
                    walletsFilter: (wallets) => {
                      const isMobile =
                        typeof window !== "undefined" &&
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                          window.navigator.userAgent
                        );

                      // Log once per render pass
                      try {
                        console.log(
                          "🔍 Dynamic wallets (pre-filter)",
                          wallets.map((w) => ({ key: w.key, name: w.name }))
                        );
                      } catch {}

                      // Base Flow wallet keys we care about
                      const flowKeysPriority = [
                        "flowwallet", // official Flow Wallet (rebranded Lilico)
                        "lilico",
                        "blocto",
                        "dapper",
                      ];

                      let filtered = wallets;
                      if (isMobile) {
                        filtered = wallets.filter((w) => {
                          const k = w.key.toLowerCase();
                          return (
                            flowKeysPriority.some((p) => k.includes(p))
                          );
                        });

                        // If for some reason nothing matched, keep originals
                        if (!filtered.length) filtered = wallets;
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
                    eventsCallbacks: {
                      onAuthSuccess: (args) =>
                        console.log("🎉 Auth success", args),
                      onAuthFailure: (args) =>
                        console.log("❌ Auth failure", args),
                      onWalletAdded: (args) =>
                        console.log("🔗 Wallet added", args),
                      onWalletRemoved: (args) =>
                        console.log("🔌 Wallet removed", args),
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
