import React from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useWindowsContext } from "contexts/WindowsContext";
import styled from "styled-components";
import { Frame } from "react95";

const ControllerFrame = styled(Frame)`
  background: url('/images/icons/controller-bg.png') no-repeat center center;
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

export default Homebase;
