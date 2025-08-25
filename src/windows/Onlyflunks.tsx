import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame, Button, Panel, Separator } from "react95";
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

  // Check if Dynamic Context is still initializing - use auth context loading state
  const showLoadingState = isLoading;

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
          ) : !isAuthenticated ? (
            // Windows 95 style authentication screen
            <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6"
                 style={{ 
                   background: 'linear-gradient(135deg, #008080 0%, #20b2aa 25%, #48d1cc 50%, #20b2aa 75%, #008080 100%)',
                   backgroundSize: '200% 200%',
                   animation: 'gradient 8s ease infinite'
                 }}>
              
              {/* Main login panel */}
              <Panel variant="outside" className="p-8 bg-gray-200 shadow-2xl max-w-md w-full">
                <div className="flex flex-col items-center gap-6">
                  
                  {/* Logo/Icon */}
                  <div className="flex items-center gap-3">
                    <img src="/images/icons/onlyflunks.png" alt="OnlyFlunks" className="w-8 h-8" />
                    <div className="text-xl font-bold text-gray-800">OnlyFlunks™</div>
                  </div>
                  
                  <Separator />
                  
                  {/* Welcome message */}
                  <div className="text-center">
                    <div className="text-lg font-semibold mb-2">🔐 Premium Access Required</div>
                    <div className="text-sm text-gray-600 mb-4">
                      Connect your wallet to access exclusive Flunks content and premium features.
                    </div>
                  </div>
                  
                  {/* Connection button area */}
                  <Panel variant="well" className="p-4 w-full bg-white">
                    <div className="flex flex-col items-center gap-3">
                      <DynamicWidget />
                      <div className="text-xs text-gray-500 text-center">
                        ✨ Supported: Flow Wallet, Lilico, Dapper, Blocto
                      </div>
                    </div>
                  </Panel>
                  
                  {/* Feature highlights */}
                  <Panel variant="well" className="p-3 w-full bg-gray-50">
                    <div className="text-xs text-gray-600">
                      <div className="font-semibold mb-2">🎯 Premium Features:</div>
                      <div>• Exclusive Flunk NFT gallery</div>
                      <div>• Advanced collection tools</div>
                      <div>• Community marketplace access</div>
                      <div>• Member-only content</div>
                    </div>
                  </Panel>
                  
                </div>
              </Panel>
              
              {/* Bottom info bar */}
              <Panel variant="outside" className="p-2 px-4 bg-gray-200">
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>System Status: Ready</span>
                  <div className="w-px h-4 bg-gray-400 mx-2"></div>
                  <span>🌐 Secure Connection</span>
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
