import styled from "styled-components";
import { useWindowsContext } from "../contexts/WindowsContext";
// Update the import path below if the file is located elsewhere, e.g.:
import DraggableResizeableWindow from "../components/DraggableResizeableWindow";
// Update the import path below to the correct location of WINDOW_IDS:
import { WINDOW_IDS } from "../fixed";
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

const ButtonPosition = styled.div<{ left: number; top: number }>`
  position: absolute;
  left: ${(props) => props.left}px;
  top: ${(props) => props.top}px;
`;

const Homebase = () => {
  const { closeWindow, openWindow } = useWindowsContext();

  const goToRoom = (room: string) => {
    switch (room) {
      case "geek":
        openWindow(WINDOW_IDS.GEEK); // Make sure GEEK exists in WINDOW_IDS
        break;
      case "freak":
        openWindow(WINDOW_IDS.FREAK);
        break;
      case "prep":
        openWindow(WINDOW_IDS.PREP); // Make sure PREP exists in WINDOW_IDS
        break;
      case "jock":
        openWindow(WINDOW_IDS.JOCK); // Make sure JOCK exists in WINDOW_IDS
        break;
      default:
        break;
    }
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
        <ButtonArea>
          <ButtonPosition left={0} top={60}>
            <FlunkButton color="green" onClick={() => goToRoom("geek")}>
              G
            </FlunkButton>
          </ButtonPosition>
          <ButtonPosition left={60} top={0}>
            <FlunkButton color="blue" onClick={() => goToRoom("freak")}>
              F
            </FlunkButton>
          </ButtonPosition>
          <ButtonPosition left={60} top={120}>
            <FlunkButton color="yellow" onClick={() => goToRoom("prep")}>
              P
            </FlunkButton>
          </ButtonPosition>
          <ButtonPosition left={120} top={60}>
            <FlunkButton color="red" onClick={() => goToRoom("jock")}>
              J
            </FlunkButton>
          </ButtonPosition>
        </ButtonArea>
      </ControllerWrapper>
    </DraggableResizeableWindow>
  );
};

export default Homebase;