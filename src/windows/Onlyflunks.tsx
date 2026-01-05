import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame, Button, Panel, Separator } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { AndroidOptimizations } from "components/AndroidOptimizations";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import UnifiedConnectButton from "../components/UnifiedConnectButton";
import WalletConnectionModal from "../components/WalletConnectionModal";
import { useAuth } from "contexts/AuthContext";
import { useState, useEffect } from "react";
import ItemsGrid from "components/YourItems/ItemsGrid";

const Onlyflunks: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const auth = useAuth();
  const [showWalletModal, setShowWalletModal] = useState(false);
  
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

  // Check if Dynamic Context is still initializing - use auth context loading state
  const showLoadingState = isLoading;

  // Show wallet modal when not authenticated and not loading
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowWalletModal(true);
    } else {
      setShowWalletModal(false);
    }
  }, [isLoading, isAuthenticated]);

  // If not authenticated and not loading, only show the modal (no window)
  if (!isLoading && !isAuthenticated) {
    return (
      <>
        <AndroidOptimizations />
        {showWalletModal && (
          <WalletConnectionModal 
            onClose={() => {
              setShowWalletModal(false);
              closeWindow(WINDOW_IDS.FLUNKS_HUB);
            }} 
          />
        )}
      </>
    );
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
            // Windows 95 style loading screen
            <div className="w-full h-full flex flex-col items-center justify-center gap-6" 
                 style={{ 
                   background: 'linear-gradient(135deg, #008080 0%, #20b2aa 50%, #008080 100%)',
                   color: 'white'
                 }}>
              <Panel variant="outside" className="p-6 bg-gray-200">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-4xl animate-pulse">💾</div>
                  <div className="text-lg font-bold">OnlyFlunks™ System</div>
                  <div className="text-sm">Initializing wallet interface...</div>
                  <div className="w-48 h-4 bg-gray-300 border-2 border-gray-600" style={{ borderStyle: 'inset' }}>
                    <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <div className="text-xs opacity-70">Please wait...</div>
                </div>
              </Panel>
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
