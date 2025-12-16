import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';
import SetupCollectionButton from './SetupCollectionButton';
import * as fcl from '@onflow/fcl';
import '../config/fcl';

// Arcade animations
const arcadeBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const neonGlow = keyframes`
  0%, 100% { 
    text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff, 0 0 30px #ff00ff;
  }
  50% { 
    text-shadow: 0 0 20px #ff00ff, 0 0 40px #ff00ff, 0 0 60px #ff00ff, 0 0 80px #ff00ff;
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #000033 100%);
  color: #fff;
  font-family: 'Press Start 2P', 'Courier New', monospace;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.03) 0px,
        transparent 1px,
        transparent 2px,
        rgba(255, 255, 255, 0.03) 3px
      );
    pointer-events: none;
    z-index: 1;
  }
`;

const Header = styled.div`
  background: linear-gradient(135deg, #ff00ff 0%, #00ffff 100%);
  padding: 20px;
  text-align: center;
  border-bottom: 4px solid #fff;
  box-shadow: 0 4px 0 #000, 0 8px 20px rgba(255, 0, 255, 0.5);
  position: relative;
  z-index: 2;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 24px;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: ${neonGlow} 2s ease-in-out infinite;
  text-shadow: 
    2px 2px 0 #000,
    0 0 10px #ff00ff,
    0 0 20px #ff00ff;
`;

const Subtitle = styled.p`
  margin: 10px 0 0;
  font-size: 10px;
  color: #ffff00;
  text-shadow: 1px 1px 0 #000;
  animation: ${arcadeBlink} 2s ease-in-out infinite;
`;

const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  z-index: 2;
  
  &::-webkit-scrollbar {
    width: 12px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a0033;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #ff00ff, #00ffff);
    border-radius: 6px;
  }
`;

const JacketCarousel = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto 30px;
  background: rgba(0, 0, 0, 0.5);
  border: 4px solid #ff00ff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.5);
`;

const JacketDisplay = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const JacketImage = styled.div<{ $active: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 0.5s ease;
  
  img {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  }
`;

const PinOverlay = styled.div<{ $x: number; $y: number }>`
  position: absolute;
  left: ${props => props.$x}%;
  top: ${props => props.$y}%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  cursor: move;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.6));
  transition: transform 0.2s ease;
  z-index: 10;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.15);
    filter: drop-shadow(0 6px 12px rgba(255, 0, 255, 0.9));
  }
`;

const ScreenshotButton = styled.button`
  background: linear-gradient(135deg, #00ff00, #00cc00);
  color: #000;
  border: 3px solid #fff;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  cursor: pointer;
  box-shadow: 0 4px 0 #000, 0 6px 15px rgba(0, 255, 0, 0.5);
  transition: all 0.1s ease;
  margin-top: 15px;
  font-weight: bold;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #000, 0 8px 20px rgba(0, 255, 0, 0.7);
  }
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #000, 0 4px 10px rgba(0, 255, 0, 0.5);
  }
`;

const ResetButton = styled.button`
  background: linear-gradient(135deg, #ff0000, #cc0000);
  color: #fff;
  border: 3px solid #fff;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  cursor: pointer;
  box-shadow: 0 4px 0 #000, 0 6px 15px rgba(255, 0, 0, 0.5);
  transition: all 0.1s ease;
  margin-top: 15px;
  margin-left: 10px;
  font-weight: bold;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #000, 0 8px 20px rgba(255, 0, 0, 0.7);
  }
  
  &:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #000, 0 4px 10px rgba(255, 0, 0, 0.5);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const CarouselControls = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 15px;
`;

const CarouselButton = styled.button`
  background: linear-gradient(135deg, #ff00ff, #ff66ff);
  color: #fff;
  border: 3px solid #fff;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: 'Press Start 2P', monospace;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 4px 0 #000, 0 6px 15px rgba(255, 0, 255, 0.5);
  transition: all 0.1s ease;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 0 #000, 0 8px 20px rgba(255, 0, 255, 0.7);
  }
  
  &:active:not(:disabled) {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #000, 0 4px 10px rgba(255, 0, 255, 0.5);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const JacketIndicators = styled.div`
  display: flex;
  gap: 10px;
`;

const Indicator = styled.div<{ $active: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$active ? '#00ffff' : '#333'};
  border: 2px solid ${props => props.$active ? '#fff' : '#666'};
  box-shadow: ${props => props.$active ? '0 0 10px #00ffff' : 'none'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const PinsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  margin: 20px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const PinCard = styled.div<{ $placed: boolean }>`
  background: rgba(0, 0, 0, 0.6);
  border: 3px solid ${props => props.$placed ? '#666' : '#00ffff'};
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  cursor: ${props => props.$placed ? 'not-allowed' : 'grab'};
  opacity: ${props => props.$placed ? 0.4 : 1};
  transition: all 0.2s ease;
  animation: ${slideIn} 0.3s ease;
  
  &:hover {
    transform: ${props => props.$placed ? 'none' : 'translateY(-5px)'};
    box-shadow: ${props => props.$placed ? 'none' : '0 8px 20px rgba(0, 255, 255, 0.5)'};
    border-color: ${props => props.$placed ? '#666' : '#ff00ff'};
  }
  
  &:active {
    cursor: ${props => props.$placed ? 'not-allowed' : 'grabbing'};
  }
  
  img {
    width: 80px;
    height: 80px;
    object-fit: contain;
    margin-bottom: 8px;
    filter: ${props => props.$placed ? 'grayscale(100%)' : 'none'};
  }
  
  p {
    font-size: 8px;
    margin: 0;
    color: ${props => props.$placed ? '#666' : '#00ffff'};
  }
`;

const BottomClaimWindow = styled.div`
  background: linear-gradient(135deg, #000033 0%, #1a0033 100%);
  border-top: 4px solid #ff00ff;
  padding: 20px;
  box-shadow: 0 -4px 20px rgba(255, 0, 255, 0.3);
  position: relative;
  z-index: 2;
`;

const ClaimTitle = styled.h3`
  font-size: 14px;
  color: #ffff00;
  margin: 0 0 15px;
  text-align: center;
  text-shadow: 0 0 10px #ffff00;
`;

const ConnectMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  
  h2 {
    font-size: 16px;
    color: #00ffff;
    margin-bottom: 20px;
    animation: ${arcadeBlink} 1.5s ease-in-out infinite;
  }
  
  p {
    font-size: 10px;
    color: #fff;
    line-height: 1.6;
  }
`;

interface Pin {
  id: string;
  name: string;
  image: string;
  type: string;
  placed: boolean;
  x?: number;
  y?: number;
}

interface SemesterZeroVarsityDisplayProps {
  onClose?: () => void;
}

const JACKETS = [
  { id: 'black', name: 'Black F', image: '/images/jackets/black-f.png', color: '#000' },
  { id: 'pink', name: 'Pink F', image: '/images/jackets/pink-f.png', color: '#ff69b4' },
  { id: 'white', name: 'White F', image: '/images/jackets/white-f.png', color: '#fff' },
];

const SemesterZeroVarsityDisplay: React.FC<SemesterZeroVarsityDisplayProps> = ({ onClose }) => {
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  const walletAddress = unifiedAddress || primaryWallet?.address;

  const [currentJacketIndex, setCurrentJacketIndex] = useState(0);
  const [pins, setPins] = useState<Pin[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingPin, setDraggingPin] = useState<Pin | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPlaced, setIsDraggingPlaced] = useState(false);
  const [draggedPlacedPin, setDraggedPlacedPin] = useState<Pin | null>(null);
  const jacketRef = useRef<HTMLDivElement>(null);

  // Fetch pins from wallet
  useEffect(() => {
    const fetchPins = async () => {
      if (!walletAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Fetching NFTs for wallet:', walletAddress);
        
        const result = await fcl.query({
          cadence: `
            import SemesterZeroV3 from 0xce9dd43888d99574
            import MetadataViews from 0x1d7e57aa55817448

            access(all) struct PinData {
              access(all) let id: UInt64
              access(all) let name: String
              access(all) let image: String
              access(all) let type: String
              access(all) let tier: String
              
              init(id: UInt64, name: String, image: String, type: String, tier: String) {
                self.id = id
                self.name = name
                self.image = image
                self.type = type
                self.tier = tier
              }
            }

            access(all) fun main(address: Address): [PinData] {
              let account = getAccount(address)
              
              let collectionRef = account.capabilities
                .borrow<&SemesterZeroV3.Collection>(/public/SemesterZeroV3Collection)
              
              if collectionRef == nil {
                return []
              }
              
              let collection = collectionRef!
              let ids = collection.getIDs()
              let pinData: [PinData] = []
              
              for id in ids {
                if let nft = collection.borrowSemesterZeroNFT(id: id) {
                  var name = "Paradise Motel Pin"
                  var image = ""
                  
                  if let display = nft.resolveView(Type<MetadataViews.Display>()) {
                    let displayView = display as! MetadataViews.Display
                    name = displayView.name
                    if let httpFile = displayView.thumbnail as? MetadataViews.HTTPFile {
                      image = httpFile.url
                    }
                  }
                  
                  let tier = nft.evolutionTier
                  let type = nft.metadata["type"] ?? "Token"
                  
                  // Include ALL NFTs - let user see everything they have
                  pinData.append(PinData(
                    id: id,
                    name: name,
                    image: image,
                    type: type,
                    tier: tier
                  ))
                }
              }
              
              return pinData
            }
          `,
          args: (arg, t) => [arg(walletAddress, t.Address)],
        });

        console.log('📦 Found NFTs:', result);

        const fetchedPins: Pin[] = result.map((pin: any) => ({
          id: pin.id.toString(),
          name: pin.name,
          image: pin.image,
          type: pin.type,
          placed: false,
        }));

        console.log('✅ Processed pins:', fetchedPins);
        setPins(fetchedPins);
        // Load saved layout after pins are fetched
        setTimeout(() => loadPinLayout(), 100);
      } catch (error) {
        console.error('❌ Error fetching pins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, [walletAddress]);

  // Load saved layout when jacket changes
  useEffect(() => {
    if (pins.length > 0) {
      loadPinLayout();
    }
  }, [currentJacketIndex]);

  const nextJacket = () => {
    setCurrentJacketIndex((prev) => (prev + 1) % JACKETS.length);
  };

  const prevJacket = () => {
    setCurrentJacketIndex((prev) => (prev - 1 + JACKETS.length) % JACKETS.length);
  };

  const handlePinClick = (pin: Pin) => {
    if (pin.placed) return;
    setDraggingPin(pin);
  };

  const handleJacketClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingPlaced && draggedPlacedPin && jacketRef.current) {
      // Moving an already placed pin
      const rect = jacketRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPins(pins.map(p => 
        p.id === draggedPlacedPin.id 
          ? { ...p, x, y }
          : p
      ));

      setIsDraggingPlaced(false);
      setDraggedPlacedPin(null);
      savePinLayout();
    } else if (draggingPin && jacketRef.current) {
      // Placing a new pin
      const rect = jacketRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPins(pins.map(p => 
        p.id === draggingPin.id 
          ? { ...p, placed: true, x, y }
          : p
      ));

      setDraggingPin(null);
      savePinLayout();
    }
  };

  const handlePlacedPinMouseDown = (pin: Pin) => {
    setIsDraggingPlaced(true);
    setDraggedPlacedPin(pin);
  };

  const handleRemovePin = (pinId: string) => {
    if (isDraggingPlaced) return; // Don't remove while dragging
    setPins(pins.map(p => 
      p.id === pinId 
        ? { ...p, placed: false, x: undefined, y: undefined }
        : p
    ));
    savePinLayout();
  };

  // Save pin layout to localStorage
  const savePinLayout = () => {
    if (!walletAddress) return;
    const layout = pins
      .filter(p => p.placed)
      .map(p => ({ id: p.id, x: p.x, y: p.y }));
    localStorage.setItem(`pin-layout-${walletAddress}-${currentJacketIndex}`, JSON.stringify(layout));
  };

  // Load pin layout from localStorage
  const loadPinLayout = () => {
    if (!walletAddress) return;
    const saved = localStorage.getItem(`pin-layout-${walletAddress}-${currentJacketIndex}`);
    if (saved) {
      const layout = JSON.parse(saved);
      setPins(prevPins => prevPins.map(p => {
        const savedPin = layout.find((l: any) => l.id === p.id);
        if (savedPin) {
          return { ...p, placed: true, x: savedPin.x, y: savedPin.y };
        }
        return { ...p, placed: false, x: undefined, y: undefined };
      }));
    }
  };

  // Screenshot functionality
  const handleScreenshot = async () => {
    if (!jacketRef.current) return;
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(jacketRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
      });
      
      const link = document.createElement('a');
      const jacket = JACKETS[currentJacketIndex];
      link.download = `flunks-varsity-${jacket ? jacket.id : 'black'}-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot error:', error);
      alert('Error creating screenshot. Please try again.');
    }
  };

  // Reset pins for current jacket
  const handleResetPins = () => {
    if (!confirm('Remove all pins from this jacket? This cannot be undone.')) return;
    
    setPins(pins.map(p => ({ ...p, placed: false, x: undefined, y: undefined })));
    
    // Clear saved layout
    if (walletAddress) {
      localStorage.removeItem(`pin-layout-${walletAddress}-${currentJacketIndex}`);
    }
  };

  const currentJacket = JACKETS[currentJacketIndex];
  const placedPins = pins.filter(p => p.placed);

  return (
    <Container>
      <Header>
        <Title>🎓 VARSITY LETTER F 🎓</Title>
        <Subtitle>◆ DISPLAY YOUR PINS & PATCHES ◆</Subtitle>
        {walletAddress && (
          <div style={{ 
            marginTop: '10px', 
            fontSize: '8px', 
            color: '#00ffff',
            fontFamily: 'monospace',
            textShadow: '0 0 5px #00ffff'
          }}>
            WALLET: {walletAddress}
          </div>
        )}
      </Header>

      <MainContent>
        {!walletAddress ? (
          <ConnectMessage>
            <h2>🎮 INSERT COIN 🎮</h2>
            <p>Connect your wallet to display your pins on the varsity letter!</p>
          </ConnectMessage>
        ) : (
          <>
            {/* Jacket Display with Carousel */}
            <JacketCarousel>
              <JacketDisplay 
                ref={jacketRef}
                onClick={handleJacketClick}
                style={{ cursor: draggingPin || isDraggingPlaced ? 'crosshair' : 'default' }}
              >
                {JACKETS.map((jacket, index) => (
                  <JacketImage key={jacket.id} $active={index === currentJacketIndex}>
                    <img src={jacket.image} alt={jacket.name} />
                  </JacketImage>
                ))}
                
                {/* Placed Pins */}
                {placedPins.map(pin => (
                  <PinOverlay
                    key={pin.id}
                    $x={pin.x!}
                    $y={pin.y!}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handlePlacedPinMouseDown(pin);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleRemovePin(pin.id);
                    }}
                    title={isDraggingPlaced ? 'Click on F to place' : `${pin.name} - Double-click to remove, drag to move`}
                  >
                    <img src={pin.image} alt={pin.name} crossOrigin="anonymous" />
                  </PinOverlay>
                ))}
              </JacketDisplay>

              <ButtonRow>
                <ScreenshotButton onClick={handleScreenshot}>
                  📸 SCREENSHOT
                </ScreenshotButton>
                <ResetButton onClick={handleResetPins}>
                  🔄 RESET PINS
                </ResetButton>
              </ButtonRow>

              <CarouselControls>
                <CarouselButton onClick={prevJacket}>
                  ◀ PREV
                </CarouselButton>
                
                <JacketIndicators>
                  {JACKETS.map((jacket, index) => (
                    <Indicator
                      key={jacket.id}
                      $active={index === currentJacketIndex}
                      onClick={() => setCurrentJacketIndex(index)}
                      title={jacket.name}
                    />
                  ))}
                </JacketIndicators>
                
                <CarouselButton onClick={nextJacket}>
                  NEXT ▶
                </CarouselButton>
              </CarouselControls>
            </JacketCarousel>

            {/* Available Pins */}
            {loading ? (
              <ConnectMessage>
                <h2>⏳ LOADING PINS... ⏳</h2>
              </ConnectMessage>
            ) : pins.length > 0 ? (
              <>
                <ClaimTitle>
                  {draggingPin ? '▼ CLICK ON THE F TO PLACE ▼' : `▼ YOUR SEMESTER ZERO NFTs (${pins.length}) ▼`}
                </ClaimTitle>
                <PinsGrid>
                  {pins.map(pin => (
                    <PinCard
                      key={pin.id}
                      $placed={pin.placed}
                      onClick={() => handlePinClick(pin)}
                      title={pin.placed ? 'Already placed - click on F to remove' : 'Click to place on F'}
                    >
                      <img src={pin.image} alt={pin.name} />
                      <p>{pin.name}</p>
                      <p style={{ fontSize: '6px', color: '#999', marginTop: '4px' }}>
                        {pin.type} • {pin.id}
                      </p>
                      <p style={{ fontSize: '7px', color: pin.placed ? '#666' : '#ffff00' }}>
                        {pin.placed ? '✓ PLACED' : 'CLICK TO PLACE'}
                      </p>
                    </PinCard>
                  ))}
                </PinsGrid>
              </>
            ) : (
              <ConnectMessage>
                <h2>📦 NO NFTs FOUND 📦</h2>
                <p style={{ fontSize: '9px', marginBottom: '10px' }}>
                  Wallet: {walletAddress}
                </p>
                <p>Check the browser console for details.</p>
                <p>If you have NFTs, they should appear here.</p>
              </ConnectMessage>
            )}
          </>
        )}
      </MainContent>

      {/* Bottom Claim Window */}
      {walletAddress && (
        <BottomClaimWindow>
          <ClaimTitle>🎫 COLLECTION STATUS 🎫</ClaimTitle>
          <SetupCollectionButton wallet={walletAddress} compact={false} />
        </BottomClaimWindow>
      )}
    </Container>
  );
};

export default SemesterZeroVarsityDisplay;
