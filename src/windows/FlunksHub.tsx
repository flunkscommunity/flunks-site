import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import AppLoader from "components/AppLoader";

const FlunksHub: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <AppLoader bgImage="/images/loading/bootup.webp">
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="FlunksHub"
        windowsId={WINDOW_IDS.FLUNKS_HUB}
        onClose={() => closeWindow(WINDOW_IDS.FLUNKS_HUB)}
        initialWidth="420px"
        initialHeight="300px"
        headerIcon="/images/icons/flunkshub.png"
      >
        <Frame variant="inside" className="p-4 h-full w-full flex flex-col items-start gap-2">
          <h3>🧠 Welcome to FlunksHub</h3>
          <p>This will be the control center for Flunks interactions.</p>
          <p>Coming soon: quests, upgrades, and secret missions.</p>
        </Frame>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default FlunksHub;
