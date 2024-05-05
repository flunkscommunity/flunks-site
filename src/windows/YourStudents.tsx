import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import SlowProgressBar from "components/SlowProgressBar";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import ItemsGrid from "components/YourItems/ItemsGrid";

const YourStudents: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow, openWindow } = useWindowsContext();

  return (
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
      <SlowProgressBar bgImage="/images/your-students-bg.png">
        <ItemsGrid />
      </SlowProgressBar>
    </DraggableResizeableWindow>
  );
};

export default YourStudents;
