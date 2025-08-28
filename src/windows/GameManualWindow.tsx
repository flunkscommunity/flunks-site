import React, { useState } from 'react';
import styled from 'styled-components';
import { Window, WindowHeader, WindowContent, Button, GroupBox } from 'react95';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';
import { CliqueAccessPanel } from '../components/CliqueAccess/CliqueAccessPanel';
import { useCliqueAccess } from '../hooks/useCliqueAccess';
import { useWindowsContext } from '../contexts/WindowsContext';
import { getCurrentBuildMode, isFeatureEnabled } from '../utils/buildMode';

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
    title: "Welcome",
    content: "welcome"
  },
  {
    title: "Table of Contents",
    content: "toc"
  },
  {
    title: "Desktop Applications",
    content: "desktop-applications"
  },
  {
    title: "Desktop Applications II",
    content: "desktop-applications-2"
  },
  {
    title: "Desktop Applications III",
    content: "desktop-applications-3"
  },
  {
    title: "Conditional Rendering",
    content: "clique-access"
  },
  {
    title: "Gum System",
    content: "gum-system"
  },
  {
    title: "Terminal Guide",
    content: "terminal"
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
          <div style={{
            width: '100%',
            height: '500px',
            backgroundImage: 'url(/images/page-1.png)',
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Image will be displayed as background */}
          </div>
        );
        
      case "welcome":
        return (
          <div style={{
            width: '100%',
            height: '500px',
            backgroundImage: 'url(/images/backdrops/pixel-static.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'bold'
          }}>
            {/* Main Welcome Message Box */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.95)',
              padding: '30px 50px',
              borderRadius: '15px',
              border: '4px solid #000',
              boxShadow: '6px 6px 0px #FFB3D9',
              maxWidth: '580px',
              width: '90%',
              zIndex: 10
            }}>
              <h1 style={{
                fontSize: window.innerWidth <= 768 ? '24px' : '32px',
                margin: '0 0 8px 0',
                color: '#6366B3',
                textShadow: '2px 2px 0px #FFB3D9',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                lineHeight: '1.1'
              }}>
                Welcome to Semester Zero
              </h1>
              
              <h2 style={{
                fontSize: window.innerWidth <= 768 ? '20px' : '28px',
                margin: '0 0 20px 0',
                color: '#FF8A95',
                textShadow: '2px 2px 0px #000',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Finding Flunko
              </h2>
              
              <div style={{
                fontSize: window.innerWidth <= 768 ? '14px' : '16px',
                color: '#333',
                lineHeight: '1.7',
                marginBottom: '15px',
                fontFamily: 'Georgia, serif',
                fontWeight: '600',
                fontStyle: 'italic',
                textAlign: 'center',
                textShadow: '1px 1px 1px rgba(255, 179, 217, 0.3)'
              }}>
                You did it! You've gotten this far. If you're new, welcome in. If you're an OG, mad respect for sticking around through thick and thin.
              </div>
              
              <div style={{
                fontSize: window.innerWidth <= 768 ? '13px' : '15px',
                color: '#333',
                lineHeight: '1.6',
                marginBottom: '15px',
                fontWeight: 'normal',
                textAlign: 'center'
              }}>
                Semester zero is only the beginning. Sit back and enjoy the ride as we dive into the small town of Arcadia and all the shenanigans that will ensue.
              </div>
              
              <div style={{
                fontSize: '13px',
                color: '#6366B3',
                fontStyle: 'italic',
                fontWeight: 'bold',
                marginTop: '20px'
              }}>
                Turn the page to begin your journey! →
              </div>
            </div>
          </div>
        );
        
      case "toc":
        return (
          <PageContent>
            <PageHeader>📚 Table of Contents</PageHeader>
            {pages.slice(3).map((page, index) => (
              <TOCItem key={index} onClick={() => setCurrentPage(index + 3)}>
                <span>{page.title}</span>
                <span>{index + 4}</span>
              </TOCItem>
            ))}
            <div style={{ marginTop: 20, padding: 10, background: '#ffffcc', border: '1px solid #cccc00' }}>
              <strong>💡 Quick Start:</strong> New to Flunks High School? Start with "Getting Started" to connect your wallet and begin your journey! Try the Terminal 💻 for power-user commands and don't forget the new Gum System 🍬 for earning rewards!
            </div>
          </PageContent>
        );
        
      case "desktop-applications":
        return (
          <PageContent>
            <PageHeader>� Desktop Applications</PageHeader>
            <p style={{ textAlign: 'center', marginBottom: '20px', fontStyle: 'italic' }}>
              Launch these essential apps to explore everything Flunks High School has to offer!
            </p>
            
            {/* OnlyFlunks */}
            <div style={{
              background: 'linear-gradient(135deg, #ff6b9d, #ff8e9b)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(255, 107, 157, 0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/onlyflunks.png" alt="OnlyFlunks" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#fff', 
                  textShadow: '2px 2px 0px #000', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>OnlyFlunks</h3>
                <p style={{ 
                  color: '#fff', 
                  textShadow: '1px 1px 0px #000',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Browse and collect rare student NFTs in the school's exclusive marketplace. 
                  Discover unique traits, trade with other students, and build your collection of digital Flunks characters.
                </p>
              </div>
            </div>

            {/* My Locker */}
            <div style={{
              background: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(78, 205, 196, 0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/locker-icon.png" alt="My Locker" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#fff', 
                  textShadow: '2px 2px 0px #000', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>My Locker</h3>
                <p style={{ 
                  color: '#fff', 
                  textShadow: '1px 1px 0px #000',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Manage your student profile, customize your avatar, and organize your digital items. 
                  Set your username, bio, and showcase your favorite NFTs in your personal locker space.
                </p>
              </div>
            </div>

            {/* Terminal */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(102, 126, 234, 0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/newterminal.png" alt="Terminal" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#fff', 
                  textShadow: '2px 2px 0px #000', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>Terminal</h3>
                <p style={{ 
                  color: '#fff', 
                  textShadow: '1px 1px 0px #000',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Execute powerful system commands and access advanced features through the command-line interface. 
                  Type 'help' to discover available commands and unlock hidden school functions.
                </p>
              </div>
            </div>
            
            <div style={{
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '15px',
              marginTop: '20px',
              textAlign: 'center',
              boxShadow: '3px 3px 0px #000'
            }}>
              <strong style={{ color: '#fff', textShadow: '1px 1px 0px #000', fontSize: '14px' }}>
                💡 Pro Tip: Double-click any desktop icon to launch the application instantly!
              </strong>
            </div>
          </PageContent>
        );
        
      case "desktop-applications-2":
        return (
          <PageContent>
            <PageHeader>💻 Desktop Applications II</PageHeader>
            <p style={{ textAlign: 'center', marginBottom: '25px', fontStyle: 'italic' }}>
              Essential school navigation and information tools!
            </p>
            
            {/* FHS */}
            <div style={{
              background: 'linear-gradient(135deg, #f093fb, #f5576c)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(240, 147, 251, 0.6)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/fhs.png" alt="FHS" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#fff', 
                  textShadow: '2px 2px 0px #000', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>FHS</h3>
                <p style={{ 
                  color: '#fff', 
                  textShadow: '1px 1px 0px #000',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Navigate through the main school building and explore different areas of Flunks High School. 
                  Access classrooms, hallways, the cafeteria, and discover hidden secrets within the campus.
                </p>
              </div>
            </div>

            {/* Game Manual */}
            <div style={{
              background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(255, 236, 210, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/game-manual-icon.png" alt="Game Manual" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>Game Manual</h3>
                <p style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Access comprehensive documentation about all game features, systems, and mechanics. 
                  Learn advanced strategies, troubleshooting tips, and discover Easter eggs hidden throughout the school.
                </p>
              </div>
            </div>

            {/* Radio */}
            <div style={{
              background: 'linear-gradient(135deg, #a8edea, #fed6e3)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(168, 237, 234, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/boom-box.png" alt="Radio" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>Radio</h3>
                <p style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Tune in to various campus radio stations featuring different music genres and DJ personalities. 
                  Enjoy background music while exploring, or discover special radio shows with exclusive content.
                </p>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center',
              boxShadow: '3px 3px 0px #000'
            }}>
              <strong style={{ color: '#fff', textShadow: '1px 1px 0px #000', fontSize: '14px' }}>
                💡 Pro Tip: Each app offers unique features to enhance your Flunks High School experience!
              </strong>
            </div>
          </PageContent>
        );
        
      case "desktop-applications-3":
        return (
          <PageContent>
            <PageHeader>💻 Desktop Applications III</PageHeader>
            <p style={{ textAlign: 'center', marginBottom: '25px', fontStyle: 'italic' }}>
              Communication, tracking, and information apps!
            </p>
            
            {/* Chat Rooms */}
            <div style={{
              background: 'linear-gradient(135deg, #ff9a9e, #fecfef)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(255, 154, 158, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/chat-rooms.png" alt="Chat Rooms" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>Chat Rooms</h3>
                <p style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Connect and chat with other students in real-time messaging rooms. 
                  Join different conversation topics, make friends, and participate in the school's social community.
                </p>
              </div>
            </div>

            {/* Report Card */}
            <div style={{
              background: 'linear-gradient(135deg, #a18cd1, #fbc2eb)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(161, 140, 209, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/report-card.png" alt="Report Card" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>Report Card</h3>
                <p style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  View your academic achievements, progress tracking, and performance statistics. 
                  Monitor your completion rates for various activities and earn recognition for your accomplishments.
                </p>
              </div>
            </div>

            {/* Bulletin Board */}
            <div style={{
              background: 'linear-gradient(135deg, #ffecd2, #fcb69f)',
              border: '3px solid #333',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '25px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '25px',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '6px 6px 0px #000, 0 0 20px rgba(255, 236, 210, 0.8)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '4px 4px 0px #000';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              <div style={{ 
                minWidth: '60px',
                textAlign: 'center'
              }}>
                <img src="/images/icons/bulletin-board-icon.png" alt="Bulletin Board" style={{ width: '48px', height: '48px' }} />
              </div>
              <div>
                <h3 style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff', 
                  margin: '0 0 10px 0',
                  fontSize: '20px'
                }}>Bulletin Board</h3>
                <p style={{ 
                  color: '#333', 
                  textShadow: '1px 1px 0px #fff',
                  margin: 0,
                  fontSize: '14px',
                  lineHeight: '1.4'
                }}>
                  Stay updated with the latest school announcements, events, and important information. 
                  Check for new updates, special events, and community news posted by the administration.
                </p>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center',
              boxShadow: '3px 3px 0px #000'
            }}>
              <strong style={{ color: '#fff', textShadow: '1px 1px 0px #000', fontSize: '14px' }}>
                🎓 Congratulations! You've learned about all desktop applications available at Flunks High School!
              </strong>
            </div>
          </PageContent>
        );
        
      case "clique-access":
        return (
          <PageContent>
            <div style={{
              background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
              border: '4px solid #000',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '5px 5px 0px #000',
              textAlign: 'center'
            }}>
              <h1 style={{
                fontFamily: 'monospace',
                fontSize: '24px',
                color: '#fff',
                textShadow: '3px 3px 0px #000',
                margin: '0 0 10px 0',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                💻 Conditional Rendering
              </h1>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: '#00ff00',
                textShadow: '1px 1px 0px #000',
                letterSpacing: '1px'
              }}>
                ADVANCED SYSTEM MECHANICS
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #654ea3, #eaafc8)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '18px',
              marginBottom: '18px',
              boxShadow: '4px 4px 0px #000'
            }}>
              <h3 style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#fff',
                textShadow: '2px 2px 0px #000',
                margin: '0 0 12px 0',
                letterSpacing: '1px'
              }}>🎯 HOW THE SYSTEM WORKS</h3>
              <p style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#fff',
                textShadow: '1px 1px 0px #000',
                lineHeight: '1.5',
                margin: 0
              }}>
                Semester Zero uses conditional rendering to display content based on your NFT ownership. 
                Each exclusive area checks your wallet for specific traits before granting access.
              </p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ff9a56, #ffad56)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '18px',
              marginBottom: '18px',
              boxShadow: '4px 4px 0px #000'
            }}>
              <h3 style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#333',
                textShadow: '1px 1px 0px #fff',
                margin: '0 0 15px 0',
                letterSpacing: '1px'
              }}>🏠 CLIQUE ACCESS REQUIREMENTS</h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333'
                }}>
                  <strong style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>🤓 GEEK HOUSE</strong><br/>
                  <span style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>Requires: "GEEK" trait</span>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333'
                }}>
                  <strong style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>🏈 JOCK HOUSE</strong><br/>
                  <span style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>Requires: "JOCK" trait</span>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333'
                }}>
                  <strong style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>💅 PREP HOUSE</strong><br/>
                  <span style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>Requires: "PREP" trait</span>
                </div>
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '2px solid #333'
                }}>
                  <strong style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>🖤 FREAK HOUSE</strong><br/>
                  <span style={{ color: '#333', textShadow: '1px 1px 0px #fff' }}>Requires: "FREAK" trait</span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '18px',
              marginBottom: '18px',
              boxShadow: '4px 4px 0px #000'
            }}>
              <h3 style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#fff',
                textShadow: '2px 2px 0px #000',
                margin: '0 0 12px 0',
                letterSpacing: '1px'
              }}>📊 ACCESS STATUS CHECKER</h3>
              <div style={{ marginBottom: '15px' }}>
                <CliqueAccessPanel />
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #43cea2, #185a9d)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '18px',
              marginBottom: '18px',
              boxShadow: '4px 4px 0px #000'
            }}>
              <h3 style={{
                fontFamily: 'monospace',
                fontSize: '16px',
                color: '#fff',
                textShadow: '2px 2px 0px #000',
                margin: '0 0 12px 0',
                letterSpacing: '1px'
              }}>🎮 STEP-BY-STEP ACCESS GUIDE</h3>
              
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#fff',
                textShadow: '1px 1px 0px #000',
                lineHeight: '1.6'
              }}>
                <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    background: '#000', 
                    color: '#00ff00', 
                    padding: '2px 8px', 
                    marginRight: '10px',
                    borderRadius: '4px',
                    minWidth: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>1</span>
                  Navigate to the Semester Zero interactive map
                </div>
                <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    background: '#000', 
                    color: '#00ff00', 
                    padding: '2px 8px', 
                    marginRight: '10px',
                    borderRadius: '4px',
                    minWidth: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>2</span>
                  Double-click on any clique house building
                </div>
                <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    background: '#000', 
                    color: '#00ff00', 
                    padding: '2px 8px', 
                    marginRight: '10px',
                    borderRadius: '4px',
                    minWidth: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>3</span>
                  System checks your NFT traits automatically
                </div>
                <div style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
                  <span style={{ 
                    background: '#000', 
                    color: '#00ff00', 
                    padding: '2px 8px', 
                    marginRight: '10px',
                    borderRadius: '4px',
                    minWidth: '20px',
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>4</span>
                  ACCESS GRANTED or requirement info displayed
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
              border: '3px solid #333',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '4px 4px 0px #000',
              display: 'flex',
              alignItems: 'center',
              gap: '15px'
            }}>
              <div style={{ fontSize: '32px' }}>⚠️</div>
              <div>
                <h4 style={{
                  fontFamily: 'monospace',
                  fontSize: '14px',
                  color: '#fff',
                  textShadow: '2px 2px 0px #000',
                  margin: '0 0 8px 0',
                  letterSpacing: '1px'
                }}>ACCESS DENIED ERROR</h4>
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#fff',
                  textShadow: '1px 1px 0px #000',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  Missing required NFT trait! Visit the marketplace to acquire the necessary Flunks character 
                  with the correct clique attribute for house access.
                </p>
              </div>
            </div>
          </PageContent>
        );
        

        
      case "gum-system":
        return (
          <PageContent style={{ background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 25%, #2c5aa0 50%, #1e3a72 75%, #0f1b36 100%)' }}>
            <div style={{ 
              background: 'linear-gradient(45deg, #f0f8ff 0%, #e6f3ff 50%, #ddeeff 100%)', 
              padding: '20px', 
              borderRadius: '15px', 
              border: '4px solid #4a90e2',
              boxShadow: '0 0 20px rgba(74, 144, 226, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.3)',
              marginBottom: '15px'
            }}>
              <PageHeader style={{ 
                color: '#1e3a72', 
                textShadow: '2px 2px 4px rgba(74, 144, 226, 0.3)',
                fontSize: '24px',
                textAlign: 'center',
                borderBottom: '3px solid #4a90e2'
              }}>🍬 Semester Zero GUM Mechanics</PageHeader>
              
              <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <span style={{ fontSize: '48px', textShadow: '0 0 10px rgba(74, 144, 226, 0.8)' }}>�⚙️🍬⚙️�</span>
              </div>
              
              <h3 style={{ color: '#2c5aa0', textAlign: 'center', fontSize: '18px' }}>Systematic Reward Distribution</h3>
              <p style={{ textAlign: 'center', fontSize: '14px', fontStyle: 'italic', color: '#1e3a72' }}>
                Learn how the GUM reward system operates throughout Semester Zero campus.
              </p>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)', 
              padding: '15px', 
              borderRadius: '10px', 
              border: '2px solid #4a90e2',
              marginBottom: '15px'
            }}>
              <h4 style={{ color: '#1e3a72', fontSize: '16px', marginBottom: '10px' }}>🎯 GUM Earning Mechanisms</h4>
              
              <div style={{ 
                background: 'linear-gradient(90deg, #e6f3ff 0%, #cce7ff 100%)', 
                padding: '10px', 
                borderRadius: '8px', 
                border: '1px solid #4a90e2',
                marginBottom: '10px'
              }}>
                <p><strong style={{ color: '#2c5aa0' }}>🌅 Daily Login System:</strong> Automated reward distribution</p>
                <ul style={{ marginLeft: '20px', color: '#1e3a72' }}>
                  <li><strong>Reward:</strong> 5 GUM points daily</li>
                  <li><strong>Mechanism:</strong> Automatically processed when wallet connects</li>
                  <li><strong>Cooldown:</strong> 24-hour cycle</li>
                  <li><strong>Notification:</strong> System notification upon processing</li>
                </ul>
              </div>

              <div style={{ 
                background: 'linear-gradient(90deg, #ffe6f3 0%, #ffccf0 100%)', 
                padding: '10px', 
                borderRadius: '8px', 
                border: '1px solid #d63384',
                marginBottom: '10px'
              }}>
                <p><strong style={{ color: '#d63384' }}>🎯 Daily Check-in System:</strong> Manual engagement rewards</p>
                <ul style={{ marginLeft: '20px', color: '#b02a5b' }}>
                  <li><strong>Reward:</strong> 15 GUM points daily</li>
                  <li><strong>Location:</strong> Navigate to "My Locker" → Click daily check-in button</li>
                  <li><strong>Cooldown:</strong> 24-hour cycle (independent from login)</li>
                  <li><strong>Combined Potential:</strong> 20 GUM per day (5 login + 15 check-in)</li>
                </ul>
              </div>
              
              <div style={{ 
                background: 'linear-gradient(90df, #f0f4ff 0%, #e0e8ff 100%)', 
                padding: '10px', 
                borderRadius: '8px', 
                border: '1px solid #357abd',
                marginBottom: '10px'
              }}>
                <p><strong style={{ color: '#1e3a72' }}>💡 Pro Tip:</strong> Daily engagement rewards</p>
                <ul style={{ marginLeft: '20px', color: '#1e3a72' }}>
                  <li><strong>Best Practice:</strong> Log in daily for consistent rewards</li>
                  <li><strong>Strategy:</strong> Check in manually for bonus points</li>
                  <li><strong>Timing:</strong> 24-hour cycles for optimal earning</li>
                  <li><strong>Maximum Potential:</strong> 20 GUM per day with both bonuses</li>
                </ul>
              </div>
            </div>
            
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)', 
              padding: '15px', 
              borderRadius: '10px', 
              border: '2px solid #4a90e2',
              marginBottom: '15px'
            }}>
              <h4 style={{ color: '#1e3a72', fontSize: '16px', marginBottom: '10px' }}>📊 System Dashboard</h4>
              <p>Your GUM balance interface displays in the top-right corner, featuring:</p>
              <ul style={{ marginLeft: '20px', color: '#2c5aa0' }}>
                <li><strong>Current Balance:</strong> Real-time point total</li>
                <li><strong>Live Updates:</strong> Animated balance changes upon earning</li>
                <li><strong>Persistent Storage:</strong> Data linked to wallet address</li>
              </ul>
              
              <p style={{ marginTop: '10px' }}><strong>System Access:</strong> Click the 🍬 Gum Center icon in the taskbar to access detailed GUM statistics, transaction history, and manage your rewards!</p>
            </div>
            
            <div style={{ 
              background: 'linear-gradient(45deg, #ff6b9d 0%, #ff8e9b 100%)', 
              padding: '15px', 
              borderRadius: '10px', 
              border: '2px solid #e91e63',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#ffffff', fontSize: '16px', marginBottom: '10px' }}>🎯 Quick Start Guide</h4>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>
                🍬 Connect your wallet and start earning GUM today! 🍬
              </p>
            </div>
            
            <div style={{ 
              marginTop: '15px', 
              padding: '10px', 
              background: 'rgba(74, 144, 226, 0.1)', 
              border: '1px solid #4a90e2',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {isFeatureEnabled('showGumAdminPanel') ? (
                <>
                  <strong style={{ color: '#1e3a72' }}>🔧 System Administration:</strong> Press <code>Ctrl + G</code> (or <code>Cmd + G</code> on Mac) to access the GUM admin panel for detailed system analytics and transaction monitoring!
                </>
              ) : (
                <>
                  <strong style={{ color: '#1e3a72' }}>🎯 Quick Tip:</strong> Use the GUM system daily to earn rewards and track your progress in the Flunks ecosystem!
                </>
              )}
            </div>
          </PageContent>
        );
        
      case "terminal":
        return (
          <PageContent>
            <PageHeader>💻 Terminal Guide</PageHeader>
            <h3>Flunks Terminal - Your Command Center</h3>
            <p>The Terminal is a powerful tool that lets you interact with the Flunks High School system using text commands, just like a real computer terminal!</p>
            
            {isFeatureEnabled('showGumAdminPanel') && (
              <div style={{ marginTop: 15, padding: 10, background: '#ffeeee', border: '1px solid #cc0000' }}>
                <strong>🔐 Beta Access Required:</strong> This feature requires SEMESTER0 access code or higher.
              </div>
            )}
            
            <h4>🚀 Opening the Terminal</h4>
            <p>Double-click the <strong>Terminal</strong> icon on your desktop to open the command interface.</p>
            <Screenshot>[TERMINAL ICON ON DESKTOP]</Screenshot>
            
            <h4>⌨️ Basic Commands</h4>
            <p>Here are some essential commands to get you started:</p>
            <ul>
              <li><code><strong>help</strong></code> - Show all available commands</li>
              <li><code><strong>clear</strong></code> - Clear the terminal screen</li>
              <li><code><strong>whoami</strong></code> - Display your current user info</li>
              <li><code><strong>flunks</strong></code> - Show Flunks High School ASCII art</li>
              <li><code><strong>wtf</strong></code> - What's this feature about?</li>
            </ul>
            
            <h4>⚙️ Terminal Features</h4>
            <p><strong>Command History:</strong> Use ↑ and ↓ arrow keys to cycle through previous commands</p>
            <p><strong>Copy/Paste:</strong> Right-click for context menu options</p>
            <p><strong>Resize Window:</strong> Drag corners to resize the terminal window</p>
            <p><strong>Multiple Sessions:</strong> Open multiple terminal windows simultaneously</p>
            
            <h4>🔐 Security Features</h4>
            <p>The terminal includes several security and authentication features:</p>
            <ul>
              <li><strong>Wallet Integration:</strong> Commands automatically detect your connected wallet</li>
              <li><strong>Access Control:</strong> Some commands require specific access levels</li>
              <li><strong>Safe Execution:</strong> All commands run in a secure environment</li>
              {isFeatureEnabled('showGumAdminPanel') && (
                <li><strong>Beta Testing:</strong> Available to beta access holders</li>
              )}
            </ul>
            
            <div style={{ marginTop: 15, padding: 10, background: '#fff0e6', border: '1px solid #ff8800' }}>
              <strong>⚡ Power User Tip:</strong> Type <code>help</code> to see all available commands for your access level!
            </div>
            
            <div style={{ marginTop: 10, padding: 10, background: '#f0f8ff', border: '1px solid #0066cc' }}>
              <strong>🎯 Quick Start:</strong> New to terminals? Start with <code>help</code>, then try <code>whoami</code> to get your bearings!
            </div>
            
            <Screenshot>[TERMINAL INTERFACE - Command prompt, help output, colorful text]</Screenshot>
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
              <li>🐦 Twitter/X: @flunksnft</li>
              <li>💬 Discord: Join our community server</li>
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
      headerTitle="Semester Zero Game Manual"
      headerIcon="/images/icons/game-manual-icon.png"
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