import styled from "styled-components";
import { useWindowsContext } from "../../contexts/WindowsContext";
import DraggableResizeableWindow from "../../components/DraggableResizeableWindow";
import { WINDOW_IDS } from "../../fixed";

const JockRoomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f0f0f0;
`;

const Title = styled.h1`
  color: #ff5733;
`;

const Description = styled.p`
  color: #333;
  text-align: center;
`;

const JockRoom = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.JOCK}
      onClose={() => closeWindow(WINDOW_IDS.JOCK)}
      initialWidth="640px"
      initialHeight="360px"
      headerTitle="Jock Room"
      headerIcon="/images/icons/jockroom.png"
      showMaximizeButton={false}
      resizable={false}
    >
      <JockRoomWrapper>
        <Title>Welcome to the Jock Room!</Title>
        <Description>
          This is the place for all things athletic and sporty. Get ready to
          train hard and play harder!
        </Description>
      </JockRoomWrapper>
    </DraggableResizeableWindow>
  );
};

export default JockRoom;