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
      <ErrorWindow
        title="Error Starting Program"
        message="You're not signed in. Please sign in to continue.."
        actions={
          <>
            <Button onClick={() => closeWindow(WINDOW_IDS.YOUR_STUDENTS)}>
              Close
            </Button>
            <DynamicConnectButton>
              <Button className="ml-auto">Sign In</Button>
            </DynamicConnectButton>
          </>
        }
        windowId={WINDOW_IDS.YOUR_STUDENTS}
      />
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
