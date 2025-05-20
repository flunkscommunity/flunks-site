import React from 'react';
import styled from 'styled-components';
import { useWindowsContext } from '../../contexts/WindowsContext';
import DraggableResizeableWindow from '../../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../../fixed';

const ContentWrapper = styled.div`
  padding: 20px;
  background-color: #f0f0f0;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: #333;
`;

const Description = styled.p`
  color: #666;
`;

const ButtonRow = styled.div`
  margin-top: 24px;
  display: flex;
  gap: 16px;
`;

const PrepRoom = () => {
  const { closeWindow, openWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.PREP}
      onClose={() => closeWindow(WINDOW_IDS.PREP)}
      initialWidth="640px"
      initialHeight="360px"
      headerTitle="Prep Room"
      headerIcon="/images/icons/preproom.png"
      showMaximizeButton={false}
      resizable={false}
    >
      <ContentWrapper>
        <Title>Welcome to the Prep Room!</Title>
        <Description>
          This room is designed for students who are preparing for their classes. 
          Here you can find resources, study materials, and more.
        </Description>
        <ButtonRow>
          <button onClick={() => openWindow(WINDOW_IDS.FREAK)}>Open Freak Room</button>
          <button onClick={() => openWindow(WINDOW_IDS.GEEK)}>Open Geek Room</button>
          <button onClick={() => openWindow(WINDOW_IDS.JOCK)}>Open Jock Room</button>
        </ButtonRow>
      </ContentWrapper>
    </DraggableResizeableWindow>
  );
};

export default PrepRoom;