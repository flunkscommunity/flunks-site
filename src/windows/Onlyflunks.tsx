import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame, Button } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { AndroidOptimizations } from "components/AndroidOptimizations";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useAuth } from "contexts/AuthContext";
import { useState, useEffect } from "react";
import ItemsGrid from "components/YourItems/ItemsGrid";
import BootScreen from "components/BootScreen";

const Onlyflunks: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const auth = useAuth();
  const [bootComplete, setBootComplete] = useState(false);
  
  // Destructure auth context for easier use
  const {
    isAuthenticated,
    isWalletConnected,
    walletAddress,
    flunksCount,
    hasFlunks,
    isLoading,
    user,
    primaryWallet,
    getAuthStatus
  } = auth;

  // IMMEDIATE DEBUG - This should show up as soon as OnlyFlunks opens
  console.log('🚨 ONLYFLUNKS OPENED - IMMEDIATE DEBUG:', {
    timestamp: new Date().toISOString(),
    user: user,
    primaryWallet: primaryWallet,
    walletAddress: walletAddress,
    isAuthenticated: isAuthenticated,
    authStatus: getAuthStatus()
  });

  // Log every render
  console.log('🎯 OnlyFlunks RENDER:', new Date().toLocaleTimeString());

  // Enhanced debug logging with the new authentication logic
  console.log('🧠 OnlyFlunks Authentication State:', {
    isAuthenticated,
    isWalletConnected,
    walletAddress,
    flunksCount,
    hasFlunks,
    isLoading,
    authStatus: getAuthStatus()
  });

  // Extra detailed wallet debugging
  if (primaryWallet) {
    console.log('🔍 Wallet Details:', primaryWallet);
  }
  
  // Check Dynamic context state
  console.log('🔧 Dynamic Context Full State:', {
    user,
    primaryWallet
  });

  // Check if Dynamic Context is still initializing - use auth context loading state
  const showLoadingState = isLoading;

  // Add a useEffect to continuously monitor the wallet state
  useEffect(() => {
    // Always log debug info every 3 seconds when OnlyFlunks is open
    const interval = setInterval(() => {
      console.log('🔄 OnlyFlunks Wallet Monitor:', {
        timestamp: new Date().toISOString(),
        isAuthenticated,
        isWalletConnected,
        walletAddress,
        authStatus: getAuthStatus()
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isWalletConnected, walletAddress]);

  // Show boot screen first if not completed
  if (!bootComplete) {
    return <BootScreen onComplete={() => setBootComplete(true)} />;
  }

  return (
    <>
      <AndroidOptimizations />
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="OnlyFlunks"
        windowsId={WINDOW_IDS.FLUNKS_HUB}
        onClose={() => closeWindow(WINDOW_IDS.FLUNKS_HUB)}
        initialWidth="900px"
        initialHeight="700px"
        headerIcon="/images/icons/onlyflunks.png"
      >
        <Frame variant="inside" className="p-4 h-full w-full flex flex-col items-start gap-4">
          {showLoadingState ? (
            // Show loading while Auth Context initializes
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="text-2xl">⏳</div>
              <p>Loading wallet context...</p>
            </div>
          ) : !isAuthenticated ? (
            // Show wallet connection UI when user is not authenticated
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <h3>🔒 Connect Wallet to Access OnlyFlunks</h3>
              <p className="text-center">
                OnlyFlunks requires wallet authentication to access premium content and features.
              </p>
              <div className="flex flex-col items-center gap-4">
                <DynamicWidget />
                <p className="text-xs opacity-70 text-center">
                  Supported: Flow Wallet, Lilico, Dapper, Blocto
                </p>
              </div>
              <div className="text-xs text-center p-4 bg-gray-100 rounded">
                <strong>Debug Info:</strong><br />
                Authenticated: {isAuthenticated ? '✅' : '❌'}<br />
                Wallet Connected: {isWalletConnected ? '✅' : '❌'}<br />
                Address: {walletAddress || 'None'}<br />
                Auth Status: {getAuthStatus()}
              </div>
            </div>
          ) : (
            // Show OnlyFlunks content when authenticated - Use the retro ItemsGrid component
            <ItemsGrid />
          )}
        </Frame>
      </DraggableResizeableWindow>
    </>
  );
};

export default Onlyflunks;
