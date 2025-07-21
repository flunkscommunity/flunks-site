import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useWindowsContext } from 'contexts/WindowsContext';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
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

const ContactListHeader = styled.div`
  background: linear-gradient(90deg, #1084d0, #0066cc);
  color: white;
  padding: 8px;
  font-weight: bold;
  font-size: 11px;
`;

const ContactItem = styled.div<{ online?: boolean }>`
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 11px;
  
  &:hover {
    background: #316ac5;
    color: white;
  }
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: ${props => props.online ? '#00ff00' : '#ff0000'};
    margin-right: 8px;
    border: 1px solid #333;
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
}

const FlunksMessenger: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow } = useWindowsContext();
  const [username, setUsername] = useState('');
  const [tempUsername, setTempUsername] = useState('');
  const [demoMode, setDemoMode] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedContact, setSelectedContact] = useState<string>('General Chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock contacts - in production these would come from your backend
  const [contacts] = useState<Contact[]>([
    { username: 'FlunkBot', online: true, isAI: true },
    { username: 'StudyBuddy', online: true, isAI: true },
    { username: 'CoolGeek92', online: true },
    { username: 'PrepQueen', online: false },
    { username: 'JockStar', online: true },
    { username: 'FreakShow', online: false },
  ]);

  const emojis = ['😀', '😂', '😍', '😭', '😎', '🤔', '👍', '👎', '❤️', '🔥'];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUsernameSubmit = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
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
      const newMessage: Message = {
        id: Date.now().toString(),
        username: username,
        text: currentMessage.trim(),
        timestamp: new Date(),
        isOwn: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage('');

      // Simulate AI response for AI contacts
      if (selectedContact === 'FlunkBot') {
        setTimeout(() => {
          const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            username: 'FlunkBot',
            text: getAIResponse(currentMessage.trim()),
            timestamp: new Date(),
            isOwn: false
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000 + Math.random() * 2000);
      }
    }
  };

  const getAIResponse = (userMessage: string): string => {
    const responses = [
      "That's really interesting! Tell me more! 🤔",
      "I totally understand what you mean! 😊",
      "Have you tried checking out the other areas in Flunks? 🎮",
      "That reminds me of my favorite class in school! 📚",
      "You should definitely explore more of the Flunks universe! ✨",
      "I'm just a bot, but I think that's pretty cool! 🤖",
      "Want to know a secret about the Flunks world? 👀"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
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
          Contacts ({contacts.filter(c => c.online).length} online)
        </ContactListHeader>
        <MenuList>
          <MenuListItem
            onClick={() => setSelectedContact('General Chat')}
            style={{ 
              backgroundColor: selectedContact === 'General Chat' ? '#316ac5' : 'transparent',
              color: selectedContact === 'General Chat' ? 'white' : 'black'
            }}
          >
            💬 General Chat
          </MenuListItem>
          <Separator />
          {contacts.map((contact) => (
            <ContactItem
              key={contact.username}
              online={contact.online}
              onClick={() => setSelectedContact(contact.username)}
              style={{
                backgroundColor: selectedContact === contact.username ? '#316ac5' : 'transparent',
                color: selectedContact === contact.username ? 'white' : 'black'
              }}
            >
              {contact.isAI ? '🤖' : '👤'} {contact.username}
            </ContactItem>
          ))}
        </MenuList>
      </ContactList>

      <ChatArea>
        <ChatHeader>
          <span>💬</span>
          <span>{selectedContact}</span>
          {selectedContact !== 'General Chat' && (
            <span style={{ fontSize: '9px', opacity: 0.8 }}>
              {contacts.find(c => c.username === selectedContact)?.online ? '● Online' : '● Offline'}
            </span>
          )}
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
            onChange={(e) => setCurrentMessage(e.target.value)}
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
