import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Frame, ScrollView } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import UserInformation from "components/Settings/UserInformation";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import ErrorWindow from "./ErrorWindow";

const Settings: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { user, setShowDynamicUserProfile } = useDynamicContext();
  if (!user)
    return (
      <ErrorWindow
        title="Error Starting Program"
        message="You're not signed in. Please sign in to continue.."
        actions={
          <>
            <Button onClick={() => closeWindow(WINDOW_IDS.SETTINGS)}>
              Close
            </Button>
            <DynamicConnectButton>
              <Button as={"a"} primary className="ml-auto">
                Sign In
              </Button>
            </DynamicConnectButton>
          </>
        }
        windowId={WINDOW_IDS.SETTINGS}
      />
    );

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="User Settings"
      onClose={() => {
        closeWindow(WINDOW_IDS.SETTINGS);
      }}
      showMaximizeButton={false}
      initialHeight="auto"
      initialWidth="auto"
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-row justify-end items-center pb-3">
          <Button onClick={() => setShowDynamicUserProfile(true)}>
            Update Settings
          </Button>
        </div>
        <Frame
          variant="field"
          className="w-full h-[calc(100%-48px)] !flex !flex-col"
        >
          <ScrollView className="w-full h-full flex flex-col">
            <UserInformation />
          </ScrollView>
        </Frame>
      </div>
    </DraggableResizeableWindow>
  );
};

export default Settings;
