import React from "react";
import styled from "styled-components";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { Frame } from "react95";

const ControllerWrapper = styled.div`
  position: relative;
  width: 600px;
  height: 320px;
  background: transparent;
  background-image: url("/images/controller-bg.png");
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  margin: 0 auto;
`;

const ButtonArea = styled.div`
  position: absolute;
  display: flex;
  gap: 16px;
`;

interface FlunkButtonProps {
  color?: string;
}

const FlunkButton = styled.button<FlunkButtonProps>`
  width: 60px;
  height: 60px;
  border-radius: 100%;
  border: none;
  font-weight: bold;
  background-color: ${({ color }) => color || "gray"};
  color: black;
  cursor: pointer;
  box-shadow: 0 2px #000;
  &:hover {
    transform: scale(1.05);
  }
\`;

const FlunkButtons = styled(ButtonArea)`
  right: 90px;
  top: 60px;
  flex-direction: column;
`;

const MenuButtons = styled(ButtonArea)`
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
`;

const Homebase = () => {
  const { closeWindow } = useWindowsContext();

  const goToRoom = (room: string) => {
    console.log(\`Go to \${room}\`);
    // Replace with navigation logic or window open
  };

  return (
    <Frame
      variant="field"
      style={{
        width: 640,
        height: 360,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "auto",
        background: "transparent",
      }}
    >
      <ControllerWrapper>
        <FlunkButtons>
          <FlunkButton color="#0f0" onClick={() => goToRoom("geek")}>Geek</FlunkButton>
          <FlunkButton color="#00f" onClick={() => goToRoom("freak")}>Freak</FlunkButton>
          <FlunkButton color="#ff0" onClick={() => goToRoom("prep")}>Prep</FlunkButton>
          <FlunkButton color="#f00" onClick={() => goToRoom("jock")}>Jock</FlunkButton>
        </FlunkButtons>

        <MenuButtons>
          <FlunkButton onClick={() => console.log("Start pressed")}>Start</FlunkButton>
          <FlunkButton onClick={() => console.log("Select pressed")}>Select</FlunkButton>
        </MenuButtons>
      </ControllerWrapper>
    </Frame>
  );
};

export default Homebase;