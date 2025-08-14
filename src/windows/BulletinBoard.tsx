import React from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { useWindowsContext } from '../contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import styled from 'styled-components';
import { Button } from 'react95';

const BulletinBoardContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #d4a574 0%, #e4c49a 50%, #d4a574 100%);
  padding: 20px;
`;

const BulletinImage = styled.div`
  position: relative;
  max-width: 100%;
  max-height: 100%;
  background-image: url('/images/bulletin-board.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  width: 600px;
  height: 450px;
  border: 8px solid #8B4513;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
  
  /* Fallback cork board texture if image doesn't load */
  background-color: #D2B48C;
  background-image: 
    radial-gradient(circle at 20% 50%, transparent 20%, rgba(255,255,255,0.3) 21%, rgba(255,255,255,0.3) 34%, transparent 35%, transparent),
    linear-gradient(0deg, transparent 24%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 76%, transparent 77%, transparent),
    linear-gradient(90deg, transparent 24%, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,0.05) 75%, rgba(255,255,255,0.05) 76%, transparent 77%, transparent);
`;

const EventCard = styled.div<{ top: string; left: string; width: string; height: string; color: string }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  width: ${props => props.width};
  height: ${props => props.height};
  background: ${props => props.color};
  border: 2px solid #333;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 10px;
  font-weight: bold;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 4px 4px 8px rgba(0,0,0,0.4);
    z-index: 10;
  }
  
  &:active {
    transform: scale(0.98);
  }
`;

const HeaderTitle = styled.div`
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, #FF69B4, #8A2BE2);
  color: white;
  padding: 8px 16px;
  border-radius: 12px;
  font-family: 'MS Sans Serif', sans-serif;
  font-weight: bold;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  border: 2px solid #fff;
  box-shadow: 2px 2px 4px rgba(0,0,0,0.3);
`;

const BulletinBoard: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  const handleHackathonClick = () => {
    // Open link for Hack-a-thon April 27 1PM
    window.open('https://discord.gg/wuukvhHhS3', '_blank');
  };

  const handleNFTWorkshopClick = () => {
    // Open link for NFT Workshop May 3 3PM  
    window.open('https://www.flowty.io/collection/0x807c3d470888cc48/Flunks', '_blank');
  };

  const handleWantedClick = () => {
    // Open link for Wanted Holder of Astro NFT
    window.open('https://twitter.com/FlunksCommunity', '_blank');
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.BULLETIN_BOARD}
      headerTitle="Community Bulletin Board"
      headerIcon="/images/icons/did-you-know.png"
      onClose={() => closeWindow(WINDOW_IDS.BULLETIN_BOARD)}
      initialWidth="680px"
      initialHeight="550px"
      resizable={true}
      showMaximizeButton={true}
    >
      <BulletinBoardContainer>
        <BulletinImage>
          <HeaderTitle>UPCOMING EVENTS</HeaderTitle>
          
          {/* Hack-a-thon Card (left side) */}
          <EventCard
            top="25%"
            left="5%"
            width="25%"
            height="35%"
            color="linear-gradient(135deg, #FF69B4, #FF1493)"
            onClick={handleHackathonClick}
            title="Click to join our Discord community!"
          >
            <div style={{ color: 'white', textShadow: '1px 1px 1px black' }}>
              🏆 HACK-A-THON
              <br />
              <br />
              APRIL 27
              <br />
              1PM
              <br />
              <br />
              💻 JOIN NOW!
            </div>
          </EventCard>
          
          {/* Wanted Poster (center) */}
          <EventCard
            top="20%"
            left="37.5%"
            width="25%"
            height="45%"
            color="linear-gradient(135deg, #00BFFF, #1E90FF)"
            onClick={handleWantedClick}
            title="Follow us on Twitter!"
          >
            <div style={{ color: 'white', textShadow: '1px 1px 1px black' }}>
              🚀 WANTED
              <br />
              <br />
              HOLDER OF
              <br />
              ASTRO NFT
              <br />
              <br />
              🌟 REWARD!
            </div>
          </EventCard>
          
          {/* NFT Workshop Card (right side) */}
          <EventCard
            top="25%"
            left="70%"
            width="25%"
            height="35%"
            color="linear-gradient(135deg, #FFD700, #FFA500)"
            onClick={handleNFTWorkshopClick}
            title="Check out our NFT collection on Flowty!"
          >
            <div style={{ color: 'black', textShadow: '1px 1px 1px white' }}>
              🎨 NFT
              <br />
              WORKSHOP
              <br />
              <br />
              MAY 3
              <br />
              3PM
              <br />
              <br />
              🖼️ CREATE!
            </div>
          </EventCard>

          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '20px',
            height: '20px',
            background: '#FF6B6B',
            borderRadius: '50%',
            transform: 'rotate(45deg)'
          }} />
          <div style={{
            position: 'absolute',
            top: '80%',
            right: '15%',
            width: '15px',
            height: '15px',
            background: '#4ECDC4',
            clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
          }} />
          <div style={{
            position: 'absolute',
            top: '70%',
            left: '20%',
            width: '25px',
            height: '10px',
            background: '#45B7D1',
            borderRadius: '10px'
          }} />
        </BulletinImage>
      </BulletinBoardContainer>
    </DraggableResizeableWindow>
  );
};

export default BulletinBoard;
