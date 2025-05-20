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
  width: 180px;
  height: 180px;
  left: 340px;
  top: 60px;
`;

const FlunkButton = styled.button<{ color: string }>`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 100%;
  background: linear-gradient(145deg, ${(props) => props.color}, #fff8 60%, #0003 100%);
  border: 3px solid #888;
  box-shadow: 0 4px 12px #0004, 0 1.5px 0 #fff inset;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.5rem;
  color: #222;
  transition: transform 0.08s;
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2px 6px #0002;
  }
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
        <ButtonArea>
          {/* Left (G) */}
          <FlunkButton
            color="green"
            style={{ left: 0, top: 60 }}
            onClick={() => goToRoom("geek")}
          >
            G
          </FlunkButton>
          {/* Top (F) */}
          <FlunkButton
            color="blue"
            style={{ left: 60, top: 0 }}
            onClick={() => goToRoom("freak")}
          >
            F
          </FlunkButton>
          {/* Bottom (P) */}
          <FlunkButton
            color="yellow"
            style={{ left: 60, top: 120 }}
            onClick={() => goToRoom("prep")}
          >
            P
          </FlunkButton>
          {/* Right (J) */}
          <FlunkButton
            color="red"
            style={{ left: 120, top: 60 }}
            onClick={() => goToRoom("jock")}
          >
            J
          </FlunkButton>
        </ButtonArea>
      </ControllerWrapper>
    </DraggableResizeableWindow>
  );
};

export default Homebase;
