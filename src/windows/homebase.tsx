import React from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useWindowsContext } from "contexts/WindowsContext";

const Homebase = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => closeWindow(WINDOW_IDS.HOMEBASE)}
      headerTitle="Homebase"
      initialHeight="80%"
      initialWidth="80%"
      windowsId={WINDOW_IDS.HOMEBASE}
      resizable
      showMaximizeButton
      headerIcon="/images/icons/backpack.png"
    >
      <div className="p-4 text-lg">
        <p>🏠 Welcome to Homebase.</p>
        <p>This is your command center for all things Flunks.</p>
      </div>
    </DraggableResizeableWindow>
  );
};

export default Homebase;
