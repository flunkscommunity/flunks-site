import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useDynamicContext, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { useWindowsContext } from 'contexts/WindowsContext';
import { useUserProfile } from 'contexts/UserProfileContext';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { AI_AGENTS, getAgentResponse } from 'data/aiAgents';
import useMessengerSounds from 'hooks/useMessengerSounds';
import useAIChat from 'hooks/useAIChat';
import useChatMessages from 'hooks/useChatMessages';
import useLocalChatMessages from 'hooks/useLocalChatMessages';
import UserDisplay from 'components/UserDisplay';
import { 
  Window, 
  WindowHeader, 
  WindowContent, 
  Button, 
  Frame, 
  TextField, 
  MenuList,
  MenuListItem,
  Separator,
  Toolbar,
  Avatar
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
  const { user } = useDynamicContext();
  
  // Add debugging for user state
  useEffect(() => {
    console.log('🔍 FlunksMessenger - Dynamic context update:', { 
      user: user ? { id: user.userId, email: user.email } : null, 
      timestamp: new Date().toISOString()
    });
  }, [user]);

  const { closeWindow } = useWindowsContext();
  const { profile, hasProfile } = useUserProfile();
  const sounds = useMessengerSounds();
  const { sendToAI, isLoading: aiLoading } = useAIChat();
  
  // Auto-use profile username if available, otherwise require manual entry
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Handle initial auth check with a small delay to allow Dynamic context to populate
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedContact, setSelectedContact] = useState<string>('💬 General Chat');
  const [isTyping, setIsTyping] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
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

    // Add current user if they're logged in
    if (user?.userId) {
      const currentUserName = username || user.email?.split('@')[0] || `User-${user.userId.slice(-4)}`;
      mockUsers.unshift({
        username: currentUserName,
        walletAddress: user.userId,
        profileIcon: profile?.profile_icon,
        isCurrentUser: true
      });
    }

    setOnlineUsers(mockUsers);

    // Simulate users coming online/offline every 30 seconds
    const interval = setInterval(() => {
      const additionalUsers = [
        { username: 'ScoobySnax', walletAddress: '0xbeef...cafe' },
        { username: 'Powerbottom69', walletAddress: '0xdead...beef' },
        { username: 'ThunderTwink', walletAddress: '0xfeed...face' },
      ];
      
      setOnlineUsers(prev => {
        const shouldAdd = Math.random() > 0.5;
        if (shouldAdd && prev.length < 8) {
          const randomUser = additionalUsers[Math.floor(Math.random() * additionalUsers.length)];
          if (!prev.find(u => u.username === randomUser.username)) {
            if (soundsEnabled) sounds.userOnline(); // Play sound when user comes online
            return [...prev, randomUser];
          }
        } else if (prev.length > 3) {
          // Remove a non-current user
          if (soundsEnabled) sounds.userOffline(); // Play sound when user goes offline
          return prev.filter((u, index) => u.isCurrentUser || index < prev.length - 1);
        }
        return prev;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [user, username, soundsEnabled]);

  // Chat rooms - AI agents get their own dedicated rooms
  const [chatRooms] = useState<Contact[]>([
    { username: '🤖 FlunkBot Room', online: true, isAI: true, agentId: 'FlunkBot' },
    { username: '🧙‍♂️ WZRD Room', online: true, isAI: true, agentId: 'StudyBuddy' },
    { username: '☕ Town Gossip Room', online: true, isAI: true, agentId: 'TownGossip' },
    { username: '🏈 Sportscenter', online: true, isAI: true, agentId: 'SportsCenter90s' },
    { username: '💬 General Chat', online: true, isAI: false },
    { username: '🎮 Gaming Lounge', online: true, isAI: false },
    { username: '🏫 Study Hall', online: true, isAI: false },
    { username: '🎵 Music & Chill', online: true, isAI: false },
  ]);

  // Define which rooms should be saved to database
  const PERSISTENT_ROOMS = [
    '💬 General Chat',
    '🎮 Gaming Lounge',
    '🏫 Study Hall',
    '🎵 Music & Chill'
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
  const { messages, isLoading: messagesLoading, error: messagesError } = 
    isRoomPersistent ? persistentChat : { messages: localChat.messages, isLoading: false, error: null };

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
      '🎮 Gaming Lounge',
      '🏫 Study Hall',
      '🎵 Music & Chill'
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

      // Handle AI response for AI rooms
      const room = chatRooms.find(r => r.username === selectedContact);
      if (room?.isAI && room.agentId) {
        // Show AI typing indicator
        setTimeout(() => setIsAiTyping(true), 500);
        
        // Add a safety timeout to clear typing indicator if something goes wrong
        const typingTimeout = setTimeout(() => {
          console.log('⚠️ AI typing timeout reached, clearing indicator');
          setIsAiTyping(false);
        }, 10000); // 10 second timeout
        
        try {
          // Get AI response using the new AI chat hook
          console.log('🤖 Sending to AI:', { userMessage, agentId: room.agentId, username });
          const aiResponse = await sendToAI(userMessage, room.agentId, username, messages);
          console.log('🤖 AI Response received:', aiResponse);
          
          // Clear the timeout since we got a response
          clearTimeout(typingTimeout);
          setIsAiTyping(false);
          
          if (aiResponse) {
            if (soundsEnabled) sounds.messageReceive(); // Play receive sound for AI response
            
            // Post AI response to database
            await postChatMessage(
              aiResponse.message,
              undefined, // No wallet for AI
              true,
              room.agentId,
              AI_AGENTS[room.agentId]?.username || room.agentId
            );
          } else {
            console.log('🤖 No AI response received, using fallback');
            // If no response, use fallback
            setTimeout(async () => {
              if (soundsEnabled) sounds.messageReceive();
              await postChatMessage(
                getAgentResponse(room.agentId, userMessage),
                undefined, // No wallet for AI
                true,
                room.agentId,
                AI_AGENTS[room.agentId]?.username || room.agentId
              );
            }, 1000);
          }
        } catch (error) {
          console.error('🚨 AI Response Error:', error);
          clearTimeout(typingTimeout);
          setIsAiTyping(false);
          
          // Fallback to simple response
          setTimeout(async () => {
            if (soundsEnabled) sounds.messageReceive();
            await postChatMessage(
              getAgentResponse(room.agentId, userMessage),
              undefined, // No wallet for AI
              true,
              room.agentId,
              AI_AGENTS[room.agentId]?.username || room.agentId
            );
          }, 1000);
        }
      }
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
    
    // If switching to an AI room, show their greeting
    const newRoom = chatRooms.find(r => r.username === roomName);
    if (newRoom?.isAI && newRoom.agentId && AI_AGENTS[newRoom.agentId]) {
      const agent = AI_AGENTS[newRoom.agentId];
      const greeting = agent.conversationStarters[Math.floor(Math.random() * agent.conversationStarters.length)];
      
      setTimeout(async () => {
        // Use the room-specific function to ensure greeting goes to the correct room
        await postMessageToRoom(
          roomName, // Explicitly pass the room name
          greeting,
          undefined, // No wallet for AI
          true,
          agent.id,
          agent.username
        );
      }, 500);
    }
  };

  const addEmoji = (emoji: string) => {
    setCurrentMessage(prev => prev + emoji);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user && isCheckingAuth) {
    return (
      <UserSetup>
        <h2>⏳ Checking authentication...</h2>
        <p>Please wait while we verify your connection...</p>
      </UserSetup>
    );
  }

  if (!user) {
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
          Chat Rooms ({chatRooms.filter(r => r.online).length} active)
        </ContactListHeader>
        <MenuList className="react95-menu-list" style={{ 
          overflow: 'hidden',
          '@media (max-width: 768px)': {
            maxHeight: '80px',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }
        } as React.CSSProperties}>
          {chatRooms.map((room) => (
            <ContactItem
              key={room.username}
              online={room.online}
              isSelected={selectedContact === room.username}
              onClick={() => switchToContact(room.username)}
              className="react95-menu-list-item"
            >
              {room.username}
            </ContactItem>
          ))}
        </MenuList>

        <OnlineUsersSection>
          <OnlineUsersHeader>
            Online Users ({onlineUsers.length})
          </OnlineUsersHeader>
          <div>
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
                  <span className="wallet">
                    {user.walletAddress.length > 10 
                      ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                      : user.walletAddress
                    }
                  </span>
                </div>
              </OnlineUserItem>
            ))}
          </div>
        </OnlineUsersSection>
      </ContactList>

      <ChatArea className="chat-area">
        <ChatHeader>
          <span>💬</span>
          <span>{selectedContact}</span>
          {selectedContact !== '💬 General Chat' && (
            <span style={{ fontSize: '9px', opacity: 0.8 }}>
              {chatRooms.find(r => r.username === selectedContact)?.online ? '● Active' : '● Inactive'}
            </span>
          )}
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
          {isAiTyping && (
            <MessageBubble isSystem={true} className="flunks-messenger-message">
              <div className="message-text" style={{ fontStyle: 'italic', color: '#666' }}>
                {(() => {
                  const room = chatRooms.find(r => r.username === selectedContact);
                  if (room?.isAI && room.agentId) {
                    const agent = AI_AGENTS[room.agentId];
                    return `${agent?.username || room.agentId} is typing...`;
                  }
                  return `${selectedContact} is typing...`;
                })()}
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
