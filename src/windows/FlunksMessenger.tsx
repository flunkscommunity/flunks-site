import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useWindowsContext } from 'contexts/WindowsContext';
import { useUserProfile } from 'contexts/UserProfileContext';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';
import { WINDOW_IDS } from 'fixed';
import useMessengerSounds from 'hooks/useMessengerSounds';
import useChatMessages from 'hooks/useChatMessages';
import useLocalChatMessages from 'hooks/useLocalChatMessages';
import UserDisplay from 'components/UserDisplay';
import { useDemoModeOptional, isIOSPlatform, DEMO_CHAT_MESSAGES, DEMO_PROFILE } from 'contexts/DemoModeContext';
import { 
  Button, 
  Frame, 
  TextField, 
} from 'react95';

const MessengerContainer = styled.div`
  display: flex;
  height: 100%;
  background: #c0c0c0;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ContactList = styled.div`
  width: 200px;
  border-right: 2px inset #c0c0c0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    width: 100%;
    height: 120px;
    border-right: none;
    border-bottom: 2px inset #c0c0c0;
    flex-shrink: 0;
    
    /* Add scrollable room list for mobile */
    .react95-menu-list {
      max-height: 80px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
  }
`;

const OnlineUsersSection = styled.div`
  border-top: 1px inset #c0c0c0;
  background: #f0f0f0;
  
  @media (max-width: 768px) {
    display: none; /* Hide online users on mobile to save space */
  }
`;

const OnlineUsersHeader = styled.div`
  background: linear-gradient(90deg, #008000, #006600);
  color: white;
  padding: 6px 8px;
  font-weight: bold;
  font-size: 10px;
  text-align: center;
`;

const OnlineUserItem = styled.div<{ isCurrentUser?: boolean }>`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  font-size: 10px;
  background: ${props => props.isCurrentUser ? '#e8f4f8' : 'transparent'};
  border-left: ${props => props.isCurrentUser ? '3px solid #0066cc' : '3px solid transparent'};
  
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #00ff00;
    margin-right: 6px;
    border: 1px solid #333;
    box-shadow: 0 0 2px rgba(0,255,0,0.5);
  }
  
  .username {
    font-weight: ${props => props.isCurrentUser ? 'bold' : 'normal'};
    color: ${props => props.isCurrentUser ? '#0066cc' : '#333'};
  }
  
  .wallet {
    font-size: 8px;
    color: #666;
    margin-left: auto;
  }
`;

const ContactListHeader = styled.div`
  background: linear-gradient(90deg, #1084d0, #0066cc);
  color: white;
  padding: 8px;
  font-weight: bold;
  font-size: 11px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 10px;
  }
`;

const ContactItem = styled.div<{ online?: boolean; isSelected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  cursor: pointer;
  font-size: 11px;
  background: ${props => props.isSelected ? '#316ac5' : 'transparent'};
  color: ${props => props.isSelected ? 'white' : 'black'};
  border-left: ${props => props.isSelected ? '3px solid #fff' : '3px solid transparent'};
  
  &:hover {
    background: ${props => props.isSelected ? '#316ac5' : '#e0e0e0'};
  }
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.online ? '#00ff00' : '#ff6666'};
    margin-right: 8px;
    border: 1px solid #333;
    box-shadow: 0 0 3px rgba(0,0,0,0.3);
  }
  
  @media (max-width: 768px) {
    padding: 4px 8px;
    font-size: 9px;
    
    &::before {
      width: 6px;
      height: 6px;
      margin-right: 6px;
    }
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Allow flex child to shrink below content size */
  
  @media (max-width: 768px) {
    height: calc(100% - 120px); /* Subtract contact list height on mobile */
  }
`;

const ChatHeader = styled.div`
  background: linear-gradient(90deg, #1084d0, #0066cc);
  color: white;
  padding: 8px 12px;
  font-weight: bold;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 10px;
    gap: 6px;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  background: white;
  padding: 8px;
  overflow-y: auto;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
  min-height: 0; /* Allow scrolling within flex container */
  
  @media (max-width: 768px) {
    padding: 6px;
    font-size: 10px;
    /* Optimize for mobile scrolling */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
`;

const MessageBubble = styled.div<{ isOwn?: boolean; isSystem?: boolean }>`
  margin-bottom: 8px;
  
  .message-header {
    font-weight: bold;
    color: ${props => props.isSystem ? '#666' : props.isOwn ? '#0066cc' : '#cc0000'};
    margin-bottom: 2px;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .message-text {
    color: ${props => props.isSystem ? '#666' : '#000'};
    font-style: ${props => props.isSystem ? 'italic' : 'normal'};
    word-wrap: break-word;
    line-height: 1.3;
  }
  
  .message-time {
    font-size: 9px;
    color: #999;
    margin-left: 4px;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 6px;
    
    .message-header {
      gap: 3px;
    }
    
    .message-text {
      font-size: 10px;
      line-height: 1.4;
    }
    
    .message-time {
      font-size: 8px;
      margin-left: 2px;
    }
  }
`;

const ChatInput = styled.div`
  border-top: 1px solid #999;
  padding: 8px;
  background: #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    padding: 6px;
    gap: 6px;
    
    /* Make input touch-friendly on mobile */
    input {
      font-size: 16px; /* Prevent zoom on iOS */
      padding: 8px;
    }
    
    button {
      padding: 8px 12px;
      font-size: 12px;
    }
  }
`;

const EmojiToolbar = styled.div`
  border-top: 1px solid #999;
  padding: 4px 8px;
  background: #f0f0f0;
  font-size: 16px;
  flex-shrink: 0;
  overflow-x: auto;
  white-space: nowrap;
  
  span {
    cursor: pointer;
    margin-right: 8px;
    padding: 2px 4px;
    border-radius: 4px;
    display: inline-block;
    
    &:hover {
      background: #ddd;
    }
    
    &:active {
      background: #bbb;
    }
  }
  
  @media (max-width: 768px) {
    padding: 6px 8px;
    font-size: 18px; /* Larger emojis for easier touch targets */
    
    span {
      margin-right: 10px;
      padding: 4px 6px;
      min-width: 32px;
      text-align: center;
    }
  }
`;

const UserSetup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  background: #c0c0c0;
  
  h2 {
    margin-bottom: 20px;
    color: #0066cc;
  }
  
  .setup-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
    min-width: 300px;
  }
`;

interface Message {
  id: string;
  username: string;
  profileIcon?: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem?: boolean;
  isAI?: boolean;
}

interface Contact {
  username: string;
  online: boolean;
  isAI?: boolean;
  agentId?: string;
}

interface OnlineUser {
  username: string;
  walletAddress: string;
  profileIcon?: string;
  isCurrentUser?: boolean;
}

const FlunksMessenger: React.FC = () => {
  const dynamicContext = useDynamicContext();
  const { user, primaryWallet } = dynamicContext;
  const { isConnected, address: walletAddress } = useUnifiedWallet();
  
  // Demo mode support for iOS App Store review
  const demoMode = useDemoModeOptional();
  const isDemoMode = isIOSPlatform() && (demoMode?.isDemoMode || false);
  
  // Track component lifecycle
  useEffect(() => {
    console.log('💬 [FlunksMessenger] MOUNTED');
    return () => {
      console.log('💬 [FlunksMessenger] UNMOUNTED - Window is being closed/recreated');
    };
  }, []);
  
  // Debug: Log demo mode status immediately on mount
  useEffect(() => {
    console.log('💬 [FlunksMessenger] Demo mode check:', {
      isIOSPlatform: isIOSPlatform(),
      contextIsDemoMode: demoMode?.isDemoMode,
      finalIsDemoMode: isDemoMode
    });
  }, [isDemoMode, demoMode?.isDemoMode]);
  
  // Check if user is actually authenticated - use unified wallet which is more reliable
  // In demo mode, treat as authenticated
  const isUserAuthenticated = isDemoMode || isConnected || !!(user || primaryWallet);
  
  // Add debugging for user state
  useEffect(() => {
    console.log('🔍 FlunksMessenger - Auth state:', { 
      isDemoMode,
      unifiedWallet: { isConnected, address: walletAddress },
      dynamic: {
        user: user ? { id: user.userId, email: user.email } : null,
        primaryWallet: primaryWallet?.address ? primaryWallet.address.slice(0, 10) + '...' : null,
      },
      isUserAuthenticated,
      timestamp: new Date().toISOString()
    });
  }, [user, primaryWallet, isConnected, walletAddress, isUserAuthenticated, isDemoMode]);

  const { closeWindow } = useWindowsContext();
  const { profile, hasProfile } = useUserProfile();
  const sounds = useMessengerSounds();
  
  // Auto-use profile username if available, otherwise require manual entry
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  // Handle initial auth check - use unified wallet for reliable detection
  useEffect(() => {
    // Only run once - prevent infinite loops
    if (hasCheckedAuth) {
      return;
    }
    
    console.log('🔍 Auth check running:', { 
      isConnected,
      walletAddress,
      user: !!user, 
      primaryWallet: !!primaryWallet,
      hasCheckedAuth,
      isDemoMode 
    });
    
    // In demo mode, skip auth check and use demo profile
    if (isDemoMode) {
      console.log('🎮 Demo mode: Skipping auth, using demo profile');
      setIsCheckingAuth(false);
      setHasCheckedAuth(true);
      setUsername(DEMO_PROFILE.username);
      return;
    }
    
    // If unified wallet is connected OR we have Dynamic auth, we're authenticated
    if (isConnected || user || primaryWallet) {
      console.log('✅ User is authenticated - opening chat');
      setIsCheckingAuth(false);
      setHasCheckedAuth(true);
      return;
    }
    
    // Give contexts a brief moment to initialize (300ms)
    const timer = setTimeout(() => {
      if (isConnected || user || primaryWallet) {
        console.log('✅ User authenticated after wait');
      } else {
        console.log('❌ No authentication detected - showing login');
      }
      setIsCheckingAuth(false);
      setHasCheckedAuth(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [user, primaryWallet, isConnected, walletAddress, hasCheckedAuth, isDemoMode]);

  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('💬 General Chat');
  const [isTyping, setIsTyping] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  
  // Use local chat for non-persistent rooms (AI rooms)
  const localChat = useLocalChatMessages(username);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Online users tracking - in production this would come from your backend/WebSocket
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Mock some online users for demo (in production, this would be real-time data)
  useEffect(() => {
    const mockUsers: OnlineUser[] = [
      { username: 'BeefCurtains', walletAddress: '0x1234...5678' },
      { username: '~Dirty~Sanchez~', walletAddress: '0x8765...4321' },
      { username: 'RustyTromboner', walletAddress: '0xabcd...efgh' },
      { username: 'Gonzo420', walletAddress: '0x9876...1234' },
    ];

    // Add current user if they're logged in (check both user and primaryWallet)
    const userIdentifier = user?.userId || primaryWallet?.address;
    if (userIdentifier) {
      const currentUserName = username || user?.email?.split('@')[0] || `User-${userIdentifier.slice(-4)}`;
      mockUsers.unshift({
        username: currentUserName,
        walletAddress: userIdentifier,
        profileIcon: profile?.profile_icon,
        isCurrentUser: true
      });
    }

    setOnlineUsers(mockUsers);

    // Simulate users coming online/offline every 30 seconds
    const interval = setInterval(() => {
      const additionalUsers: OnlineUser[] = [
        { username: 'ScoobySnax', walletAddress: '0xbeef...cafe' },
        { username: 'Powerbottom69', walletAddress: '0xdead...beef' },
        { username: 'ThunderTwink', walletAddress: '0xfeed...face' },
      ];
      
      setOnlineUsers(prev => {
        const shouldAdd = Math.random() > 0.5;
        if (shouldAdd && prev.length < 8) {
          const randomIndex = Math.floor(Math.random() * additionalUsers.length);
          const randomUser = additionalUsers[randomIndex];
          if (randomUser && !prev.find(u => u.username === randomUser.username)) {
            if (soundsEnabled) sounds.userOnline(); // Play sound when user comes online
            return [...prev, randomUser];
          }
        } else if (prev.length > 3) {
          // Remove a non-current user
          if (soundsEnabled) sounds.userOffline(); // Play sound when user goes offline
          return prev.filter((u) => u.isCurrentUser || prev.indexOf(u) < prev.length - 1);
        }
        return prev;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [user, primaryWallet, username, soundsEnabled, profile]);

  // Chat rooms - simplified to just General Chat
  const [chatRooms] = useState<Contact[]>([
    { username: '💬 General Chat', online: true, isAI: false },
  ]);

  // Define which rooms should be saved to database
  const PERSISTENT_ROOMS = [
    '💬 General Chat',
  ];

  // Check if current room should be persistent
  const isRoomPersistent = PERSISTENT_ROOMS.includes(selectedContact);
  const selectedRoom = chatRooms.find(r => r.username === selectedContact);
  const isAIRoom = selectedRoom?.isAI || false;

  // Use different hooks based on room type
  const persistentChat = useChatMessages(
    isRoomPersistent ? selectedContact : '', 
    username
  );

  // Get the appropriate chat data based on room type
  // In demo mode, use demo messages instead
  const demoMessages = isDemoMode ? DEMO_CHAT_MESSAGES.map((msg, idx) => ({
    id: `demo-${idx}`,
    username: msg.username,
    message: msg.message,
    timestamp: msg.timestamp,
    profileIcon: msg.profileIcon,
    isOwn: msg.username === DEMO_PROFILE.username,
    isSystem: false,
    isAI: false,
  })) : [];
  
  const { messages, isLoading: messagesLoading, error: messagesError } = isDemoMode 
    ? { messages: demoMessages, isLoading: false, error: null }
    : (isRoomPersistent ? persistentChat : { messages: localChat.messages, isLoading: false, error: null });

  // Unified post message function
  const postChatMessage = useCallback(async (
    messageText: string,
    walletAddress?: string,
    isAI: boolean = false,
    aiAgentId?: string,
    customUsername?: string
  ) => {
    const currentProfileIcon = isAI ? '🤖' : profile?.profile_icon;
    console.log('💬 postChatMessage: Attempting to post with icon:', currentProfileIcon, 'isAI:', isAI);
    console.log('💬 postChatMessage: Profile context:', profile);
    
    if (isRoomPersistent && persistentChat.postMessage) {
      // Save to database for persistent rooms
      return await persistentChat.postMessage(messageText, walletAddress, isAI, aiAgentId, customUsername);
    } else {
      // Use local state for AI rooms
      const displayUsername = customUsername || username;
      const isOwn = displayUsername === username && !isAI;
      console.log('💬 postChatMessage: Adding local message with icon:', currentProfileIcon);
      return localChat.addMessage(messageText, displayUsername, isAI, isOwn, currentProfileIcon);
    }
  }, [isRoomPersistent, persistentChat.postMessage, localChat.addMessage, username, profile]);

  // Function to post message to a specific room (for AI greetings)
  const postMessageToRoom = useCallback(async (
    roomName: string,
    messageText: string,
    walletAddress?: string,
    isAI: boolean = false,
    aiAgentId?: string,
    customUsername?: string
  ) => {
    const PERSISTENT_ROOMS = [
      '💬 General Chat',
    ];
    
    const isPersistent = PERSISTENT_ROOMS.includes(roomName);
    
    if (isPersistent) {
      // For persistent rooms, only post if it's the current room
      if (roomName === selectedContact && persistentChat.postMessage) {
        return await persistentChat.postMessage(messageText, walletAddress, isAI, aiAgentId, customUsername);
      }
    } else {
      // For AI rooms, only post if it's the current room
      if (roomName === selectedContact) {
        const displayUsername = customUsername || username;
        const isOwn = displayUsername === username && !isAI;
        return localChat.addMessage(messageText, displayUsername, isAI, isOwn, isAI ? '🤖' : profile?.profile_icon);
      }
    }
    return false;
  }, [selectedContact, persistentChat.postMessage, localChat.addMessage, username]);

  // Auto-set username from profile when available
  useEffect(() => {
    if (hasProfile && profile?.username && !username) {
      setUsername(profile.username);
      
      // Play welcome sound when profile username is loaded
      if (soundsEnabled) {
        setTimeout(() => sounds.userOnline(), 500);
      }
      
      // Add welcome message when profile username is auto-loaded
      setTimeout(async () => {
        if (profile.username) {
          console.log('💬 Adding welcome message with profile icon:', profile.profile_icon);
          await postChatMessage(
            `Welcome back to Flunks Messenger, ${profile.username}! 🎉`,
            user?.userId,
            false
          );
        }
      }, 1500); // Give the chat system time to initialize
    }
  }, [hasProfile, profile, username, soundsEnabled, sounds, postChatMessage, user]);

  const emojis = ['😀', '😂', '😍', '😭', '😎', '🤔', '👍', '👎', '❤️', '🔥'];

  // Clear AI chat when switching between different AI rooms
  useEffect(() => {
    const currentRoom = chatRooms.find(r => r.username === selectedContact);
    if (currentRoom?.isAI && !isRoomPersistent) {
      localChat.clearMessages();
    }
  }, [selectedContact, isRoomPersistent, localChat.clearMessages, chatRooms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      
      // Play welcome sound
      if (soundsEnabled) {
        setTimeout(() => sounds.userOnline(), 500);
      }
      
      console.log('💬 Manual username submit - no profile, so no profile icon');
      
      // Add welcome message to database
      postChatMessage(
        `Welcome to Flunks Messenger, ${tempUsername}! 🎉`,
        user?.userId,
        false
      );
    }
  };

  const sendMessage = async () => {
    if (currentMessage.trim() && username) {
      // Play send sound
      if (soundsEnabled) sounds.messageSend();
      
      const userMessage = currentMessage.trim();
      
      console.log('💬 Sending message with profile icon:', profile?.profile_icon);
      
      // Post user message to database
      await postChatMessage(userMessage, user?.userId, false);
      
      setCurrentMessage('');
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentMessage(value);
    
    // Play typing sound occasionally (not every keystroke to avoid spam)
    if (soundsEnabled && value.length > 0 && Math.random() > 0.8) {
      sounds.typing();
    }
    
    // Show typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  const switchToContact = (roomName: string) => {
    setSelectedContact(roomName);
  };

  const addEmoji = (emoji: string) => {
    setCurrentMessage(prev => prev + emoji);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check authentication more reliably - wait for context to load
  if (isCheckingAuth) {
    return (
      <UserSetup>
        <h2>⏳ Checking authentication...</h2>
        <p>Please wait while we verify your connection...</p>
      </UserSetup>
    );
  }

  // If not authenticated after loading, show connect prompt
  if (!isUserAuthenticated) {
    return (
      <UserSetup>
        <h2>🔒 Connect Wallet to Chat</h2>
        <p>Please connect your wallet to access Flunks Messenger</p>
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <DynamicWidget />
        </div>
      </UserSetup>
    );
  }

  // If user doesn't have a username yet (either no profile or need to set one manually)
  if (!username) {
    // Show different messages based on whether they have a profile
    if (hasProfile && profile?.username) {
      // This shouldn't happen due to the useEffect above, but just in case
      return (
        <UserSetup>
          <h2>⏳ Loading your profile...</h2>
          <p>Setting up your chat session with username: {profile.username}</p>
        </UserSetup>
      );
    } else {
      // User needs to either create a profile or set a temporary chat username
      return (
        <UserSetup>
          <h2>👋 Welcome to Flunks Messenger!</h2>
          {hasProfile === false ? (
            <div className="setup-form">
              <p style={{ marginBottom: '15px', color: '#666' }}>
                You don't have a profile yet. You can create one or just enter a temporary username for chat.
              </p>
              <Frame variant="field" style={{ width: '100%' }}>
                <TextField
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="Enter a temporary username for chat..."
                  onKeyPress={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                  style={{ width: '100%' }}
                />
              </Frame>
              <Button onClick={handleUsernameSubmit} disabled={!tempUsername.trim()}>
                Start Chatting! 💬
              </Button>
              <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '10px' }}>
                Your username will be visible to other users in the chat room.
                <br />
                Tip: Create a profile in "My Locker" to save your username permanently! 🎯
              </p>
            </div>
          ) : (
            <div className="setup-form">
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Loading your profile...
              </p>
            </div>
          )}
        </UserSetup>
      );
    }
  }

  return (
    <MessengerContainer className="flunks-messenger-container">
      <ContactList className="contact-list">
        <ContactListHeader>
          💬 General Chat
        </ContactListHeader>

        <OnlineUsersSection style={{ borderTop: 'none', flex: 1 }}>
          <OnlineUsersHeader>
            Online Now ({onlineUsers.length})
          </OnlineUsersHeader>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 30px)' }}>
            {onlineUsers.map((user) => (
              <OnlineUserItem 
                key={user.walletAddress} 
                isCurrentUser={user.isCurrentUser}
              >
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <UserDisplay
                    username={user.isCurrentUser ? `${user.username} (You)` : user.username}
                    profileIcon={user.profileIcon}
                    size="small"
                    style={{ 
                      color: user.isCurrentUser ? '#0066cc' : '#333',
                      fontWeight: user.isCurrentUser ? 'bold' : 'normal'
                    }}
                  />
                </div>
              </OnlineUserItem>
            ))}
          </div>
        </OnlineUsersSection>
      </ContactList>

      <ChatArea className="chat-area">
        <ChatHeader>
          <span>💬</span>
          <span>General Chat</span>
          <Button
            size="sm"
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            style={{ 
              marginLeft: 'auto', 
              fontSize: '10px',
              padding: '2px 6px',
              background: soundsEnabled ? '#00ff00' : '#ff6666'
            }}
            title={soundsEnabled ? 'Sounds: ON' : 'Sounds: OFF'}
          >
            {soundsEnabled ? '🔊' : '🔇'}
          </Button>
        </ChatHeader>

        <ChatMessages className="flunks-messenger-messages">
          {messages.map((message) => (
            <MessageBubble 
              key={message.id} 
              isOwn={message.isOwn} 
              isSystem={message.isSystem}
              className="flunks-messenger-message"
            >
              <div className="message-header">
                <UserDisplay
                  username={message.username}
                  profileIcon={message.profileIcon}
                  size="small"
                  className="flunks-messenger-user-display"
                  style={{
                    color: message.isSystem ? '#666' : message.isOwn ? '#0066cc' : '#cc0000'
                  }}
                />
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              <div className="message-text">{message.text}</div>
            </MessageBubble>
          ))}
          {isTyping && (
            <MessageBubble isSystem={true} className="flunks-messenger-message">
              <div className="message-text" style={{ fontStyle: 'italic', color: '#666' }}>
                You are typing...
              </div>
            </MessageBubble>
          )}
          <div ref={messagesEndRef} />
        </ChatMessages>

        <EmojiToolbar className="flunks-messenger-emoji-toolbar">
          {emojis.map((emoji) => (
            <span key={emoji} onClick={() => addEmoji(emoji)}>
              {emoji}
            </span>
          ))}
        </EmojiToolbar>

        <ChatInput>
          <TextField
            value={currentMessage}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            style={{ flex: 1 }}
          />
          <Button onClick={sendMessage} disabled={!currentMessage.trim()}>
            Send
          </Button>
        </ChatInput>
      </ChatArea>
    </MessengerContainer>
  );
};

export default FlunksMessenger;
