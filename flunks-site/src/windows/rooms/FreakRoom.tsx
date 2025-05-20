import styled from "styled-components";
import { useWindowsContext } from "../../contexts/WindowsContext";
import DraggableResizeableWindow from "../../components/DraggableResizeableWindow";
// Update the import path below to the correct location of WINDOW_IDS in your project
import { WINDOW_IDS } from "../../fixed";

const RoomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f0f0f0;
`;

const Title = styled.h1`
  color: #ff69b4;
`;

const Content = styled.p`
  color: #333;
  font-size: 1.2rem;
`;

const FreakRoom = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.FREAK}
      onClose={() => closeWindow(WINDOW_IDS.FREAK)}
      initialWidth="640px"
      initialHeight="360px"
      headerTitle="Freak Room"
      headerIcon="/images/icons/freakroom.png"
      showMaximizeButton={false}
      resizable={false}
    >
      <RoomWrapper>
        <Title>Welcome to the Freak Room!</Title>
        <Content>This room is dedicated to all things freaky and fun!</Content>
      </RoomWrapper>
    </DraggableResizeableWindow>
  );
};

export default FreakRoom;