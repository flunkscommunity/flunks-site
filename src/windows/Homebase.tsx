import styled from "styled-components";
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import Image from "next/image";
import AppLoader from "components/AppLoader";

// Room Components
import GeekRoom from "windows/rooms/GeekRoom";
import FreakRoom from "windows/rooms/FreakRoom";
import PrepRoom from "windows/rooms/PrepRoom";
import JockRoom from "windows/rooms/JockRoom";

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

  const openRoom = (key: string) => {
    const roomMap: Record<string, JSX.Element> = {
      geek: <GeekRoom />,
      freak: <FreakRoom />,
      prep: <PrepRoom />,
      jock: <JockRoom />,
    };

    openWindow({
      key: key.toUpperCase(),
      window: roomMap[key],
    });
  };

  return (
    <AppLoader bgImage="/images/loading/bootup.webp">
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
            {/* Left (G) */}
            <ButtonPosition left={0} top={60}>
              <FlunkButton color="green" onClick={() => openRoom("geek")}>
                G
              </FlunkButton>
            </ButtonPosition>
            {/* Top (F) */}
            <ButtonPosition left={60} top={0}>
              <FlunkButton color="blue" onClick={() => openRoom("freak")}>
                F
              </FlunkButton>
            </ButtonPosition>
            {/* Bottom (P) */}
            <ButtonPosition left={60} top={120}>
              <FlunkButton color="yellow" onClick={() => openRoom("prep")}>
                P
              </FlunkButton>
            </ButtonPosition>
            {/* Right (J) */}
            <ButtonPosition left={120} top={60}>
              <FlunkButton color="red" onClick={() => openRoom("jock")}>
                J
              </FlunkButton>
            </ButtonPosition>
          </ButtonArea>
        </ControllerWrapper>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default Homebase;
