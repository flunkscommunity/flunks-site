import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";
import "config/fcl";

import "../styles/globals.css";
import "../styles/dynamic-fixes.css";
import "../styles/mobile-chat.css";
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
// Removed all mobile wallet override components for clean Dynamic Labs behavior

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
                      // Basic walletsFilter - let Dynamic handle mobile detection
                      walletsFilter: (wallets) => {
                        console.log('🔍 Dynamic walletsFilter - Available wallets:', wallets.map(w => ({ 
                          key: w?.key || 'unknown', 
                          name: w?.name || 'unknown'
                        })));
                        
                        // Return wallets as-is, let Dynamic Labs handle mobile/desktop logic
                        return Array.isArray(wallets) ? wallets : [];
                      }
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
                          <AutoWalletAccessGrant />
                          <UserProfilePrompt autoShow={false} showToast={false} />
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
