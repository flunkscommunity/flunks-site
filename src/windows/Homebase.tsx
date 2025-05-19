import styled from "styled-components";
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import Image from "next/image";

const ControllerWrapper = styled.div`
  position: relative;
  width: 600px;
  height: 300px;
  background: transparent;
`;

const BackgroundImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
`;

const ButtonArea = styled.div`
  position: absolute;
  z-index: 2;
`;

const FlunkButton = styled.button<{ color: string }>`
  width: 60px;
  height: 60px;
  border-radius: 100%;
  background-color: ${(props) => props.color};
  border: none;
  cursor: pointer;
  margin: 4px;
`;

const Homebase = () => {
  const { closeWindow } = useWindowsContext();

  const goToRoom = (room: string) => {
    console.log(`Go to ${room}`);
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.HOMEBASE}
      onClose={() => closeWindow(WINDOW_IDS.HOMEBASE)}
      initialWidth="640px"
      initialHeight="360px"
      headerTitle="Homebase"
      headerIcon="/images/icons/homebase.png"
      showMaximizeButton={false}
      resizable={false}
    >
      <ControllerWrapper>
        <BackgroundImage src="/images/icons/controller-bg.png" alt="controller" />

        {/* Flunk Buttons Positioned */}
        <ButtonArea style={{ top: 80, right: 100 }}>
          <FlunkButton color="green" onClick={() => goToRoom("geek")}>G</FlunkButton>
          <FlunkButton color="blue" onClick={() => goToRoom("freak")}>F</FlunkButton>
          <FlunkButton color="yellow" onClick={() => goToRoom("prep")}>P</FlunkButton>
          <FlunkButton color="red" onClick={() => goToRoom("jock")}>J</FlunkButton>
        </ButtonArea>
      </ControllerWrapper>
    </DraggableResizeableWindow>
  );
};

export default Homebase;
