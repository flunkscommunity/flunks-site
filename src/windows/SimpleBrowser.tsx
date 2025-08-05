import React, { useState, useRef } from 'react';
import styled from 'styled-components';
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
  Toolbar,
  Separator
} from 'react95';

const BrowserContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
`;

const NavigationBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-bottom: 2px inset #c0c0c0;
  background: #c0c0c0;
`;

const AddressBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const BrowserFrame = styled.iframe`
  flex: 1;
  border: none;
  background: white;
  width: 100%;
  height: 100%;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: white;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 14px;
`;

const SimpleBrowser: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const [url, setUrl] = useState('https://example.com');
  const [currentUrl, setCurrentUrl] = useState('https://example.com');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = () => {
    if (url) {
      setIsLoading(true);
      setCurrentUrl(url);
      // Add protocol if missing
      const finalUrl = url.startsWith('http') ? url : `https://${url}`;
      setCurrentUrl(finalUrl);
      setUrl(finalUrl);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  const handleBack = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.back();
      } catch (error) {
        console.log('Cannot go back in iframe');
      }
    }
  };

  const handleForward = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.history.forward();
      } catch (error) {
        console.log('Cannot go forward in iframe');
      }
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleHome = () => {
    const homeUrl = 'https://www.google.com';
    setUrl(homeUrl);
    setCurrentUrl(homeUrl);
    setIsLoading(true);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    // Try to update the address bar with the current URL
    try {
      if (iframeRef.current?.contentWindow?.location.href) {
        const loadedUrl = iframeRef.current.contentWindow.location.href;
        if (loadedUrl !== 'about:blank') {
          setUrl(loadedUrl);
        }
      }
    } catch (error) {
      // Cross-origin restrictions prevent access to iframe location
      console.log('Cannot access iframe location due to CORS');
    }
  };

  const quickLinks = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'MDN', url: 'https://developer.mozilla.org' }
  ];

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.BROWSER}
      headerTitle="Simple Browser"
      headerIcon="/images/icons/programs.png"
      onClose={() => closeWindow(WINDOW_IDS.BROWSER)}
      initialWidth="800px"
      initialHeight="600px"
      resizable={true}
    >
      <BrowserContainer>
        <NavigationBar>
          <Button
            onClick={handleBack}
            disabled={!canGoBack}
            style={{ minWidth: '60px' }}
          >
            ← Back
          </Button>
          
          <Button
            onClick={handleForward}
            disabled={!canGoForward}
            style={{ minWidth: '60px' }}
          >
            Forward →
          </Button>
          
          <Button
            onClick={handleRefresh}
            style={{ minWidth: '60px' }}
          >
            🔄 Refresh
          </Button>
          
          <Button
            onClick={handleHome}
            style={{ minWidth: '60px' }}
          >
            🏠 Home
          </Button>
          
          <Separator orientation="vertical" />
          
          <AddressBar>
            <span style={{ fontFamily: 'MS Sans Serif', fontSize: '11px', marginRight: '4px' }}>
              Address:
            </span>
            <TextField
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ flex: 1 }}
              placeholder="Enter URL..."
            />
            <Button onClick={handleNavigate} style={{ minWidth: '50px' }}>
              Go
            </Button>
          </AddressBar>
        </NavigationBar>

        <Frame style={{ margin: '8px', padding: '4px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '8px' }}>
            <span style={{ fontFamily: 'MS Sans Serif', fontSize: '11px', marginRight: '8px' }}>
              Quick Links:
            </span>
            {quickLinks.map((link) => (
              <Button
                key={link.name}
                onClick={() => {
                  setUrl(link.url);
                  setCurrentUrl(link.url);
                  setIsLoading(true);
                }}
                size="sm"
                style={{ marginRight: '4px', fontSize: '10px' }}
              >
                {link.name}
              </Button>
            ))}
          </div>
          
          <div style={{ flex: 1, border: '2px inset #c0c0c0', background: 'white' }}>
            {isLoading && (
              <LoadingIndicator>
                Loading {currentUrl}...
              </LoadingIndicator>
            )}
            
            <BrowserFrame
              ref={iframeRef}
              src={currentUrl}
              onLoad={handleIframeLoad}
              style={{ display: isLoading ? 'none' : 'block' }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              title="Browser Content"
            />
          </div>
          
          <div style={{ 
            marginTop: '4px', 
            padding: '4px', 
            fontSize: '10px', 
            fontFamily: 'MS Sans Serif',
            borderTop: '1px solid #808080',
            background: '#f0f0f0'
          }}>
            Status: {isLoading ? 'Loading...' : 'Done'}
          </div>
        </Frame>
      </BrowserContainer>
    </DraggableResizeableWindow>
  );
};

export default SimpleBrowser;
