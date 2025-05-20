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

const GeekRoom = () => {
  const { closeWindow, openWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.GEEK}
      onClose={() => closeWindow(WINDOW_IDS.GEEK)}
      initialWidth="640px"
      initialHeight="360px"
      headerTitle="Geek Room"
      headerIcon="/images/icons/geekroom.png"
      showMaximizeButton={false}
      resizable={false}
    >
      <ContentWrapper>
        <Title>Welcome to the Geek Room!</Title>
        <Description>
          This room is dedicated to all things geeky. Here you can explore various topics, engage in discussions, and participate in activities that celebrate geek culture.
        </Description>
        <ButtonRow>
          <button onClick={() => openWindow(WINDOW_IDS.FREAK)}>Open Freak Room</button>
          <button onClick={() => openWindow(WINDOW_IDS.PREP)}>Open Prep Room</button>
          <button onClick={() => openWindow(WINDOW_IDS.JOCK)}>Open Jock Room</button>
        </ButtonRow>
      </ContentWrapper>
    </DraggableResizeableWindow>
  );
};

export default GeekRoom;