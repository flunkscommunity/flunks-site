import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame, Button } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { AndroidOptimizations } from "components/AndroidOptimizations";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { usePaginatedItems } from "contexts/UserPaginatedItems";
import { useState, useEffect } from "react";
import ItemsGrid from "components/YourItems/ItemsGrid";
import BootScreen from "components/BootScreen";

const Onlyflunks: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { user, primaryWallet } = useDynamicContext();
  const [bootComplete, setBootComplete] = useState(false);
  
  // Add error handling for the paginated items hook
  let paginatedItemsData;
  let paginatedItemsError = null;
  
  try {
    paginatedItemsData = usePaginatedItems();
  } catch (error) {
    console.error('🚨 OnlyFlunks: Error with usePaginatedItems hook:', error);
    paginatedItemsError = error;
    // Fallback values
    paginatedItemsData = {
      allItems: [],
      flunksCount: 0,
      backpacksCount: 0,
      error: null,
      isLoading: false
    };
  }
  
  const { allItems, flunksCount, backpacksCount, error: contextError, isLoading } = paginatedItemsData;
  
  // Combine both possible error sources
  const finalError = paginatedItemsError || contextError;

  // Use the same authentication check as other components - just check for wallet address
  const isAuthenticated = !!primaryWallet?.address;

  // IMMEDIATE DEBUG - This should show up as soon as OnlyFlunks opens
  console.log('🚨 ONLYFLUNKS OPENED - IMMEDIATE DEBUG:', {
    timestamp: new Date().toISOString(),
    user: user,
    primaryWallet: primaryWallet,
    walletAddress: primaryWallet?.address,
    isAuthenticated: isAuthenticated
  });

  // Log every render
  console.log('🎯 OnlyFlunks RENDER:', new Date().toLocaleTimeString());

  // Enhanced debug logging
  console.log('🧠 OnlyFlunks Authentication State:', {
    user: !!user,
    userType: typeof user,
    userKeys: user ? Object.keys(user) : null,
    primaryWallet: !!primaryWallet,
    primaryWalletType: typeof primaryWallet,
    primaryWalletKeys: primaryWallet ? Object.keys(primaryWallet) : null,
    walletAddress: primaryWallet?.address,
    walletConnector: primaryWallet?.connector,
    isAuthenticated,
    allItemsLength: allItems.length,
    paginatedItemsError: paginatedItemsError?.message || 'none',
    contextError: contextError?.message || 'none',
    finalError: finalError?.message || 'none',
    isLoading
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

  // Check if Dynamic Context is still initializing
  const isDynamicLoading = user === undefined && primaryWallet === undefined;

  // Add a useEffect to continuously monitor the wallet state
  useEffect(() => {
    // Always log debug info every 3 seconds when OnlyFlunks is open
    const interval = setInterval(() => {
      console.log('🔄 OnlyFlunks Wallet Monitor:', {
        timestamp: new Date().toISOString(),
        user: !!user,
        primaryWallet: !!primaryWallet,
        walletAddress: primaryWallet?.address,
        isAuthenticated,
        isDynamicLoading
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [user, primaryWallet, isAuthenticated, isDynamicLoading]);

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
          {finalError ? (
            // Show error state if the paginated items hook failed
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="text-2xl">⚠️</div>
              <h3>Error Loading OnlyFlunks</h3>
              <p className="text-center text-red-600">
                {finalError.message || 'Unknown error occurred'}
              </p>
              <div className="text-xs text-center p-4 bg-red-50 border border-red-200 rounded max-w-md">
                <strong>Debug Info:</strong><br />
                This error occurred while loading your NFT collection data.<br />
                Please check your wallet connection and try refreshing the page.
              </div>
            </div>
          ) : isDynamicLoading ? (
            // Show loading while Dynamic Context initializes
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
                User: {user ? '✅' : '❌'}<br />
                Wallet: {primaryWallet ? '✅' : '❌'}<br />
                Address: {primaryWallet?.address || 'None'}
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
