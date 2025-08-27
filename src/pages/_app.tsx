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
import AutoWalletAccessGrant from "components/AutoWalletAccessGrant";
import ErrorBoundary from "components/ErrorBoundary";
// Removed mobile wallet components to show standard Dynamic installation
// import SmartWalletDetection from "components/SmartWalletDetection";
// import CleanMobileWalletSelector from "components/CleanMobileWalletSelector";

const ThemeWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useThemeSettings();
  return <ThemeProvider theme={theme.theme}>{children}</ThemeProvider>;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const memodGlobalStyles = React.useMemo(() => <GlobalStyles />, []);
  const [isClient, setIsClient] = React.useState(false);

  // Ensure client-side rendering for Dynamic Labs
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Start wallet branding fix and enhance detection on component mount
  React.useEffect(() => {
    if (!isClient) return;
    
    try {
      startWalletBrandingFix();
      
      // Enhance Flow Wallet detection for Dynamic Labs
      const enhanceDetection = async () => {
        try {
          // Wait a bit for extensions to load
          await new Promise(resolve => setTimeout(resolve, 1000));
          enhanceFlowWalletDetection();
        } catch (error) {
          console.warn('Flow wallet detection enhancement failed:', error);
        }
      };
      
      enhanceDetection();
    } catch (error) {
      console.error('Wallet initialization failed:', error);
    }
  }, [isClient]);

  // Show loading screen during SSR/hydration
  if (!isClient) {
    return (
      <>
        {memodGlobalStyles}
        <ThemeWrapper>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f0f0f0',
            fontFamily: 'Arial, sans-serif'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e0e0e0',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <p>Loading Flunks...</p>
              <style jsx>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </div>
        </ThemeWrapper>
      </>
    );
  }

  return (
    <>
      {memodGlobalStyles}
      <ThemeWrapper>
        <AudioProvider>
          <RadioProvider>
            <WindowsProvider>
              <ClaimBackpackProvider>
                <ErrorBoundary fallback={
                  <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    fontFamily: 'Arial, sans-serif'
                  }}>
                    <h2>🔌 Wallet Connection Error</h2>
                    <p>There was an issue initializing the wallet system.</p>
                    <button 
                      onClick={() => window.location.reload()}
                      style={{
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      Reload Page
                    </button>
                  </div>
                }>
                  <DynamicContextProvider
                    settings={{
                      environmentId:
                        process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID ||
                        "53675303-5e80-4fe5-88a4-e6caae677432",
                      walletConnectors: [FlowWalletConnectors],
                    // Force Flow Wallet/Lilico to appear on mobile
                    walletsFilter: (wallets) => {
                      try {
                        // Check if we're on mobile
                        const isMobile = typeof window !== 'undefined' && 
                          (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
                        
                        console.log('🔍 Dynamic v3 detected wallets:', wallets.map(w => ({ 
                          key: w?.key || 'unknown', 
                          name: w?.name || 'unknown',
                          mobile: (w as any)?.mobile,
                          installed: (w as any)?.isInstalled
                        })));
                        
                        // On mobile, be more aggressive about adding Flow wallets
                        if (isMobile) {
                          const hasFlowWallet = wallets.some(w => 
                            w?.key?.toLowerCase().includes('flow') || 
                            w?.key?.toLowerCase().includes('lilico')
                          );
                          
                          if (!hasFlowWallet) {
                            console.log('📱 Adding Flow Wallet and Lilico manually for mobile...');
                            
                            // Only add if we can safely push to the array
                            if (Array.isArray(wallets)) {
                              const flowWallet = {
                                key: 'flowwallet',
                                name: 'Flow Wallet',
                                mobile: true,
                                isInstalled: false,
                                icon: 'https://wallet.flow.com/favicon.ico'
                              };
                              
                              const lilicoWallet = {
                                key: 'lilico',
                                name: 'Lilico',
                                mobile: true,
                                isInstalled: false,
                                icon: 'https://lilico.app/favicon.ico'
                              };
                              
                              wallets.push(flowWallet as any, lilicoWallet as any);
                            }
                          }
                        }
                        
                        console.log('🎯 Final wallet list:', wallets.map(w => w?.key || 'unknown'));
                        return wallets || []; // Ensure we always return an array
                      } catch (error) {
                        console.error('Error in walletsFilter:', error);
                        return wallets || []; // Return original wallets or empty array if error occurs
                      }
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
                        try {
                          console.log("🎉 Dynamic Auth success", args);
                        } catch (error) {
                          console.error("Error handling auth success:", error);
                        }
                      },
                      onAuthFailure: (args) => {
                        try {
                          console.log("❌ Dynamic Auth failure", args);
                        } catch (error) {
                          console.error("Error handling auth failure:", error);
                        }
                      },
                      onAuthFlowOpen: () => {
                        try {
                          console.log("🔓 Dynamic Auth flow opened");
                        } catch (error) {
                          console.error("Error handling auth flow open:", error);
                        }
                      },
                      onAuthFlowClose: () => {
                        try {
                          console.log("🔒 Dynamic Auth flow closed");
                        } catch (error) {
                          console.error("Error handling auth flow close:", error);
                        }
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
                          {/* Auto-grant access level for wallet connections */}
                          <AutoWalletAccessGrant />
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
                </ErrorBoundary>
              </ClaimBackpackProvider>
            </WindowsProvider>
          </RadioProvider>
        </AudioProvider>
      </ThemeWrapper>
    </>
  );
};

export default MyApp;
