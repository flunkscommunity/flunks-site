import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import ItemsGrid from "components/YourItems/ItemsGrid";
import AppLoader from "components/AppLoader";
import ErrorWindow from "./ErrorWindow";
import { Button } from "react95";

const YourStudents: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow, openWindow } = useWindowsContext();

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

  return (
    <AppLoader bgImage="/images/flunkfolio.webp">
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle={`Flunkfolio - ${user?.username || "Not Logged In"}`}
        authGuard={true}
        windowsId={WINDOW_IDS.YOUR_STUDENTS}
        onClose={() => {
          closeWindow(WINDOW_IDS.YOUR_STUDENTS);
        }}
        initialHeight="60%"
        initialWidth="60%"
      >
        <ItemsGrid />
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default YourStudents;
