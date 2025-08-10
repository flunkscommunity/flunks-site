import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import useWindowSize from 'hooks/useWindowSize';

interface ViewportInfo {
  innerWidth: number;
  innerHeight: number;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  userAgent: string;
  isTouch: boolean;
}

const MobileTestPage: React.FC = () => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null);
  const [showWindow, setShowWindow] = useState(false);
  const { width, height, isMobile } = useWindowSize();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateInfo = () => {
        setViewportInfo({
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          screenWidth: screen.width,
          screenHeight: screen.height,
          devicePixelRatio: window.devicePixelRatio || 1,
          userAgent: navigator.userAgent,
          isTouch: 'ontouchstart' in window,
        });
      };

      updateInfo();
      window.addEventListener('resize', updateInfo);
      window.addEventListener('orientationchange', updateInfo);
      
      return () => {
        window.removeEventListener('resize', updateInfo);
        window.removeEventListener('orientationchange', updateInfo);
      };
    }
  }, []);

  const testIcons = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: `Test App ${i + 1}`,
    color: `hsl(${(i * 360) / 20}, 70%, 50%)`,
  }));

  return (
    <>
      <Head>
        <title>Mobile Test - Flunks 95</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="Mobile viewport test page for Flunks 95" />
        <link rel="icon" href="/flunks-logo.png" />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #008080, #004040)',
        color: 'white',
        fontFamily: 'sans-serif',
        overflow: 'auto',
        position: 'relative',
      }}>
        {/* Viewport Info */}
        {viewportInfo && (
          <div style={{
            position: 'fixed',
            top: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.8)',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 1000,
            lineHeight: 1.3,
            maxWidth: '250px',
          }}>
            <div><strong>Viewport Debug</strong></div>
            <div>Window: {viewportInfo.innerWidth} × {viewportInfo.innerHeight}</div>
            <div>Screen: {viewportInfo.screenWidth} × {viewportInfo.screenHeight}</div>
            <div>Ratio: {viewportInfo.devicePixelRatio}</div>
            <div>Hook: {width} × {height}</div>
            <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
            <div>Touch: {viewportInfo.isTouch ? 'Yes' : 'No'}</div>
          </div>
        )}

        <div style={{ padding: '20px 20px 100px 20px' }}>
          <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>Mobile Desktop Test</h1>
          <p style={{ marginBottom: '20px', opacity: 0.9 }}>
            Testing icon layout and scrolling behavior on mobile. 
            Icons should be arranged in a grid and the page should scroll when content exceeds viewport.
          </p>

          {/* Test Controls */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <h2 style={{ fontSize: '18px', marginBottom: '10px' }}>Test Controls</h2>
            <button
              onClick={() => setShowWindow(!showWindow)}
              style={{
                background: '#0078d4',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                cursor: 'pointer',
                marginRight: '10px',
              }}
            >
              {showWindow ? 'Close' : 'Open'} Test Window
            </button>
            <a 
              href="/" 
              style={{
                background: '#107c10',
                color: 'white',
                textDecoration: 'none',
                padding: '10px 20px',
                borderRadius: '4px',
                fontSize: '14px',
                display: 'inline-block',
              }}
            >
              Back to Main App
            </a>
          </div>

          {/* Desktop Icons Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '20px',
            maxWidth: '100%',
            width: '100%',
          }}>
            {testIcons.map((icon) => (
              <div
                key={icon.id}
                onClick={() => console.log(`Clicked ${icon.name}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '15px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, background 0.2s',
                  minHeight: '120px',
                  justifyContent: 'center',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: icon.color,
                  borderRadius: '8px',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}>
                  {icon.id}
                </div>
                <span style={{
                  fontSize: '14px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}>
                  {icon.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Window */}
        {showWindow && (
          <div style={{
            position: 'fixed',
            top: 50,
            left: 10,
            right: 10,
            bottom: 10,
            background: '#c0c0c0',
            border: '2px outset #c0c0c0',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #0000ff, #000080)',
              color: 'white',
              padding: '4px 8px',
              fontWeight: 'bold',
              fontSize: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>Test Window - Mobile Constraint Check</span>
              <button
                onClick={() => setShowWindow(false)}
                style={{
                  background: '#c0c0c0',
                  border: '1px outset #c0c0c0',
                  fontSize: '12px',
                  padding: '2px 6px',
                  cursor: 'pointer',
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              padding: '15px',
              height: '100%',
              overflow: 'auto',
              background: '#f0f0f0',
              color: '#000',
            }}>
              <h3>Scrollable Content Test</h3>
              <p>This window should be constrained within the mobile viewport and scrollable.</p>
              <div style={{ height: '200vh', background: 'linear-gradient(to bottom, red, orange, yellow, green, blue, indigo, violet)' }}>
                <div style={{ padding: '20px', color: 'white', fontWeight: 'bold' }}>
                  <p>Line 1 - Start of scroll test</p>
                  {Array.from({ length: 50 }, (_, i) => (
                    <p key={i}>Line {i + 2} - Testing scroll behavior...</p>
                  ))}
                  <p>End of scroll test - This should be reachable by scrolling</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileTestPage;
