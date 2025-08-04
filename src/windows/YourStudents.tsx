import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import ItemsGrid from "components/YourItems/ItemsGrid";
import BootScreen from "components/BootScreen";
import { useState } from "react";
import ErrorWindow from "./ErrorWindow";
import { Button } from "react95";

const YourStudents: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow, openWindow } = useWindowsContext();
  const [bootComplete, setBootComplete] = useState(false);

  if (!user) {
    return (
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="OnlyFlunks - Sign In Required"
        windowsId={WINDOW_IDS.YOUR_STUDENTS}
        onClose={() => closeWindow(WINDOW_IDS.YOUR_STUDENTS)}
        initialHeight="400px"
        initialWidth="500px"
        headerIcon="/images/icons/onlyflunks.png"
        resizable={false}
      >
        <div className="flex flex-col items-center justify-center h-full p-8 gap-6 bg-gray-100">
          <div className="text-center">
            <img 
              src="/images/icons/onlyflunks.png" 
              alt="OnlyFlunks" 
              className="w-16 h-16 mx-auto mb-4"
            />
            <h2 className="text-xl font-bold mb-2">Welcome to OnlyFlunks</h2>
            <p className="text-gray-600 mb-6">
              Connect your Flow wallet to access your collection and interact with other Flunks.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <DynamicConnectButton>
              <Button className="w-full" size="lg">
                🔗 Connect Wallet
              </Button>
            </DynamicConnectButton>
            
            <Button 
              onClick={() => closeWindow(WINDOW_IDS.YOUR_STUDENTS)}
              variant="flat"
              className="w-full"
            >
              Cancel
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            <p>Supported wallets: Lilico, Flow Wallet, Dapper</p>
          </div>
        </div>
      </DraggableResizeableWindow>
    );
  }

  if (!bootComplete) {
    return <BootScreen onComplete={() => setBootComplete(true)} />;
  }

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle={`OnlyFlunks - ${
        user?.username || (user ? "Logged In" : "Not Logged In")
      }`}
      authGuard={true}
      windowsId={WINDOW_IDS.YOUR_STUDENTS}
      onClose={() => {
        closeWindow(WINDOW_IDS.YOUR_STUDENTS);
      }}
      initialHeight="60%"
      initialWidth="60%"
      headerIcon="/images/icons/onlyflunks.png"
    >
      <ItemsGrid />
    </DraggableResizeableWindow>
  );
};

export default YourStudents;
