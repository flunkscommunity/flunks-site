import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import BootScreen from "components/BootScreen";
import { useState } from "react";

const Onlyflunks: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const [bootComplete, setBootComplete] = useState(false);

  if (!bootComplete) {
    return <BootScreen onComplete={() => setBootComplete(true)} />;
  }

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="onlyflunks"
      windowsId={WINDOW_IDS.FLUNKS_HUB}
      onClose={() => closeWindow(WINDOW_IDS.FLUNKS_HUB)}
      initialWidth="420px"
      initialHeight="300px"
      headerIcon="/images/icons/onlyflunks.png"
    >
      <Frame variant="inside" className="p-4 h-full w-full flex flex-col items-start gap-2">
        <h3>🧠 Welcome to onlyflunks</h3>
        <p>This will be the control center for Flunks interactions.</p>
        <p>Coming soon: quests, upgrades, and secret missions.</p>
      </Frame>
    </DraggableResizeableWindow>
  );
};

export default Onlyflunks;
