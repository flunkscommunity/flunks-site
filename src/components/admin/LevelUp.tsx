import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useUnifiedWallet } from '../../contexts/UnifiedWalletContext';
import { useGum } from '../../contexts/GumContext';
import { getApiUrl } from '../../utils/apiBaseUrl';
import * as fcl from '@onflow/fcl';

// Pin configurations by location
const PIN_CONFIGS: Record<string, {
  name: string;
  tiers: Record<string, {
    cost: number;
    image: string;
    color: string;
    glow: string;
  }>;
}> = {
  'Paradise Motel': {
    name: 'Paradise Motel Pin',
    tiers: {
      Silver: {
        cost: 250,
        image: 'https://storage.googleapis.com/flunks_public/images/paradise-motel-pin-silver.png',
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.6)',
      },
      Gold: {
        cost: 500,
        image: 'https://storage.googleapis.com/flunks_public/images/paradise-motel-pin-gold.png',
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.6)',
      },
      Special: {
        cost: 1000,
        image: 'https://storage.googleapis.com/flunks_public/images/paradise-motel-pin-special.png',
        color: '#FF00FF',
        glow: 'rgba(255, 0, 255, 0.6)',
      },
    },
  },
  'Arcade': {
    name: 'Flunky Uppy Pin',
    tiers: {
      Silver: {
        cost: 250,
        image: 'https://storage.googleapis.com/flunks_public/images/flunky-uppy-pin-silver.png',
        color: '#C0C0C0',
        glow: 'rgba(192, 192, 192, 0.6)',
      },
      Gold: {
        cost: 500,
        image: 'https://storage.googleapis.com/flunks_public/images/flunky-uppy-pin-gold.png',
        color: '#FFD700',
        glow: 'rgba(255, 215, 0, 0.6)',
      },
      Special: {
        cost: 1000,
        image: 'https://storage.googleapis.com/flunks_public/images/flunky-uppy-pin-special.png',
        color: '#FF00FF',
        glow: 'rgba(255, 0, 255, 0.6)',
      },
    },
  },
};

// Legacy TIERS for backward compatibility - must match API tiers
const TIERS = PIN_CONFIGS['Paradise Motel'].tiers;

type TierName = keyof typeof TIERS;

// MP3-based sound effects for special events
const playSound = (soundName: string) => {
  try {
    console.log(`🔊 Playing sound: ${soundName}`);
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.volume = 0.5;
    audio.play()
      .then(() => console.log(`🔊 Sound ${soundName} started playing`))
      .catch((e) => console.warn(`🔊 Sound ${soundName} failed to play:`, e.message));
  } catch (e) {
    console.warn(`🔊 Sound ${soundName} error:`, e);
  }
};

// Mario-style power-up sound (NES mushroom sound) using Web Audio API
const playMarioPowerUp = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // The classic NES Mario power-up is a rapid ascending arpeggio
    // Notes: E5, G5, C6, E6, G6, E6, G6 played very quickly
    const notes = [659, 784, 1047, 1319, 1568, 1319, 1568]; // Frequencies
    const noteDuration = 0.06; // Each note is very short
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'square'; // NES used square waves
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      const startTime = audioContext.currentTime + (i * noteDuration);
      oscillator.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.15, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + noteDuration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
    });
  } catch (e) {
    // Ignore audio errors
  }
};

// Retro synth sound effects using Web Audio API (same as MyPlace)
const playRetroSound = (type: 'hover' | 'select' | 'error') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'hover') {
      // Quick ascending beep (same as MyPlace hover)
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(660, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'select') {
      // Selection sound - three ascending tones (same as MyPlace select)
      oscillator.frequency.setValueAtTime(523, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else if (type === 'error') {
      // Error sound - descending buzz
      oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  } catch (e) {
    // Ignore audio errors
  }
};

// Animations
const arcadeBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const glowPulse = keyframes`
  0%, 100% { 
    box-shadow: 0 0 10px currentColor, 0 0 20px currentColor;
  }
  50% { 
    box-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
  }
`;

const evolveAnimation = keyframes`
  0% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }
  25% {
    transform: scale(1.2) rotate(10deg);
    filter: brightness(1.5) hue-rotate(30deg);
  }
  50% {
    transform: scale(0.8) rotate(-10deg);
    filter: brightness(2) hue-rotate(60deg);
  }
  75% {
    transform: scale(1.3) rotate(5deg);
    filter: brightness(1.8) hue-rotate(90deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    filter: brightness(1);
  }
`;

// Styled Components
const Container = styled.div`
  padding: 20px;
  background: 
    linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px),
    #000000;
  background-size: 4px 4px;
  min-height: 100%;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const ArcadeFrame = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  border: 6px solid #ff0000;
  border-radius: 20px;
  background: #000000;
  box-shadow: 
    0 0 0 3px #ffff00,
    0 0 0 6px #00ff00,
    0 0 30px rgba(255, 0, 255, 0.5),
    inset 0 0 50px rgba(0, 255, 255, 0.1);
  padding: 20px;
  
  @media (max-width: 480px) {
    border-width: 3px;
    border-radius: 12px;
    padding: 12px;
    box-shadow: 
      0 0 0 2px #ffff00,
      0 0 0 4px #00ff00,
      0 0 15px rgba(255, 0, 255, 0.5);
  }
`;

const Title = styled.h1`
  text-align: center;
  font-size: 28px;
  color: #ffff00;
  text-shadow: 
    3px 3px 0 #ff0000,
    6px 6px 0 #ff00ff;
  margin-bottom: 5px;
  letter-spacing: 3px;
  animation: ${arcadeBlink} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 22px;
    letter-spacing: 2px;
  }
  
  @media (max-width: 380px) {
    font-size: 18px;
    letter-spacing: 1px;
    text-shadow: 
      2px 2px 0 #ff0000,
      4px 4px 0 #ff00ff;
  }
`;

const Subtitle = styled.div`
  text-align: center;
  color: #00ff00;
  font-size: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 15px;
  }
`;

const GumDisplay = styled.div`
  text-align: center;
  background: rgba(255, 0, 255, 0.2);
  border: 3px solid #ff00ff;
  border-radius: 10px;
  padding: 10px 20px;
  margin-bottom: 20px;
  font-size: 16px;
  color: #ffff00;
  
  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 14px;
    border-width: 2px;
    margin-bottom: 15px;
  }
  
  span {
    color: #00ff00;
    font-weight: bold;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 15px;
  }
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  font-family: inherit;
  font-size: 12px;
  background: ${props => props.active ? '#ff00ff' : '#000000'};
  color: ${props => props.active ? '#ffff00' : '#00ff00'};
  border: 3px solid ${props => props.active ? '#ffff00' : '#00ff00'};
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
  
  @media (max-width: 480px) {
    padding: 12px 16px;
    font-size: 14px;
    min-height: 44px;
  }
  
  &:hover {
    background: #ff00ff;
    color: #ffff00;
    border-color: #ffff00;
  }
`;

const Section = styled.div`
  background: rgba(0, 255, 255, 0.1);
  border: 4px solid #00ffff;
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    border-width: 2px;
    border-radius: 10px;
    padding: 12px;
    margin-bottom: 15px;
  }
`;

const SectionTitle = styled.h2`
  color: #ff00ff;
  font-size: 16px;
  margin-bottom: 15px;
  text-align: center;
  text-shadow: 2px 2px 0 #00ffff;
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 12px;
  }
`;

const NFTGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  
  @media (max-width: 320px) {
    grid-template-columns: 1fr;
  }
`;

const NFTCard = styled.div<{ selected?: boolean; evolving?: boolean }>`
  background: rgba(0, 0, 0, 0.8);
  border: 4px solid ${props => props.selected ? '#ffff00' : '#00ff00'};
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  @media (max-width: 480px) {
    border-width: 3px;
    border-radius: 8px;
    padding: 8px;
  }
  
  ${props => props.selected && css`
    box-shadow: 0 0 20px #ffff00, 0 0 40px #ff00ff;
  `}
  
  ${props => props.evolving && css`
    animation: ${evolveAnimation} 2s ease-in-out infinite;
  `}
  
  &:hover {
    transform: scale(1.05);
    border-color: #ff00ff;
  }
  
  @media (hover: none) {
    &:hover {
      transform: none;
    }
    &:active {
      transform: scale(0.98);
    }
  }
  
  img {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 8px;
    
    @media (max-width: 480px) {
      border-radius: 6px;
      margin-bottom: 6px;
    }
  }
`;

const NFTLabel = styled.div`
  font-size: 10px;
  color: #00ff00;
  text-align: center;
  word-break: break-word;
  
  strong {
    color: #ffff00;
    display: block;
    margin-bottom: 3px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    font-size: 9px;
    
    strong {
      font-size: 10px;
      margin-bottom: 2px;
    }
  }
`;

const TierGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const TierCard = styled.div<{ tierColor: string; disabled?: boolean; selected?: boolean }>`
  background: rgba(0, 0, 0, 0.9);
  border: 4px solid ${props => props.tierColor};
  border-radius: 15px;
  padding: 15px;
  text-align: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: all 0.3s ease;
  color: ${props => props.tierColor};
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  @media (max-width: 480px) {
    border-width: 3px;
    border-radius: 10px;
    padding: 12px;
  }
  
  ${props => props.selected && css`
    animation: ${glowPulse} 1.5s ease-in-out infinite;
    transform: scale(1.05);
  `}
  
  ${props => !props.disabled && !props.selected && css`
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 30px ${props.tierColor};
    }
    
    @media (hover: none) {
      &:hover {
        transform: none;
        box-shadow: none;
      }
      &:active {
        transform: scale(0.98);
      }
    }
  `}
`;

const TierName = styled.div`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  text-shadow: 2px 2px 0 #000;
  
  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 8px;
  }
`;

const TierCost = styled.div`
  font-size: 24px;
  margin-bottom: 10px;
  
  span {
    font-size: 14px;
  }
  
  @media (max-width: 480px) {
    font-size: 22px;
    margin-bottom: 8px;
    
    span {
      font-size: 12px;
    }
  }
`;

const TierImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 10px auto;
  display: block;
  
  @media (max-width: 480px) {
    width: 60px;
    height: 60px;
    margin: 8px auto;
  }
`;

const EvolveButton = styled.button<{ disabled?: boolean }>`
  width: 100%;
  padding: 15px;
  font-family: inherit;
  font-size: 16px;
  background: ${props => props.disabled ? '#333' : '#ff0000'};
  color: #ffff00;
  border: 4px solid ${props => props.disabled ? '#666' : '#ffff00'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  margin-top: 20px;
  text-shadow: 2px 2px 0 #ff00ff;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  min-height: 56px;
  
  @media (max-width: 480px) {
    padding: 16px;
    font-size: 14px;
    border-width: 3px;
    margin-top: 15px;
    min-height: 52px;
  }
  
  ${props => !props.disabled && css`
    &:hover {
      background: #ff00ff;
      transform: scale(1.02);
      box-shadow: 0 0 40px #ff00ff;
    }
    
    @media (hover: none) {
      &:hover {
        background: #ff0000;
        transform: none;
        box-shadow: none;
      }
      &:active {
        background: #ff00ff;
        transform: scale(0.98);
      }
    }
  `}
`;

const Message = styled.div<{ type?: 'error' | 'success' | 'info' }>`
  text-align: center;
  padding: 15px;
  margin: 15px 0;
  border-radius: 10px;
  font-size: 14px;
  word-break: break-word;
  
  @media (max-width: 480px) {
    padding: 12px;
    margin: 12px 0;
    font-size: 12px;
    border-radius: 8px;
  }
  
  ${props => props.type === 'error' && css`
    background: rgba(255, 0, 0, 0.2);
    border: 2px solid #ff0000;
    color: #ff6666;
  `}
  
  ${props => props.type === 'success' && css`
    background: rgba(0, 255, 0, 0.2);
    border: 2px solid #00ff00;
    color: #00ff00;
  `}
  
  ${props => props.type === 'info' && css`
    background: rgba(0, 255, 255, 0.2);
    border: 2px solid #00ffff;
    color: #00ffff;
  `}
`;

const EvolvedDisplay = styled.div`
  text-align: center;
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 12px;
    /* Ensure the evolved display is always visible on mobile */
    position: sticky;
    top: 0;
    z-index: 10;
    background: #000000;
    border: 3px solid #ffff00;
    border-radius: 10px;
    margin-bottom: 15px;
    box-shadow: 0 4px 20px rgba(255, 255, 0, 0.5);
  }
  
  img {
    max-width: 200px;
    width: 100%;
    border: 4px solid #ffff00;
    border-radius: 15px;
    box-shadow: 0 0 30px #ffff00, 0 0 60px #ff00ff;
    margin-bottom: 15px;
    animation: ${evolveAnimation} 2s ease-in-out;
    
    @media (max-width: 480px) {
      max-width: 160px;
      border-width: 3px;
      border-radius: 10px;
      margin-bottom: 10px;
    }
  }
  
  h3 {
    color: #ffff00;
    font-size: 20px;
    margin-bottom: 10px;
    animation: ${arcadeBlink} 1.5s ease-in-out infinite;
    
    @media (max-width: 480px) {
      font-size: 16px;
      margin-bottom: 8px;
    }
  }
  
  a {
    color: #00ffff;
    text-decoration: none;
    font-size: 12px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 40px;
  color: #00ff00;
  font-size: 14px;
  
  &::before {
    content: '⏳';
    display: block;
    font-size: 32px;
    margin-bottom: 10px;
    animation: ${arcadeBlink} 0.5s ease-in-out infinite;
  }
  
  @media (max-width: 480px) {
    padding: 30px;
    font-size: 12px;
    
    &::before {
      font-size: 28px;
      margin-bottom: 8px;
    }
  }
`;

const ConnectPrompt = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #ff00ff;
  
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
    color: #ffff00;
  }
  
  p {
    font-size: 14px;
    color: #00ff00;
  }
  
  @media (max-width: 480px) {
    padding: 40px 15px;
    
    h2 {
      font-size: 20px;
      margin-bottom: 15px;
    }
    
    p {
      font-size: 12px;
    }
  }
`;

// Main Component
const LevelUp: React.FC = () => {
  console.log('🎮 LevelUp: Component mounting...');
  
  const { address } = useUnifiedWallet();
  const { balance, refreshBalance } = useGum();
  
  console.log('🎮 LevelUp: Got address from context:', address);
  
  const [activeTab, setActiveTab] = useState<'evolve' | 'collection'>('evolve');
  const [nfts, setNfts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<any | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierName | null>(null);
  const [evolving, setEvolving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' | 'info' } | null>(null);
  const [evolvedResult, setEvolvedResult] = useState<any | null>(null);

  // Fetch NFTs from wallet
  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) {
        setNfts([]);
        setLoading(false);
        return;
      }

      console.log('🎮 LevelUp: Fetching NFTs for address:', address);

      try {
        setLoading(true);
        const result = await fcl.query({
          cadence: `
            import SemesterZeroV3 from 0xce9dd43888d99574
            import MetadataViews from 0x1d7e57aa55817448

              access(all) fun main(address: Address): [NFTData] {
              let account = getAccount(address)
              
              let collectionRef = account.capabilities
                .borrow<&SemesterZeroV3.Collection>(/public/SemesterZeroV3Collection)
              
              if collectionRef == nil {
                return []
              }
              
              let collection = collectionRef!
              let ids = collection.getIDs()
              let nftData: [NFTData] = []
              
              for id in ids {
                if let nft = collection.borrowSemesterZeroNFT(id: id) {
                  // Get Display view for name and image
                  var name = "Paradise Motel Pin"
                  var image = ""
                  
                  if let display = nft.resolveView(Type<MetadataViews.Display>()) {
                    let displayView = display as! MetadataViews.Display
                    name = displayView.name
                    if let httpFile = displayView.thumbnail as? MetadataViews.HTTPFile {
                      image = httpFile.url
                    }
                  }
                  
                  // Get tier directly from NFT resource
                  let tier = nft.evolutionTier
                  let isEvolved = tier != "Base"
                  
                  // Get location from NFT resource
                  let location = nft.location
                  
                  // Get serial number
                  var serialNumber: UInt64 = 0
                  if let serial = nft.resolveView(Type<MetadataViews.Serial>()) {
                    let serialView = serial as! MetadataViews.Serial
                    serialNumber = serialView.number
                  }
                  
                  nftData.append(NFTData(
                    id: id,
                    name: name,
                    image: image,
                    serialNumber: serialNumber,
                    revealed: isEvolved,
                    tier: tier,
                    location: location
                  ))
                }
              }
              
              return nftData
            }            access(all) struct NFTData {
              access(all) let id: UInt64
              access(all) let name: String
              access(all) let image: String
              access(all) let serialNumber: UInt64
              access(all) let revealed: Bool
              access(all) let tier: String
              access(all) let location: String

              init(id: UInt64, name: String, image: String, serialNumber: UInt64, revealed: Bool, tier: String, location: String) {
                self.id = id
                self.name = name
                self.image = image
                self.serialNumber = serialNumber
                self.revealed = revealed
                self.tier = tier
                self.location = location
              }
            }
          `,
          args: (arg: any, t: any) => [arg(address, t.Address)]
        });

        console.log('🎮 LevelUp: Fetched NFTs:', result?.length || 0);
        setNfts(result || []);
      } catch (error: any) {
        console.error('Error fetching NFTs:', error);
        console.error('Error fetching NFTs - address was:', address);
        console.error('Error details:', JSON.stringify(error, null, 2));
        setNfts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [address]);

  // Filter NFTs
  const unrevealedNFTs = nfts.filter(nft => !nft.revealed);
  const revealedNFTs = nfts.filter(nft => nft.revealed);

  // Handle evolution
  const handleEvolve = async () => {
    if (!selectedNFT || !selectedTier) return;
    if (!address) return;

    // Get the pin config based on NFT location
    const nftLocation = selectedNFT.location || 'Paradise Motel';
    const pinConfig = PIN_CONFIGS[nftLocation] || PIN_CONFIGS['Paradise Motel'];
    const tierConfig = pinConfig.tiers[selectedTier];
    
    if (!tierConfig) {
      setMessage({ text: `Invalid tier for ${pinConfig.name}`, type: 'error' });
      return;
    }
    
    if (balance < tierConfig.cost) {
      setMessage({ text: `Insufficient GUM! You need ${tierConfig.cost} but have ${balance}.`, type: 'error' });
      return;
    }

    setEvolving(true);
    setMessage({ text: 'Evolving your NFT... Please wait...', type: 'info' });
    setEvolvedResult(null);
    
    // Play Mario power-up sound when evolution starts
    playSound('powerup');

    console.log('🎮 Starting evolution with:', { walletAddress: address, nftId: selectedNFT.id, tier: selectedTier });

    try {
      const apiUrl = getApiUrl('/api/level-up');
      console.log('🎮 Calling API:', apiUrl);
      
      let response;
      try {
        response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: address,
            nftId: selectedNFT.id,
            tier: selectedTier,
          }),
        });
        console.log('🎮 Response status:', response.status, response.statusText);
      } catch (fetchError: any) {
        console.error('🎮 Fetch error (CORS/Network):', fetchError?.message || 'Network error');
        throw new Error(`Network error: ${fetchError?.message || 'Unable to reach server. Check network connection.'}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🎮 API error response:', response.status, errorText);
        throw new Error(`Server error ${response.status}: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      console.log('🎮 Evolution API response:', result);

      if (result.success) {
        setMessage({ text: `🎉 Successfully evolved to ${selectedTier}!`, type: 'success' });
        playSound('reveal'); // Play reveal sound on successful evolution
        setEvolvedResult({
          tier: selectedTier,
          image: tierConfig.image,
          transactionId: result.transactionId,
          explorerUrl: result.explorerUrl,
        });
        
        // Scroll to top on mobile to show the evolved result
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        
        // Refresh GUM balance
        refreshBalance();
        
        // Refresh NFT list after a delay
        setTimeout(async () => {
          const updatedNFTs = await fcl.query({
            cadence: `
              import SemesterZeroV3 from 0xce9dd43888d99574
              import MetadataViews from 0x1d7e57aa55817448

              access(all) fun main(address: Address): [NFTData] {
                let account = getAccount(address)
                
                let collectionRef = account.capabilities
                  .borrow<&SemesterZeroV3.Collection>(/public/SemesterZeroV3Collection)
                
                if collectionRef == nil {
                  return []
                }
                
                let collection = collectionRef!
                let ids = collection.getIDs()
                let nftData: [NFTData] = []
                
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
                    let isEvolved = tier != "Base"
                    
                    var serialNumber: UInt64 = 0
                    if let serial = nft.resolveView(Type<MetadataViews.Serial>()) {
                      let serialView = serial as! MetadataViews.Serial
                      serialNumber = serialView.number
                    }
                    
                    nftData.append(NFTData(
                      id: id,
                      name: name,
                      image: image,
                      serialNumber: serialNumber,
                      revealed: isEvolved,
                      tier: tier
                    ))
                  }
                }
                
                return nftData
              }

              access(all) struct NFTData {
                access(all) let id: UInt64
                access(all) let name: String
                access(all) let image: String
                access(all) let serialNumber: UInt64
                access(all) let revealed: Bool
                access(all) let tier: String

                init(id: UInt64, name: String, image: String, serialNumber: UInt64, revealed: Bool, tier: String) {
                  self.id = id
                  self.name = name
                  self.image = image
                  self.serialNumber = serialNumber
                  self.revealed = revealed
                  self.tier = tier
                }
              }
            `,
            args: (arg: any, t: any) => [arg(address, t.Address)]
          });
          setNfts(updatedNFTs || []);
        }, 3000);
        
        setSelectedNFT(null);
        setSelectedTier(null);
      } else {
        playSound('error');
        setMessage({ text: result.error || 'Evolution failed', type: 'error' });
      }
    } catch (error: any) {
      playSound('error');
      console.error('Evolution error:', error);
      // Show more detailed error message
      const errorMessage = error?.message || error?.toString() || 'Evolution failed';
      console.error('Evolution error details:', JSON.stringify(error, null, 2));
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setEvolving(false);
    }
  };

  // Render - always show the app (demo mode when not connected)
  return (
    <Container>
      <ArcadeFrame>
        <Title>⚡ LEVEL UP ⚡</Title>
        <Subtitle>◆ EVOLVE YOUR PARADISE MOTEL PINS ◆</Subtitle>

        {!address && (
          <ConnectPrompt>
            <h2>🔌 CONNECT WALLET</h2>
            <p>Connect your wallet to view and evolve your Paradise Motel Pins</p>
          </ConnectPrompt>
        )}

        {address && (
          <GumDisplay>
            🍬 YOUR GUM: <span>{balance.toLocaleString()}</span>
          </GumDisplay>
        )}

        {address && (
          <>
            <TabContainer>
              <TabButton active={activeTab === 'evolve'} onClick={() => setActiveTab('evolve')}>
                🔮 EVOLVE
              </TabButton>
              <TabButton active={activeTab === 'collection'} onClick={() => setActiveTab('collection')}>
                📦 COLLECTION
              </TabButton>
            </TabContainer>

            {loading ? (
              <LoadingSpinner>Loading NFTs...</LoadingSpinner>
            ) : activeTab === 'evolve' ? (
          <>
            {/* Evolved Result Display */}
            {evolvedResult && (
              <Section>
                <EvolvedDisplay>
                  <img src={evolvedResult.image} alt={evolvedResult.tier} />
                  <h3>✨ Evolution Complete! ✨</h3>
                  <p style={{ color: '#00ff00', marginBottom: '10px' }}>
                    Your pin evolved to {evolvedResult.tier}!
                  </p>
                  <a href={evolvedResult.explorerUrl} target="_blank" rel="noopener noreferrer">
                    View on FlowScan →
                  </a>
                </EvolvedDisplay>
              </Section>
            )}

            {/* Select NFT Section */}
            <Section>
              <SectionTitle>🎯 SELECT NFT TO EVOLVE</SectionTitle>
              
              {unrevealedNFTs.length === 0 ? (
                <Message type="info">
                  No unrevealed pins to evolve.
                  {nfts.length > 0 ? ' All your pins have been evolved!' : ' Complete Chapter 5 to earn one!'}
                </Message>
              ) : (
                <NFTGrid>
                  {unrevealedNFTs.map((nft) => (
                    <NFTCard
                      key={nft.id}
                      selected={selectedNFT?.id === nft.id}
                      evolving={evolving && selectedNFT?.id === nft.id}
                      onMouseEnter={() => playRetroSound('hover')}
                      onClick={() => {
                        console.log('🎮 NFTCard clicked:', nft.id, nft.name, 'evolving:', evolving);
                        if (!evolving) {
                          playRetroSound('select');
                          setSelectedNFT(nft);
                          console.log('🎮 Selected NFT:', nft.id);
                        }
                      }}
                    >
                      <img src={nft.image || 'https://storage.googleapis.com/flunks_public/images/capsule.png'} alt={nft.name} />
                      <NFTLabel>
                        <strong>{nft.name}</strong>
                        #{nft.serialNumber} • 🔒 Unrevealed
                      </NFTLabel>
                    </NFTCard>
                  ))}
                </NFTGrid>
              )}
            </Section>

            {/* Tier Selection */}
            {selectedNFT && (
              <Section>
                <SectionTitle>⚡ CHOOSE YOUR TIER</SectionTitle>
                
                <TierGrid>
                  {(() => {
                    // Get the pin config based on selected NFT's location
                    const nftLocation = selectedNFT.location || 'Paradise Motel';
                    const pinConfig = PIN_CONFIGS[nftLocation] || PIN_CONFIGS['Paradise Motel'];
                    const tiers = pinConfig.tiers;
                    
                    return (Object.entries(tiers) as [TierName, typeof tiers[TierName]][]).map(([tierName, tierConfig]) => (
                    <TierCard
                      key={tierName}
                      tierColor={tierConfig.color}
                      disabled={balance < tierConfig.cost}
                      selected={selectedTier === tierName}
                      onMouseEnter={() => playRetroSound('hover')}
                      onClick={() => {
                        console.log('🎮 TierCard clicked:', tierName, 'balance:', balance, 'cost:', tierConfig.cost, 'evolving:', evolving);
                        if (balance >= tierConfig.cost && !evolving) {
                          playRetroSound('select');
                          setSelectedTier(tierName);
                          console.log('🎮 Selected tier:', tierName);
                        } else if (balance < tierConfig.cost) {
                          playRetroSound('error');
                          console.log('🎮 Insufficient GUM for tier:', tierName);
                        }
                      }}
                    >
                      <TierName>{tierName}</TierName>
                      <TierImage src={tierConfig.image} alt={tierName} />
                      <TierCost>
                        {tierConfig.cost} <span>GUM</span>
                      </TierCost>
                      {balance < tierConfig.cost && (
                        <div style={{ fontSize: '10px', color: '#ff6666', marginTop: '5px' }}>
                          Need {(tierConfig.cost - balance).toLocaleString()} more GUM
                        </div>
                      )}
                    </TierCard>
                    ));
                  })()}
                </TierGrid>

                {message && <Message type={message.type}>{message.text}</Message>}

                <EvolveButton
                  disabled={!selectedTier || evolving}
                  onClick={handleEvolve}
                >
                  {evolving ? '⚡ EVOLVING... ⚡' : selectedTier ? `EVOLVE TO ${selectedTier.toUpperCase()}!` : 'SELECT A TIER'}
                </EvolveButton>
              </Section>
            )}
          </>
        ) : (
          /* Collection Tab */
          <Section>
            <SectionTitle>📦 YOUR EVOLVED PINS</SectionTitle>
            
            {revealedNFTs.length === 0 ? (
              <Message type="info">
                No evolved pins yet. Evolve your first one in the EVOLVE tab!
              </Message>
            ) : (
              <NFTGrid>
                {revealedNFTs.map((nft) => (
                  <NFTCard key={nft.id}>
                    <img src={nft.image} alt={nft.name} />
                    <NFTLabel>
                      <strong>{nft.name}</strong>
                      #{nft.serialNumber} • {nft.tier || 'Evolved'}
                    </NFTLabel>
                  </NFTCard>
                ))}
              </NFTGrid>
            )}
          </Section>
        )}
          </>
        )}

        {address && (
          <div style={{ 
            marginTop: '20px', 
            textAlign: 'center', 
            fontSize: '10px', 
            color: '#666',
            padding: '0 10px',
            wordBreak: 'break-all'
          }}>
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        )}
      </ArcadeFrame>
    </Container>
  );
};

export default LevelUp;
