import React from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useWindowsContext } from "contexts/WindowsContext";
import styled from "styled-components";
import { Frame } from "react95";

const ControllerFrame = styled(Frame)`
  background: url('/images/ui/controller-bg.png') no-repeat center center;
  background-size: contain;
  width: 500px;
  height: 300px;
  border: none;
  box-shadow: none;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const Homebase = () => {
  const goToRoom = (room: string) => {
    console.log(`Go to ${room}`);
    // Add navigation logic or open another window
  };

  return (
    <ControllerFrame variant="field">
      <div className="flex gap-4">
        <button onClick={() => goToRoom("geek")}>🟢 Geek</button>
        <button onClick={() => goToRoom("freak")}>🔵 Freak</button>
        <button onClick={() => goToRoom("prep")}>🟡 Prep</button>
        <button onClick={() => goToRoom("jock")}>🔴 Jock</button>
      </div>

      <div className="mt-4 flex gap-2">
        <button>Start</button>
        <button>Select</button>
      </div>
    </ControllerFrame>
  );
};



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
