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
                      // Helper to normalize wallet keys for fuzzy matching
                      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
                      const matchesSelected = (key: string, selected: string) => {
                        const k = norm(key);
                        const s = norm(selected);
                        if (s.includes('blocto')) return k.includes('blocto');
                        if (s.includes('dapper')) return k.includes('dapper');
                        if (s.includes('lilico')) return k.includes('lilico') || k.includes('flowwallet');
                        if (s.includes('flowwallet')) return k.includes('flowwallet') || k.includes('lilico') || (k.includes('flow') && !k.includes('blocto') && !k.includes('dapper'));
                        if (s === 'flow') return k.includes('flow') && !k.includes('blocto') && !k.includes('dapper');
                        return k.includes(s);
                      };
                      const isMobile =
                        typeof window !== "undefined" &&
                        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                          window.navigator.userAgent
                        ) && !(window as any).FORCE_DESKTOP_MODE; // Override mobile detection

                      // Check for force override (for debugging)
                      const forceShowAll = typeof window !== "undefined" && 
                        (window as any).FORCE_SHOW_ALL_WALLETS;

                      // If a wallet was chosen from the CustomMobileWalletModal, prioritize it
                      const selectedType = typeof window !== 'undefined'
                        ? (window as any).SELECTED_WALLET_TYPE as string | undefined
                        : undefined;
                      const strictSelected = typeof window !== 'undefined' && (window as any).SELECTED_WALLET_STRICT === true;

                      // Always log the available wallets first
                      console.log('🔍 Dynamic wallets available:', wallets.map(w => ({ 
                        key: w.key, 
                        name: w.name,
                        isInstalled: (w as any).isInstalled,
                        connectionMethods: (w as any).connectionMethods 
                      })));
                      console.log('🔍 Device detection override:', { 
                        isMobile, 
                        forceShowAll, 
                        forceDesktop: (window as any).FORCE_DESKTOP_MODE 
                      });

                      if (forceShowAll) {
                        console.log('🚨 FORCE_SHOW_ALL_WALLETS enabled - showing all wallets');
                        console.log('🚨 All available wallets:', wallets.map(w => ({ key: w.key, name: w.name })));
                        
                        // Force all wallets to appear as "available" by modifying their properties
                        const forcedWallets = wallets.map(wallet => ({
                          ...wallet,
                          isInstalled: true,
                          available: true,
                          canConnect: true,
                          connectionMethods: ['injected', 'wallet_connect', 'deep_link']
                        }));
                        
                        console.log('🚨 Forced wallets:', forcedWallets.map(w => ({ 
                          key: w.key, 
                          name: w.name, 
                          isInstalled: (w as any).isInstalled,
                          available: (w as any).available 
                        })));
                        
                        // If a specific wallet type was selected, ensure it sorts to the top
                        if (selectedType) {
                          const sel = selectedType.toLowerCase();
                          const out = [...forcedWallets].sort((a, b) => {
                            const aSel = matchesSelected(a.key, sel) ? 0 : 1;
                            const bSel = matchesSelected(b.key, sel) ? 0 : 1;
                            return aSel - bSel;
                          });
                          try { (window as any).LAST_DYNAMIC_WALLETS = out.map(w => ({ key: w.key, name: (w as any).name })); } catch {}
                          return out;
                        }

                        try { (window as any).LAST_DYNAMIC_WALLETS = forcedWallets.map(w => ({ key: w.key, name: (w as any).name })); } catch {}
                        return forcedWallets;
                      }

                      // On mobile, just return ALL wallets without any filtering
                      if (isMobile) {
                        console.log('📱 Mobile detected - showing ALL wallets without filtering');
                        // If a wallet was explicitly chosen
                        if (selectedType) {
                          const sel = selectedType.toLowerCase();
                          const ordered = [...wallets].sort((a, b) => {
                            const aSel = matchesSelected(a.key, sel) ? 0 : 1;
                            const bSel = matchesSelected(b.key, sel) ? 0 : 1;
                            return aSel - bSel;
                          });
                          // In strict mode, only return matching wallets so Dynamic can't fallback to Blocto
                          if (strictSelected) {
                            const filteredOnly = ordered.filter(w => matchesSelected(w.key, sel));
                            const out = filteredOnly.length ? filteredOnly : ordered;
                            try { (window as any).LAST_DYNAMIC_WALLETS = out.map(w => ({ key: w.key, name: (w as any).name })); } catch {}
                            return out;
                          }
                          try { (window as any).LAST_DYNAMIC_WALLETS = ordered.map(w => ({ key: w.key, name: (w as any).name })); } catch {}
                          return ordered;
                        }
                        try { (window as any).LAST_DYNAMIC_WALLETS = wallets.map(w => ({ key: w.key, name: (w as any).name })); } catch {}
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

                      // If a wallet was selected, put it first on desktop too
                      if (selectedType) {
                        const sel = selectedType.toLowerCase();
                        filtered = [...filtered].sort((a, b) => {
                          const aSel = matchesSelected(a.key, sel) ? -1 : 0;
                          const bSel = matchesSelected(b.key, sel) ? -1 : 0;
                          if (aSel !== bSel) return bSel - aSel; // selected first
                          return 0;
                        });
                        if (strictSelected) {
                          const only = filtered.filter(w => matchesSelected(w.key, sel));
                          if (only.length) filtered = only;
                        }
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
                        try { (window as any).LAST_DYNAMIC_WALLETS = filtered.map(w => ({ key: w.key, name: (w as any).name })); } catch {}
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
                              // But don't set defaultItem if forcing all wallets to show
                              defaultItem: (() => {
                                const forceShowAll = typeof window !== "undefined" && 
                                  (window as any).FORCE_SHOW_ALL_WALLETS;
                                const selectedType = typeof window !== 'undefined'
                                  ? (window as any).SELECTED_WALLET_TYPE as string | undefined
                                  : undefined;
                                const strictSelected = typeof window !== 'undefined' && (window as any).SELECTED_WALLET_STRICT === true;
                                
                                if (forceShowAll) {
                                  console.log('🚨 FORCE_SHOW_ALL_WALLETS: Not setting defaultItem');
                                  return undefined; // Don't set a default to avoid filtering
                                }
                                // If user picked a wallet in the custom modal, honor it
                                if (selectedType) {
                                  console.log('🎯 Defaulting to selected wallet from custom modal:', selectedType);
                                  return selectedType;
                                }
                                
                                return typeof window !== "undefined" &&
                                  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                                    window.navigator.userAgent
                                  )
                                    ? "blocto"
                                    : "flowwallet";
                              })(),
                              // Force show all wallet options when force flag is set
                              ...((() => {
                                const forceShowAll = typeof window !== "undefined" && 
                                  (window as any).FORCE_SHOW_ALL_WALLETS;
                                const selectedType = typeof window !== 'undefined'
                                  ? (window as any).SELECTED_WALLET_TYPE as string | undefined
                                  : undefined;
                                const strictSelected = typeof window !== 'undefined' && (window as any).SELECTED_WALLET_STRICT === true;
                                
                                if (forceShowAll) {
                                  console.log('🚨 FORCE_SHOW_ALL_WALLETS: Overriding wallet section config');
                                  return {
                                    walletItems: ['all'], // Show all available wallets
                                    onlyShowInstalled: false
                                  };
                                }
                                // When a wallet was selected
                                if (selectedType) {
                                  // In strict mode, only show that specific wallet to avoid Blocto fallback
                                  if (strictSelected) {
                                    console.log('🔒 Strict selection enabled for:', selectedType);
                                    return {
                                      walletItems: [selectedType],
                                      onlyShowInstalled: false
                                    };
                                  }
                                  return {
                                    walletItems: ['all'],
                                    onlyShowInstalled: false
                                  };
                                }
                                return {};
                              })()),
                            },
                          ],
                        },
                      ],
                    },
                    events: {
                      onAuthSuccess: (args) => {
                        console.log("🎉 Auth success", args);
                        if (typeof window !== 'undefined') {
                          delete (window as any).SELECTED_WALLET_TYPE;
                          delete (window as any).FORCE_SHOW_ALL_WALLETS;
                        }
                      },
                      onAuthFailure: (args) => {
                        console.log("❌ Auth failure", args);
                        if (typeof window !== 'undefined') {
                          delete (window as any).SELECTED_WALLET_TYPE;
                        }
                      },
                      onAuthFlowOpen: () => {
                        console.log("� Auth flow opened");
                        try {
                          const wallets = (window as any)?.dynamic?.wallets || undefined;
                          if (wallets) console.log('🔎 Wallets on open:', wallets.map((w: any) => w.key));
                        } catch {}
                      },
                      onAuthFlowClose: () => {
                        console.log("� Auth flow closed");
                        if (typeof window !== 'undefined') {
                          delete (window as any).SELECTED_WALLET_TYPE;
                        }
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
