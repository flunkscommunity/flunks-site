// windows/Homebase.tsx
import { Frame } from "react95";
import { WINDOW_IDS } from "fixed";
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";

const Homebase = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => closeWindow(WINDOW_IDS.HOMEBASE)}
      headerTitle="Homebase"
      windowsId={WINDOW_IDS.HOMEBASE}
      headerIcon="/images/icons/Homebase.png"
    >
      <Frame variant="well" className="p-4">
        <p>Welcome to the Homebase!</p>
      </Frame>
    </DraggableResizeableWindow>
  );
};

export default Homebase;
