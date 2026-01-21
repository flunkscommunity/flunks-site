import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";
import "config/fcl";

import "../styles/globals.css";
import "../styles/dynamic-fixes.css";
import "../styles/mobile-chat.css";
import "../styles/picture-day.css";
import WindowsProvider from "contexts/WindowsContext";
import ClaimBackpackProvider from "contexts/BackpackClaimContext";
import {
  DynamicContextProvider,
  DynamicUserProfile,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { SdkViewSectionType, SdkViewType } from "@dynamic-labs/sdk-api";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
// Ensure Dynamic Flow connectors always use Flow MAINNET
const MainnetFlowWalletConnectors = (props: any) => {
  const connectors = FlowWalletConnectors(props);
  return connectors.map((ConnectorClass: any) => {
    return class MainnetConnector extends ConnectorClass {
      constructor(...args: any[]) {
        super(...args);
        this.network = 'mainnet';
      }

      async setupConfig(...setupArgs: any[]) {
        this.network = 'mainnet';
        return super.setupConfig(...setupArgs);
      }
    };
  });
};
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
import { MusicProvider } from "contexts/MusicContext";
import { UnifiedWalletProvider } from "contexts/UnifiedWalletContext";
import { DemoModeProvider } from "contexts/DemoModeContext";
import { GumDisplay } from "components/GumDisplay";
import WidgetClaimDeepLinkHandler from "components/WidgetClaimDeepLinkHandler";
import Chapter5NFTNotification from "components/Chapter5NFTNotification";
import UserProfilePrompt from "components/UserProfile/UserProfilePrompt";
import AutoWalletAccessGrant from "components/AutoWalletAccessGrant";
import ErrorBoundary from "components/ErrorBoundary";
import { AmbientSoundPlayer } from "components/AmbientSoundPlayer";
import { initializeEasterEggs } from "utils/easterEggs";

const ThemeWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useThemeSettings();
  return <ThemeProvider theme={theme.theme}>{children}</ThemeProvider>;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const memodGlobalStyles = React.useMemo(() => <GlobalStyles />, []);
  // Must start as false for SSR/static export, then set to true on client
  const [isClient, setIsClient] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  // Set isClient to true only after mounting on the client
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

      // Initialize easter eggs and console ASCII art after everything loads
      setTimeout(() => {
        initializeEasterEggs();
      }, 2000);
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
            backgroundColor: '#0f0f1a',
            fontFamily: 'Arial, sans-serif',
            color: 'white'
          }}>
            <div style={{ textAlign: 'center' }}>
              {initError ? (
                <>
                  <p style={{ color: '#ff6666' }}>Error: {initError}</p>
                  <button onClick={() => window.location.reload()}>Reload</button>
                </>
              ) : (
                <>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #333',
                    borderTop: '4px solid #00ff00',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px'
                  }}></div>
                  <p>Loading Flunks...</p>
                  <p style={{ fontSize: '10px', opacity: 0.5, marginTop: '10px' }}>Initializing app...</p>
                </>
              )}
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
            <MusicProvider>
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
                      walletConnectors: [MainnetFlowWalletConnectors],
                      
                      // Filter wallets: Keep Dapper, Flow Wallet (Lilico), exclude Blocto
                      walletsFilter: (wallets) => {
                        console.log('🔍 Dynamic walletsFilter - Available wallets:', wallets.map(w => ({
                          key: w?.key || 'unknown', 
                          name: w?.name || 'unknown',
                          walletConnector: w?.walletConnector || 'unknown'
                        })));
                        
                        if (!Array.isArray(wallets)) return [];
                        
                        // Filter out Blocto, keep Dapper and Flow Wallet (Lilico)
                        const filtered = wallets.filter(w => {
                          const key = w?.key?.toLowerCase() || '';
                          const name = w?.name?.toLowerCase() || '';
                          
                          // Exclude Blocto
                          if (key.includes('blocto') || name.includes('blocto')) {
                            console.log('❌ Excluding Blocto wallet');
                            return false;
                          }
                          
                          // Keep Dapper, Flow Wallet, Lilico
                          return true;
                        });
                        
                        console.log('✅ Filtered wallets:', filtered.map(w => w?.name || 'unknown'));
                        return filtered;
                      }
                    }}
                  >
                  <UnifiedWalletProvider>
                    <DemoModeProvider>
                    <UserProfileProvider>
                      <PaginatedItemsProvider>
                        <AuthProvider>
                            <GumProvider autoRefreshInterval={300000}> {/* 5 minutes - very conservative */}
                                <div className="app-container min-h-screen w-full overflow-hidden">
                                <Component {...pageProps} />
                              </div>
                              <WidgetClaimDeepLinkHandler />
                              <Analytics />
                              <AutoWalletAccessGrant />
                              <UserProfilePrompt autoShow={false} showToast={false} />
                              <Chapter5NFTNotification />
                              <DynamicUserProfile />
                              {/* Mount Dynamic widget so setShowAuthFlow() can render the auth modal.
                                  Hide the default connect trigger button (we open auth from our own UI). */}
                              <DynamicWidget
                                buttonContainerClassName="dynamic-trigger-container-hidden"
                                buttonClassName="dynamic-trigger-button-hidden"
                              />
                              <AmbientSoundPlayer />
                            </GumProvider>
                        </AuthProvider>
                      </PaginatedItemsProvider>
                    </UserProfileProvider>
                    </DemoModeProvider>
                  </UnifiedWalletProvider>
                </DynamicContextProvider>
                </ErrorBoundary>
              </ClaimBackpackProvider>
            </WindowsProvider>
          </MusicProvider>
        </RadioProvider>
        </AudioProvider>
      </ThemeWrapper>
    </>
  );
};

export default MyApp;
