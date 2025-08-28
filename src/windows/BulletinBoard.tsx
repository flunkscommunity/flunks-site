import React from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { useWindowsContext } from '../contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import styled from 'styled-components';
import { isFeatureEnabled } from '../utils/buildMode';

const BulletinBoardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #2c2c2c;
  overflow-y: auto;
`;

const BulletinImage = styled.div`
  position: relative;
  width: calc(100% - 20px);
  height: 500px;
  background-image: url('/images/bulletin-august.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
  margin: 10px;
  margin-bottom: 0;
  border: 2px solid #dfdfdf;
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  z-index: 10;
  background-color: #c0c0c0;
`;

const BulletinContent = styled.div`
  flex: 1;
  padding: 20px;
  background: linear-gradient(135deg, #c0c0c0 0%, #808080 100%);
  border-top: 2px solid #dfdfdf;
  border-left: 2px solid #dfdfdf;
  border-right: 2px solid #404040;
  border-bottom: 2px solid #404040;
  margin: 0 10px 10px 10px;
  font-family: 'MS Sans Serif', sans-serif;
  z-index: 1;
  position: relative;
`;

const BulletinTitle = styled.h2`
  color: #000080;
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 15px 0;
  text-shadow: 1px 1px 0px #dfdfdf;
  border-bottom: 2px solid #000080;
  padding-bottom: 5px;
`;

const BulletinList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BulletinItem = styled.li`
  margin-bottom: 15px;
  padding: 10px;
  background: #dfdfdf;
  border: 2px outset #c0c0c0;
  box-shadow: inset 1px 1px 0px #ffffff, inset -1px -1px 0px #808080;
  font-size: 12px;
  line-height: 1.4;
  position: relative;
  
  &::before {
    content: "★";
    color: #800080;
    font-weight: bold;
    font-size: 14px;
    margin-right: 8px;
  }
`;

const PrizeText = styled.span`
  color: #008000;
  font-weight: bold;
  text-transform: uppercase;
`;

const TerminalText = styled.span`
  color: #000080;
  font-weight: bold;
`;

const AstronautText = styled.span`
  color: #800000;
  font-weight: bold;
`;

const PinkBoxText = styled.div`
  position: absolute;
  top: 67%;
  left: 13%;
  width: 22%;
  height: 25%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000080;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  text-shadow: 1px 1px 0px rgba(255, 255, 255, 0.8);
  z-index: 12;
  pointer-events: none;
`;

const ClickableHotspot = styled.div`
  position: absolute;
  cursor: pointer;
  transition: opacity 0.2s ease;
  z-index: 15;
  
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
      headerIcon="/images/icons/bulletin-board-icon.png"
      onClose={() => closeWindow(WINDOW_IDS.BULLETIN_BOARD)}
      initialWidth="800px"
      initialHeight="900px"
      resizable={true}
      showMaximizeButton={true}
    >
      <BulletinBoardContainer>
        <div style={{ order: 1 }}>
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
            
            {/* Clickable hotspot for the lightbulb icon in pink box */}
            <ClickableHotspot
              onClick={() => {
                // Add your code here for what happens when the lightbulb is clicked
                console.log('Lightbulb icon clicked!');
                // You can add additional functionality here later
              }}
              title="Click the lightbulb!"
              style={{
                top: '67%',
                left: '13%',
                width: '22%',
                height: '25%'
              }}
            />
          </BulletinImage>
        </div>
        
        <div style={{ order: 2 }}>
          <BulletinContent>
            <BulletinTitle>📋 COMMUNITY CHALLENGES</BulletinTitle>
            <BulletinList>
              <BulletinItem>
                There's a <TerminalText>terminal code</TerminalText> hidden somewhere on the FHS app, find it. 
                First one to enter it wins <PrizeText>FLOW</PrizeText>!
              </BulletinItem>
              
              <BulletinItem>
                First person to have the <AstronautText>Astronaut holder</AstronautText> reach out to Flunks 
                AND give your username as who told you to reach out wins a <PrizeText>FLOW prize</PrizeText>!
              </BulletinItem>
              
              <BulletinItem>
                {isFeatureEnabled('flappyFlunkWeekend') ? (
                  <>🎮 Flappy Flunk - this weekend only! 🎮</>
                ) : (
                  <>Coming Soon... 🔮</>
                )}
              </BulletinItem>
            </BulletinList>
          </BulletinContent>
        </div>
      </BulletinBoardContainer>
    </DraggableResizeableWindow>
  );
};

export default BulletinBoard;
