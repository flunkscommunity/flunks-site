import React, { useState } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button, GroupBox } from 'react95';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';
import { CliqueAccessPanel } from '../components/CliqueAccess/CliqueAccessPanel';
import { useCliqueAccess } from '../hooks/useCliqueAccess';
import { useWindowsContext } from '../contexts/WindowsContext';

const ManualContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', sans-serif;
`;

const CoverPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  background: 
    linear-gradient(135deg, #8B7355 0%, #A0824A 25%, #8B7355 50%, #D2B48C 75%, #8B7355 100%),
    radial-gradient(circle at 30% 40%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 60%, rgba(160, 82, 45, 0.2) 0%, transparent 40%);
  border: 4px solid #654321;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    inset 0 0 50px rgba(0,0,0,0.2),
    0 4px 15px rgba(0,0,0,0.3);
  
  /* Aged paper texture */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 10% 20%, rgba(101, 67, 33, 0.1) 1px, transparent 2px),
      radial-gradient(circle at 90% 80%, rgba(139, 69, 19, 0.1) 1px, transparent 2px),
      radial-gradient(circle at 50% 50%, rgba(160, 82, 45, 0.05) 2px, transparent 3px);
    background-size: 30px 30px, 25px 25px, 40px 40px;
    opacity: 0.6;
    z-index: 1;
  }
  
  /* Wear and tear effects */
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: 
      linear-gradient(45deg, transparent 20%, rgba(101, 67, 33, 0.3) 21%, rgba(101, 67, 33, 0.3) 23%, transparent 24%),
      linear-gradient(-45deg, transparent 76%, rgba(139, 69, 19, 0.3) 77%, rgba(139, 69, 19, 0.3) 79%, transparent 80%);
    border-radius: 10px;
    z-index: 0;
  }
`;

const CoverTitle = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color: #FFD700;
  text-shadow: 
    3px 3px 0px #8B4513,
    4px 4px 0px #654321,
    5px 5px 10px rgba(0,0,0,0.5);
  margin: 20px 0;
  letter-spacing: 4px;
  z-index: 1;
`;

const CoverSubtitle = styled.h2`
  font-size: 24px;
  color: #FF6B35;
  text-shadow: 2px 2px 0px #8B4513;
  margin: 10px 0;
  z-index: 1;
`;

const SystemBadge = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: #FFD700;
  color: #8B4513;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  border: 2px solid #8B4513;
  z-index: 1;
`;

const RatingBadge = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: #000;
  color: #FFD700;
  padding: 8px;
  border-radius: 4px;
  font-weight: bold;
  border: 2px solid #FFD700;
  text-align: center;
  z-index: 1;
  
  .rating {
    font-size: 24px;
    display: block;
  }
  
  .ages {
    font-size: 10px;
    display: block;
  }
`;

const PageContent = styled.div`
  padding: 20px;
  height: 500px;
  overflow-y: auto;
  background: #f0f0f0;
  border: 2px inset #c0c0c0;
  font-size: 12px;
  line-height: 1.6;
`;

const PageHeader = styled.h2`
  color: #000080;
  border-bottom: 2px solid #000080;
  padding-bottom: 5px;
  margin-bottom: 15px;
  font-size: 16px;
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #c0c0c0;
  border-top: 1px solid #808080;
`;

const PageNumber = styled.span`
  font-weight: bold;
  color: #000080;
`;

const TOCItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 5px 0;
  border-bottom: 1px dotted #808080;
  cursor: pointer;
  
  &:hover {
    background: #e0e0e0;
  }
`;

const Screenshot = styled.div`
  border: 2px inset #c0c0c0;
  padding: 10px;
  margin: 10px 0;
  background: #000;
  color: #00ff00;
  font-family: monospace;
  font-size: 10px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const pages = [
  {
    title: "Cover",
    content: "cover"
  },
  {
    title: "Table of Contents",
    content: "toc"
  },
  {
    title: "Getting Started",
    content: "getting-started"
  },
  {
    title: "Clique Houses & Access",
    content: "clique-access"
  },
  {
    title: "School Navigation",
    content: "navigation"
  },
  {
    title: "NFT Collection Guide",
    content: "nft-guide"
  },
  {
    title: "Radio System",
    content: "radio"
  },
  {
    title: "Troubleshooting",
    content: "troubleshooting"
  }
];

interface GameManualWindowProps {
  isOpen: boolean;
  onClose: () => void;
}

const GameManualWindow: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const { hasAccess, getUserCliques } = useCliqueAccess();
  const { closeWindow } = useWindowsContext();

  const renderPageContent = () => {
    const page = pages[currentPage];
    
    switch (page.content) {
      case "cover":
        return (
          <CoverPage>
            {/* Nintendo-style cover recreation */}
            <CoverTitle style={{ zIndex: 2 }}>FLUNKS</CoverTitle>
            
            {/* School and arcade buildings illustration */}
            <div style={{
              position: 'absolute',
              top: '120px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 2,
              fontSize: '12px',
              color: '#8B4513',
              textAlign: 'center',
              fontWeight: 'bold'
            }}>
              🏫 SCHOOL 🎮 ARCADE 🌳
              <br />
              🚍 [POLICE LINE DO NOT CROSS] 🚍
              <br />
              <div style={{ 
                fontSize: '24px', 
                margin: '10px 0',
                color: '#FF6B35',
                textShadow: '2px 2px 0px #8B4513'
              }}>
                👤 STUDENT CHARACTER
              </div>
            </div>
            
            <CoverSubtitle style={{ 
              position: 'absolute', 
              bottom: '80px', 
              zIndex: 2,
              fontSize: '18px'
            }}>
              GAME MANUAL
            </CoverSubtitle>
            
            <SystemBadge style={{ zIndex: 2 }}>
              FLOW BLOCKCHAIN
            </SystemBadge>
            
            <RatingBadge style={{ zIndex: 2 }}>
              <span className="rating">KA</span>
              <span className="ages">KIDS TO ADULTS</span>
            </RatingBadge>
            
            {/* Nintendo branding */}
            <div style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#FF6B35',
              fontSize: '10px',
              fontWeight: 'bold',
              textAlign: 'center',
              zIndex: 2,
              textShadow: '1px 1px 0px #8B4513'
            }}>
              SUPER NINTENDO®<br />
              ENTERTAINMENT SYSTEM
            </div>
          </CoverPage>
        );
        
      case "toc":
        return (
          <PageContent>
            <PageHeader>📚 Table of Contents</PageHeader>
            {pages.slice(2).map((page, index) => (
              <TOCItem key={index} onClick={() => setCurrentPage(index + 2)}>
                <span>{page.title}</span>
                <span>{index + 3}</span>
              </TOCItem>
            ))}
            <div style={{ marginTop: 20, padding: 10, background: '#ffffcc', border: '1px solid #cccc00' }}>
              <strong>💡 Quick Start:</strong> New to Flunks High School? Start with "Getting Started" to connect your wallet and begin your journey!
            </div>
          </PageContent>
        );
        
      case "getting-started":
        return (
          <PageContent>
            <PageHeader>🚀 Getting Started</PageHeader>
            <h3>Welcome to Flunks High School!</h3>
            <p>This manual will guide you through all the features and systems in your virtual high school experience.</p>
            
            <h4>Step 1: Connect Your Wallet</h4>
            <p>To access exclusive areas and features, you'll need to connect a Flow blockchain wallet containing Flunks NFTs.</p>
            <Screenshot>[WALLET CONNECTION SCREEN]</Screenshot>
            
            <h4>Step 2: Explore the Campus</h4>
            <p>Navigate through different areas of the school including:</p>
            <ul>
              <li>🏫 Main School Building</li>
              <li>🏠 Clique Houses (Access Required)</li>
              <li>🎮 Arcade</li>
              <li>📻 Radio Station</li>
              <li>🌳 Treehouse</li>
            </ul>
            
            <h4>Step 3: Check Your Access</h4>
            <p>See Chapter 4 for detailed information about clique-based access controls and how to unlock exclusive areas.</p>
          </PageContent>
        );
        
      case "clique-access":
        return (
          <PageContent>
            <PageHeader>🏠 Clique Houses & Access Privileges</PageHeader>
            <p>Flunks High School features exclusive clique houses that require specific NFT ownership for access.</p>
            
            <h3>🎯 How It Works</h3>
            <p>Each clique house requires you to own an NFT with the corresponding clique trait:</p>
            
            <div style={{ margin: '15px 0' }}>
              <strong>🤓 Geek House:</strong> Requires NFT with "GEEK" trait<br/>
              <strong>🏈 Jock House:</strong> Requires NFT with "JOCK" trait<br/>
              <strong>💅 Prep House:</strong> Requires NFT with "PREP" trait<br/>
              <strong>🖤 Freak House:</strong> Requires NFT with "FREAK" trait
            </div>
            
            <h3>📊 Your Current Access Status</h3>
            <CliqueAccessPanel />
            
            <h3>🎮 Accessing Houses</h3>
            <p>1. Navigate to the Semester Zero map</p>
            <p>2. Double-click on any clique house</p>
            <p>3. If you have access, you'll enter immediately</p>
            <p>4. If not, you'll see information about the required NFT</p>
            
            <Screenshot>[CLIQUE HOUSE ACCESS SCREEN]</Screenshot>
            
            <div style={{ marginTop: 15, padding: 10, background: '#ffeeee', border: '1px solid #cc0000' }}>
              <strong>⚠️ Access Denied?</strong> You need to own an NFT with the corresponding clique trait. Visit the NFT marketplace to collect the required Flunks!
            </div>
          </PageContent>
        );
        
      case "navigation":
        return (
          <PageContent>
            <PageHeader>🗺️ School Navigation</PageHeader>
            <h3>Campus Map Overview</h3>
            <p>The Flunks High School campus is divided into several key areas:</p>
            
            <Screenshot>[CAMPUS MAP LAYOUT]</Screenshot>
            
            <h4>🏫 Main Areas</h4>
            <ul>
              <li><strong>Main Building:</strong> Classrooms, cafeteria, and administrative offices</li>
              <li><strong>Semester Zero:</strong> Special interactive map with clique houses</li>
              <li><strong>Arcade:</strong> Classic games and entertainment</li>
              <li><strong>Treehouse:</strong> Community gathering space</li>
            </ul>
            
            <h4>🏠 Clique Houses (Access Required)</h4>
            <ul>
              <li><strong>Geek House:</strong> Tech lab, coding stations, gaming setup</li>
              <li><strong>Jock House:</strong> Gym equipment, sports memorabilia</li>
              <li><strong>Prep House:</strong> Fashion studio, social lounge</li>
              <li><strong>Freak House:</strong> Art studio, music equipment</li>
            </ul>
            
            <h4>🎮 Navigation Controls</h4>
            <p><strong>Mouse:</strong> Click to interact with objects and areas</p>
            <p><strong>Double-click:</strong> Enter buildings and rooms</p>
            <p><strong>Windows:</strong> Drag to move, resize corners to adjust size</p>
          </PageContent>
        );
        
      case "nft-guide":
        return (
          <PageContent>
            <PageHeader>🎨 NFT Collection Guide</PageHeader>
            <h3>Understanding Flunks NFTs</h3>
            <p>Flunks NFTs are your key to unlocking exclusive content and areas within the school.</p>
            
            <h4>📋 NFT Traits</h4>
            <p>Each Flunks NFT contains various traits including:</p>
            <ul>
              <li><strong>Clique:</strong> GEEK, JOCK, PREP, or FREAK</li>
              <li><strong>Background:</strong> Visual appearance traits</li>
              <li><strong>Accessories:</strong> Special items and clothing</li>
              <li><strong>Rarity:</strong> Common, Uncommon, Rare, Epic, Legendary</li>
            </ul>
            
            <h4>🛒 Where to Get NFTs</h4>
            <p>• Primary marketplace during mint events</p>
            <p>• Secondary markets for trading</p>
            <p>• Community giveaways and contests</p>
            <p>• Special school events and achievements</p>
            
            <h4>💎 NFT Benefits</h4>
            <ul>
              <li>🏠 Access to exclusive clique houses</li>
              <li>🎮 Special games and activities</li>
              <li>🎵 Custom radio station privileges</li>
              <li>🏆 Exclusive content and rewards</li>
              <li>👥 Community recognition and status</li>
            </ul>
            
            <Screenshot>[NFT COLLECTION INTERFACE]</Screenshot>
          </PageContent>
        );
        
      case "radio":
        return (
          <PageContent>
            <PageHeader>📻 Radio System</PageHeader>
            <h3>Flunks FM Radio</h3>
            <p>Enjoy a variety of music stations while exploring the campus!</p>
            
            <h4>🎵 Available Stations</h4>
            <ul>
              <li><strong>Classic Hits:</strong> Nostalgic favorites from the 80s and 90s</li>
              <li><strong>Study Beats:</strong> Lo-fi and ambient music for concentration</li>
              <li><strong>Pump Up:</strong> High-energy tracks for gaming and activities</li>
              <li><strong>Chill Zone:</strong> Relaxed vibes for casual browsing</li>
            </ul>
            
            <h4>🎛️ Radio Controls</h4>
            <p><strong>Play/Pause:</strong> Control playback</p>
            <p><strong>Station Select:</strong> Switch between different channels</p>
            <p><strong>Volume:</strong> Adjust audio level</p>
            <p><strong>Minimize:</strong> Keep music playing while using other apps</p>
            
            <Screenshot>[RADIO PLAYER INTERFACE]</Screenshot>
            
            <div style={{ marginTop: 15, padding: 10, background: '#eeffee', border: '1px solid #00cc00' }}>
              <strong>💡 Pro Tip:</strong> The radio continues playing in the background while you explore different areas of the school!
            </div>
          </PageContent>
        );
        
      case "troubleshooting":
        return (
          <PageContent>
            <PageHeader>🔧 Troubleshooting</PageHeader>
            <h3>Common Issues & Solutions</h3>
            
            <h4>🔌 Wallet Connection Problems</h4>
            <p><strong>Issue:</strong> Cannot connect wallet</p>
            <p><strong>Solution:</strong> Ensure you have a Flow-compatible wallet installed and unlocked</p>
            
            <h4>🏠 Cannot Access Clique Houses</h4>
            <p><strong>Issue:</strong> House appears locked</p>
            <p><strong>Solution:</strong> Verify you own an NFT with the required clique trait</p>
            
            <h4>🎵 Radio Not Playing</h4>
            <p><strong>Issue:</strong> No audio from radio</p>
            <p><strong>Solution:</strong> Check browser audio permissions and volume settings</p>
            
            <h4>🐌 Slow Performance</h4>
            <p><strong>Issue:</strong> Site loading slowly</p>
            <p><strong>Solution:</strong> Clear browser cache, close unnecessary tabs</p>
            
            <h4>📱 Mobile Compatibility</h4>
            <p><strong>Issue:</strong> Features not working on mobile</p>
            <p><strong>Solution:</strong> Desktop browser recommended for full experience</p>
            
            <h3>📞 Getting Help</h3>
            <p>Still having issues? Contact support:</p>
            <ul>
              <li>🐦 Twitter: @FlunksCommunity</li>
              <li>💬 Discord: Join our community server</li>
              <li>📧 Email: support@flunks.community</li>
            </ul>
            
            <Screenshot>[HELP DESK CONTACT INFO]</Screenshot>
          </PageContent>
        );
        
      default:
        return <PageContent>Page not found</PageContent>;
    }
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.GAME_MANUAL}
      onClose={() => closeWindow(WINDOW_IDS.GAME_MANUAL)}
      initialWidth="600px"
      initialHeight="650px"
      headerTitle="Flunks High School - Official Game Manual"
      headerIcon="/images/icons/high-school-icon.png"
    >
      <ManualContainer>
            {renderPageContent()}
            <NavigationBar>
              <Button 
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              >
                ← Previous
              </Button>
              <PageNumber>
                Page {currentPage + 1} of {pages.length}
              </PageNumber>
              <Button 
                disabled={currentPage === pages.length - 1}
                onClick={() => setCurrentPage(Math.min(pages.length - 1, currentPage + 1))}
              >
                Next →
              </Button>
          </NavigationBar>
        </ManualContainer>
      </DraggableResizeableWindow>
    );
  };
  
  export default GameManualWindow;