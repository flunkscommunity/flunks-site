import React from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { useWindowsContext } from '../contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import styled from 'styled-components';

const BulletinBoardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2c2c2c;
  overflow: hidden;
`;

const BulletinImage = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-image: url('/images/bulletin-august.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`;

const ClickableHotspot = styled.div`
  position: absolute;
  cursor: pointer;
  transition: opacity 0.2s ease;
  
  &:hover {
    opacity: 0.8;
  }
`;

const BulletinBoard: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  const handleAstronautClick = () => {
    window.open('https://www.flowty.io/asset/0x807c3d470888cc48/Flunks/NFT/3666', '_blank');
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.BULLETIN_BOARD}
      headerTitle="Community Bulletin Board"
      headerIcon="/images/icons/did-you-know.png"
      onClose={() => closeWindow(WINDOW_IDS.BULLETIN_BOARD)}
      initialWidth="800px"
      initialHeight="600px"
      resizable={false}
      showMaximizeButton={false}
    >
      <BulletinBoardContainer>
        <BulletinImage>
          {/* Clickable hotspot over astronaut in center */}
          <ClickableHotspot
            onClick={handleAstronautClick}
            title="View NFT on Flowty"
            style={{
              top: '55%',
              left: '40%',
              width: '20%',
              height: '40%'
            }}
          />
        </BulletinImage>
      </BulletinBoardContainer>
    </DraggableResizeableWindow>
  );
};

export default BulletinBoard;
