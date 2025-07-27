import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { usePaginatedItems } from "contexts/UserPaginatedItems";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useEffect, useState } from "react";
import { Button, Frame, Separator } from "react95";
// TODO: GUM functionality temporarily disabled - keep imports for future re-implementation
// import { getGumBalance } from "web3/script-get-gum-balance";
// import GumballMachine from "windows/GumballMachine";
import YourItemsGridFilter from "./Filter";
import styled from "styled-components";

// Retro 8-bit header styling
const RetroCounterFrame = styled(Frame)`
  background: linear-gradient(135deg, #000080 0%, #000040 100%) !important;
  border: 2px solid #00ff00 !important;
  box-shadow: 
    inset 0 0 0 1px #008800,
    0 0 8px #00ff0033 !important;
`;

const RetroText = styled.span`
  font-family: 'Courier New', monospace;
  color: #00ff00;
  text-shadow: 0 0 5px #00ff00;
  font-weight: bold;
`;

/* TODO: GUM functionality temporarily disabled - keep styled components for future re-implementation
const GumCounter = styled.div`
  background: linear-gradient(135deg, #800080 0%, #400040 100%);
  border: 2px solid #ff00ff;
  box-shadow: 
    inset 0 0 0 1px #880088,
    0 0 10px #ff00ff33;
  border-radius: 4px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GumText = styled.span`
  font-family: 'Courier New', monospace;
  color: #ffffff;
  text-shadow: 0 0 3px #ff00ff;
  font-weight: bold;
`;

const GumValue = styled.span`
  font-family: 'Courier New', monospace;
  color: #ff00ff;
  text-shadow: 0 0 5px #ff00ff;
  font-weight: bold;
`;
*/

// Retro toggle switch styling
const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background-image: url("data:image/svg+xml,<svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='memphisPattern' patternUnits='userSpaceOnUse' width='120' height='120' patternTransform='scale(0.3)'><rect x='0' y='0' width='120' height='120' fill='%23000000'/><path d='M10 20 Q 15 10, 25 20 T 40 25' stroke='%23cc44cc' stroke-width='3' fill='none'/><path d='M60 15 Q 70 5, 80 15 T 100 20' stroke='%2344cccc' stroke-width='3' fill='none'/><path d='M20 60 Q 30 50, 40 60 T 60 65' stroke='%23cccc44' stroke-width='3' fill='none'/><path d='M80 80 Q 90 70, 100 80 T 115 85' stroke='%23cc7744' stroke-width='3' fill='none'/><path d='M5 100 Q 15 90, 25 100 T 45 105' stroke='%2344cc44' stroke-width='3' fill='none'/><circle cx='15' cy='35' r='4' fill='%23aa33aa'/><circle cx='85' cy='25' r='3' fill='%2333aaaa'/><circle cx='45' cy='85' r='5' fill='%23aaaa33'/><circle cx='105' cy='55' r='4' fill='%23aa6633'/><circle cx='25' cy='75' r='3' fill='%2333aa33'/><rect x='50' y='40' width='8' height='2' fill='%23aa33aa' transform='rotate(25 54 41)'/><rect x='70' y='60' width='10' height='2' fill='%2333aaaa' transform='rotate(-15 75 61)'/><rect x='30' y='30' width='6' height='2' fill='%23aaaa33' transform='rotate(45 33 31)'/><rect x='90' y='90' width='8' height='2' fill='%23aa6633' transform='rotate(-30 94 91)'/><rect x='10' y='80' width='7' height='2' fill='%2333aa33' transform='rotate(60 13.5 81)'/><path d='M70 30 L 75 25 L 80 30 L 75 35 Z' fill='%23882288'/><path d='M35 50 L 40 45 L 45 50 L 40 55 Z' fill='%23228888'/><path d='M95 70 L 100 65 L 105 70 L 100 75 Z' fill='%23888822'/><path d='M15 55 L 20 50 L 25 55 L 20 60 Z' fill='%23885522'/><path d='M55 75 L 60 70 L 65 75 L 60 80 Z' fill='%23228822'/><path d='M85 45 Q 90 40, 95 45 Q 90 50, 85 45' fill='%23772277'/><path d='M25 95 Q 30 90, 35 95 Q 30 100, 25 95' fill='%23227777'/><path d='M65 15 Q 70 10, 75 15 Q 70 20, 65 15' fill='%23777722'/><path d='M45 35 Q 50 30, 55 35 Q 50 40, 45 35' fill='%23774422'/><path d='M5 45 Q 10 40, 15 45 Q 10 50, 5 45' fill='%23227722'/><polygon points='105,105 110,100 115,105 110,110' fill='%23661166'/><polygon points='5,25 10,20 15,25 10,30' fill='%23116666'/><polygon points='75,95 80,90 85,95 80,100' fill='%23666611'/><polygon points='35,15 40,10 45,15 40,20' fill='%23663311'/><polygon points='55,55 60,50 65,55 60,60' fill='%23116611'/></pattern></defs><rect width='100%' height='100%' fill='url(%23memphisPattern)'/></svg>");
  border: 2px solid #00ffff;
  border-radius: 4px;
  padding: 8px 12px;
  box-shadow: 
    inset 0 0 0 1px #006666,
    0 0 8px #00ffff33;
  flex: 1;
  max-width: 200px;
  margin: 0 auto;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140px;
    height: 32px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 16px;
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const ToggleSwitch = styled.div<{ active: boolean }>`
  position: relative;
  width: 60px;
  height: 28px;
  background: ${props => props.active ? 'linear-gradient(135deg, #00ff00 0%, #008800 100%)' : 'linear-gradient(135deg, #ff0080 0%, #800040 100%)'};
  border: 2px solid ${props => props.active ? '#00ff00' : '#ff0080'};
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    inset 0 0 0 1px ${props => props.active ? '#008800' : '#880040'},
    0 0 10px ${props => props.active ? '#00ff0033' : '#ff008033'};
    
  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.active ? '30px' : '2px'};
    width: 20px;
    height: 20px;
    background: #ffffff;
    border: 1px solid ${props => props.active ? '#00ff00' : '#ff0080'};
    border-radius: 50%;
    transition: all 0.3s ease;
    box-shadow: 0 0 5px ${props => props.active ? '#00ff0066' : '#ff008066'};
  }
`;

const ToggleLabel = styled.span<{ active: boolean }>`
  font-family: 'Courier New', monospace;
  color: ${props => props.active ? '#00ff00' : '#ff0080'};
  text-shadow: 0 0 5px ${props => props.active ? '#00ff00' : '#ff0080'};
  font-weight: bold;
  font-size: 14px;
`;

const MemphisFrame = styled(Frame)`
  background-image: url("data:image/svg+xml,<svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='memphisPattern' patternUnits='userSpaceOnUse' width='120' height='120' patternTransform='scale(0.5)'><rect x='0' y='0' width='120' height='120' fill='%23000000'/><path d='M10 20 Q 15 10, 25 20 T 40 25' stroke='%23cc44cc' stroke-width='3' fill='none'/><path d='M60 15 Q 70 5, 80 15 T 100 20' stroke='%2344cccc' stroke-width='3' fill='none'/><path d='M20 60 Q 30 50, 40 60 T 60 65' stroke='%23cccc44' stroke-width='3' fill='none'/><path d='M80 80 Q 90 70, 100 80 T 115 85' stroke='%23cc7744' stroke-width='3' fill='none'/><path d='M5 100 Q 15 90, 25 100 T 45 105' stroke='%2344cc44' stroke-width='3' fill='none'/><circle cx='15' cy='35' r='4' fill='%23aa33aa'/><circle cx='85' cy='25' r='3' fill='%2333aaaa'/><circle cx='45' cy='85' r='5' fill='%23aaaa33'/><circle cx='105' cy='55' r='4' fill='%23aa6633'/><circle cx='25' cy='75' r='3' fill='%2333aa33'/><rect x='50' y='40' width='8' height='2' fill='%23aa33aa' transform='rotate(25 54 41)'/><rect x='70' y='60' width='10' height='2' fill='%2333aaaa' transform='rotate(-15 75 61)'/><rect x='30' y='30' width='6' height='2' fill='%23aaaa33' transform='rotate(45 33 31)'/><rect x='90' y='90' width='8' height='2' fill='%23aa6633' transform='rotate(-30 94 91)'/><rect x='10' y='80' width='7' height='2' fill='%2333aa33' transform='rotate(60 13.5 81)'/><path d='M70 30 L 75 25 L 80 30 L 75 35 Z' fill='%23882288'/><path d='M35 50 L 40 45 L 45 50 L 40 55 Z' fill='%23228888'/><path d='M95 70 L 100 65 L 105 70 L 100 75 Z' fill='%23888822'/><path d='M15 55 L 20 50 L 25 55 L 20 60 Z' fill='%23885522'/><path d='M55 75 L 60 70 L 65 75 L 60 80 Z' fill='%23228822'/><path d='M85 45 Q 90 40, 95 45 Q 90 50, 85 45' fill='%23772277'/><path d='M25 95 Q 30 90, 35 95 Q 30 100, 25 95' fill='%23227777'/><path d='M65 15 Q 70 10, 75 15 Q 70 20, 65 15' fill='%23777722'/><path d='M45 35 Q 50 30, 55 35 Q 50 40, 45 35' fill='%23774422'/><path d='M5 45 Q 10 40, 15 45 Q 10 50, 5 45' fill='%23227722'/><polygon points='105,105 110,100 115,105 110,110' fill='%23661166'/><polygon points='5,25 10,20 15,25 10,30' fill='%23116666'/><polygon points='75,95 80,90 85,95 80,100' fill='%23666611'/><polygon points='35,15 40,10 45,15 40,20' fill='%23663311'/><polygon points='55,55 60,50 65,55 60,60' fill='%23116611'/></pattern></defs><rect width='100%' height='100%' fill='url(%23memphisPattern)'/></svg>") !important;
`;

const Counter = ({ label, count }) => {
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || null;

  return (
    <div className="flex w-full">
      <RetroCounterFrame
        variant="field"
        className="w-full px-3 py-1 !flex justify-between"
        style={{
          opacity: walletAddress ? 1 : 0.5,
        }}
      >
        <RetroText className="text-lg">{label}</RetroText>
        <RetroText className="text-lg font-bold">{count}</RetroText>
      </RetroCounterFrame>
    </div>
  );
};

const YourItemsGridHeader = ({ pixelMode, setPixelMode }: { pixelMode: boolean; setPixelMode: (mode: boolean) => void }) => {
  const { openWindow } = useWindowsContext();
  const { flunksCount, backpacksCount } = usePaginatedItems();

  // TODO: GUM functionality temporarily disabled - keep for future re-implementation
  // const [gumBalance, setGumBalance] = useState<number>(0);
  const { primaryWallet } = useDynamicContext();
  const walletAddress = primaryWallet?.address || null;

  useEffect(() => {
    if (!walletAddress) return;
    // TODO: GUM functionality temporarily disabled
    // getGumBalance(walletAddress).then(setGumBalance);
  }, [walletAddress]);

  return (
    <>
      <MemphisFrame variant="field" className="!w-full">
        <div className="flex">
          <Counter label="Flunks" count={flunksCount} />
          <Counter label="Backpacks" count={backpacksCount} />
        </div>
        <div className="flex w-full items-center justify-center">
          {/* TODO: GUM functionality temporarily disabled - keep for future re-implementation
          <div className="flex-1">
            <Counter label="GUM" count={Number(gumBalance || 0)?.toFixed(5)} />
          </div>
          */}
          <ToggleContainer>
            <ToggleLabel active={!pixelMode}>2D</ToggleLabel>
            <ToggleSwitch 
              active={pixelMode} 
              onClick={() => setPixelMode(!pixelMode)}
            />
            <ToggleLabel active={pixelMode}>PX</ToggleLabel>
          </ToggleContainer>
          {/* TODO: GUM functionality temporarily disabled - keep for future re-implementation
          <Frame
            variant="well"
            className="!flex items-end justify-end"
            style={{ background: '#400040', border: '2px solid #ff00ff' }}
          >
            <Button
              onClick={() => {
                openWindow({
                  key: WINDOW_IDS.GUMBALL_MACHINE,
                  window: <GumballMachine />,
                });
              }}
              variant="raised"
              className="text-xl !flex gap-2"
              style={{ 
                background: '#800080', 
                border: '2px solid #ff00ff',
                color: '#ffffff',
                textShadow: '0 0 3px #ff00ff'
              }}
            >
              <img src="/images/icons/gum-machine.png" className="h-6" />
            </Button>
          </Frame>
          */}
        </div>
      </MemphisFrame>
      <YourItemsGridFilter />
      <Separator className="!my-2" />
    </>
  );
};

export default YourItemsGridHeader;
