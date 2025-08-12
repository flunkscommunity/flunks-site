import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import ItemsGrid from "components/YourItems/ItemsGrid";
import BootScreen from "components/BootScreen";
import { useState } from "react";
import ErrorWindow from "./ErrorWindow";
import { Button } from "react95";
import styled from "styled-components";

const RetroBackground = styled.div`
  position: relative;
  height: 100%;
  min-height: 400px;
  width: 100%;
  background: linear-gradient(180deg, 
    #2D1B69 0%,     /* Deep purple sky top */
    #4A2C7D 15%,    /* Purple */
    #663399 30%,    /* Medium purple */
    #8B4B9C 45%,    /* Purple-pink transition */
    #B85BB8 60%,    /* Pink-purple */
    #E66BA3 75%,    /* Pink */
    #FF8B66 85%,    /* Orange-pink */
    #FFAA44 95%,    /* Golden orange */
    #FFD700 100%    /* Golden yellow horizon */
  ) !important;
  
  /* Add subtle pixel-like noise pattern overlay */
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 1px, transparent 2px),
    radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 2px) !important;
  background-size: 20px 20px, 30px 30px, 40px 40px !important;
  
  /* Overlay for content readability */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }
  
  /* Ensure content is above overlay */
  > * {
    position: relative;
    z-index: 2;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 2rem;
  gap: 1.5rem;
`;

const WelcomeCard = styled.div`
  background: transparent;
  border: none;
  padding: 2rem 2rem 5rem 2rem;
  text-align: center;
  max-width: 400px;
  width: 100%;
  color: white;
  text-shadow: 2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000;
`;

const YourStudents: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow, openWindow } = useWindowsContext();
  const [bootComplete, setBootComplete] = useState(false);

  if (!user) {
    return (
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="OnlyFlunks - Sign In Required"
        windowsId={WINDOW_IDS.YOUR_STUDENTS}
        onClose={() => closeWindow(WINDOW_IDS.YOUR_STUDENTS)}
        initialHeight="400px"
        initialWidth="500px"
        headerIcon="/images/icons/onlyflunks.png"
        resizable={false}
        style={{
          background: `linear-gradient(180deg, 
            #2D1B69 0%,
            #4A2C7D 15%,
            #663399 30%,
            #8B4B9C 45%,
            #B85BB8 60%,
            #E66BA3 75%,
            #FF8B66 85%,
            #FFAA44 95%,
            #FFD700 100%
          )`
        }}
      >
        <style jsx>{`
          @keyframes flash {
            0%, 50% {
              background-color: #c0c0c0 !important;
              box-shadow: inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #808080 !important;
              color: #000 !important;
            }
            51%, 100% {
              background-color: #00FF00 !important;
              box-shadow: inset 1px 1px 0 #66FF66, inset -1px -1px 0 #009900 !important;
              color: #000 !important;
              text-shadow: 0px 0px 10px #00FF00 !important;
            }
          }
        `}</style>
        
        <div 
          style={{ 
            height: '100%', 
            width: '100%', 
            overflow: 'hidden',
            background: `linear-gradient(180deg, 
              #2D1B69 0%,
              #4A2C7D 15%,
              #663399 30%,
              #8B4B9C 45%,
              #B85BB8 60%,
              #E66BA3 75%,
              #FF8B66 85%,
              #FFAA44 95%,
              #FFD700 100%
            )`,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 1px, transparent 2px),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.08) 1px, transparent 2px),
              radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 2px)
            `,
            backgroundSize: '20px 20px, 30px 30px, 40px 40px',
            position: 'relative',
            minHeight: '400px'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.3)',
              zIndex: 1
            }}
          />
          <ContentContainer style={{ position: 'relative', zIndex: 2 }}>
            <WelcomeCard>
              <div className="text-center">
                <img 
                  src="/images/icons/onlyflunks.png" 
                  alt="OnlyFlunks" 
                  className="w-16 h-16 mx-auto mb-4"
                  style={{ 
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(2px 2px 0px #000)'
                  }}
                />
                <h2 
                  className="text-xl font-bold mb-2" 
                  style={{ 
                    fontFamily: 'w95fa, "Courier New", monospace',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#FFD700',
                    textShadow: '3px 3px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000',
                    letterSpacing: '2px'
                  }}
                >
                  WELCOME TO ONLYFLUNKS
                </h2>
                <p 
                  className="mb-6" 
                  style={{ 
                    fontSize: '16px', 
                    lineHeight: '1.4',
                    fontFamily: 'w95fa, "Courier New", monospace',
                    color: '#FFFFFF',
                    textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000',
                    letterSpacing: '1px'
                  }}
                >
                  Connect your Flow wallet to access your collection and interact with other Flunks.
                </p>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                <DynamicConnectButton>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    style={{ 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      fontFamily: 'w95fa, "Courier New", monospace',
                      animation: 'flash 1.5s infinite',
                      letterSpacing: '1px',
                      textShadow: '1px 1px 0px #000'
                    }}
                  >
                    🔗 CONNECT WALLET
                  </Button>
                </DynamicConnectButton>
                
                <Button 
                  onClick={() => closeWindow(WINDOW_IDS.YOUR_STUDENTS)}
                  variant="flat"
                  className="w-full"
                  style={{ 
                    fontSize: '14px',
                    fontFamily: 'w95fa, "Courier New", monospace',
                    letterSpacing: '1px'
                  }}
                >
                  CANCEL
                </Button>
              </div>
              
              <div className="text-xs text-center mt-4">
                <p style={{ 
                  color: '#CCCCCC',
                  fontFamily: 'w95fa, "Courier New", monospace',
                  textShadow: '1px 1px 0px #000',
                  letterSpacing: '0.5px'
                }}>
                  Supported wallets: Flow Wallet, Blocto, Dapper
                </p>
              </div>
            </WelcomeCard>
          </ContentContainer>
        </div>
      </DraggableResizeableWindow>
    );
  }

  if (!bootComplete) {
    return <BootScreen onComplete={() => setBootComplete(true)} />;
  }

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle={`OnlyFlunks - ${
        user?.username || (user ? "Logged In" : "Not Logged In")
      }`}
      authGuard={true}
      windowsId={WINDOW_IDS.YOUR_STUDENTS}
      onClose={() => {
        closeWindow(WINDOW_IDS.YOUR_STUDENTS);
      }}
      initialHeight="60%"
      initialWidth="60%"
      headerIcon="/images/icons/onlyflunks.png"
    >
      <ItemsGrid />
    </DraggableResizeableWindow>
  );
};

export default YourStudents;
