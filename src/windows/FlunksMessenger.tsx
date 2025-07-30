import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useWindowsContext } from 'contexts/WindowsContext';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { AI_AGENTS, getAgentResponse } from 'data/aiAgents';
import useMessengerSounds from 'hooks/useMessengerSounds';
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
`;

const ContactList = styled.div`
  width: 200px;
  border-right: 2px inset #c0c0c0;
  display: flex;
  flex-direction: column;
`;

const OnlineUsersSection = styled.div`
  border-top: 1px inset #c0c0c0;
  background: #f0f0f0;
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
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
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
`;

const ChatMessages = styled.div`
  flex: 1;
  background: white;
  padding: 8px;
  overflow-y: auto;
  font-size: 11px;
  font-family: 'Tahoma', sans-serif;
`;

const MessageBubble = styled.div<{ isOwn?: boolean; isSystem?: boolean }>`
  margin-bottom: 8px;
  
  .message-header {
    font-weight: bold;
    color: ${props => props.isSystem ? '#666' : props.isOwn ? '#0066cc' : '#cc0000'};
    margin-bottom: 2px;
  }
  
  .message-text {
    color: ${props => props.isSystem ? '#666' : '#000'};
    font-style: ${props => props.isSystem ? 'italic' : 'normal'};
  }
  
  .message-time {
    font-size: 9px;
    color: #999;
    margin-left: 4px;
  }
`;

const ChatInput = styled.div`
  border-top: 1px solid #999;
  padding: 8px;
  background: #f0f0f0;
  display: flex;
  gap: 8px;
  align-items: center;
`;

const EmojiToolbar = styled.div`
  border-top: 1px solid #999;
  padding: 4px 8px;
  background: #f0f0f0;
  font-size: 16px;
  
  span {
    cursor: pointer;
    margin-right: 8px;
    
    &:hover {
      background: #ddd;
      border-radius: 2px;
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
  text: string;
  timestamp: Date;
  isOwn: boolean;
  isSystem?: boolean;
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
  isCurrentUser?: boolean;
}

const FlunksMessenger: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow } = useWindowsContext();
  const sounds = useMessengerSounds();
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('💬 General Chat');
  const [isTyping, setIsTyping] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Online users tracking - in production this would come from your backend/WebSocket
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  // Mock some online users for demo (in production, this would be real-time data)
  useEffect(() => {
    const mockUsers: OnlineUser[] = [
      { username: 'CoolGeek92', walletAddress: '0x1234...5678' },
      { username: 'PrepQueen', walletAddress: '0x8765...4321' },
      { username: 'JockStar', walletAddress: '0xabcd...efgh' },
      { username: 'FreakShow', walletAddress: '0x9876...1234' },
    ];

    // Add current user if they're logged in
    if (user?.userId) {
      const currentUserName = username || user.email?.split('@')[0] || `User-${user.userId.slice(-4)}`;
      mockUsers.unshift({
        username: currentUserName,
        walletAddress: user.userId,
        isCurrentUser: true
      });
    }

    setOnlineUsers(mockUsers);

    // Simulate users coming online/offline every 30 seconds
    const interval = setInterval(() => {
      const additionalUsers = [
        { username: 'NightOwl', walletAddress: '0xbeef...cafe' },
        { username: 'StudyMaster', walletAddress: '0xdead...beef' },
        { username: 'GameChamp', walletAddress: '0xfeed...face' },
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
    { username: '📚 StudyBuddy Room', online: true, isAI: true, agentId: 'StudyBuddy' },
    { username: '☕ Town Gossip Room', online: true, isAI: true, agentId: 'TownGossip' },
    { username: '💬 General Chat', online: true, isAI: false },
    { username: '🎮 Gaming Lounge', online: true, isAI: false },
    { username: '🏫 Study Hall', online: true, isAI: false },
    { username: '🎵 Music & Chill', online: true, isAI: false },
  ]);

  const emojis = ['😀', '😂', '😍', '😭', '😎', '🤔', '👍', '👎', '❤️', '🔥'];

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
      
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        username: 'System',
        text: `Welcome to Flunks Messenger, ${tempUsername}! 🎉`,
        timestamp: new Date(),
        isOwn: false,
        isSystem: true
      };
      setMessages([welcomeMessage]);
    }
  };

  const sendMessage = () => {
    if (currentMessage.trim() && username) {
      // Play send sound
      if (soundsEnabled) sounds.messageSend();
      
      const newMessage: Message = {
        id: Date.now().toString(),
        username: username,
        text: currentMessage.trim(),
        timestamp: new Date(),
        isOwn: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');
      setIsTyping(false);

      // Simulate AI response for AI rooms
      const room = chatRooms.find(r => r.username === selectedContact);
      if (room?.isAI && room.agentId && AI_AGENTS[room.agentId]) {
        setTimeout(() => {
          if (soundsEnabled) sounds.messageReceive(); // Play receive sound for AI response
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            username: room.agentId,
            text: getAgentResponse(room.agentId, currentMessage.trim()),
            timestamp: new Date(),
            isOwn: false
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000 + Math.random() * 2000);
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
    // Clear messages when switching rooms for demo purposes
    setMessages([]);
    setSelectedContact(roomName);
    
    // If switching to an AI room, show their greeting
    const room = chatRooms.find(r => r.username === roomName);
    if (room?.isAI && room.agentId && AI_AGENTS[room.agentId]) {
      const agent = AI_AGENTS[room.agentId];
      const greeting = agent.conversationStarters[Math.floor(Math.random() * agent.conversationStarters.length)];
      
      setTimeout(() => {
        const greetingMessage: Message = {
          id: `greeting-${Date.now()}`,
          username: room.agentId,
          text: greeting,
          timestamp: new Date(),
          isOwn: false
        };
        
        setMessages(prev => [...prev, greetingMessage]);
      }, 500);
    }
  };

  const addEmoji = (emoji: string) => {
    setCurrentMessage(prev => prev + emoji);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user && !demoMode) {
    return (
      <UserSetup>
        <h2>🔒 Connect Wallet to Chat</h2>
        <p>Please connect your wallet to access Flunks Messenger</p>
        <div style={{ marginTop: '20px' }}>
          <Button onClick={() => setDemoMode(true)}>
            🎮 Try Demo Mode
          </Button>
          <p style={{ fontSize: '10px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
            Demo mode lets you explore the chat interface without connecting a wallet
          </p>
        </div>
      </UserSetup>
    );
  }

  if (!username) {
    return (
      <UserSetup>
        <h2>👋 Welcome to Flunks Messenger! {demoMode && '(Demo Mode)'}</h2>
        <div className="setup-form">
          <Frame variant="field" style={{ width: '100%' }}>
            <TextField
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Enter your username..."
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
            Choose something fun but appropriate! 😊
            {demoMode && (
              <>
                <br />
                <strong>🎮 Demo Mode Active</strong> - This is a preview of the chat interface
              </>
            )}
          </p>
        </div>
      </UserSetup>
    );
  }

  return (
    <MessengerContainer>
      <ContactList>
        <ContactListHeader>
          Chat Rooms ({chatRooms.filter(r => r.online).length} active)
        </ContactListHeader>
        <MenuList>
          {chatRooms.map((room) => (
            <ContactItem
              key={room.username}
              online={room.online}
              isSelected={selectedContact === room.username}
              onClick={() => switchToContact(room.username)}
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
                <span className="username">
                  {user.isCurrentUser ? `${user.username} (You)` : user.username}
                </span>
                <span className="wallet">
                  {user.walletAddress.length > 10 
                    ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}`
                    : user.walletAddress
                  }
                </span>
              </OnlineUserItem>
            ))}
          </div>
        </OnlineUsersSection>
      </ContactList>

      <ChatArea>
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

        <ChatMessages>
          {messages.map((message) => (
            <MessageBubble key={message.id} isOwn={message.isOwn} isSystem={message.isSystem}>
              <div className="message-header">
                {message.username}
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
              <div className="message-text">{message.text}</div>
            </MessageBubble>
          ))}
          {isTyping && (
            <MessageBubble isSystem={true}>
              <div className="message-text" style={{ fontStyle: 'italic', color: '#666' }}>
                You are typing...
              </div>
            </MessageBubble>
          )}
          <div ref={messagesEndRef} />
        </ChatMessages>

        <EmojiToolbar>
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
