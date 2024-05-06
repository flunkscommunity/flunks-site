import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import ItemsGrid from "components/YourItems/ItemsGrid";
import AppLoader from "components/AppLoader";

const YourStudents: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow, openWindow } = useWindowsContext();

  return (
    <AppLoader bgImage="/images/your-students-bg.png">
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle={`Flunkfolio - ${user?.username || "UNKNOWN"}`}
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
