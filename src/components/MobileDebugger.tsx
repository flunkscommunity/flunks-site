import React, { useEffect, useState } from 'react';
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

const MobileDebugger: React.FC = () => {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo | null>(null);
  const [showDebugger, setShowDebugger] = useState(false);
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

  // Only show on mobile or when manually toggled
  if (!isMobile && !showDebugger) {
    return (
      <button
        onClick={() => setShowDebugger(true)}
        style={{
          position: 'fixed',
          top: 10,
          right: 10,
          zIndex: 9999,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: '1px solid white',
          padding: '4px 8px',
          fontSize: '10px',
        }}
      >
        Debug
      </button>
    );
  }

  if (!viewportInfo) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px',
        borderRadius: '4px',
        fontSize: '10px',
        fontFamily: 'monospace',
        zIndex: 9999,
        lineHeight: 1.2,
        maxWidth: '200px',
      }}
      onClick={() => setShowDebugger(false)}
    >
      <div><strong>Viewport Debug</strong></div>
      <div>Window: {viewportInfo.innerWidth} × {viewportInfo.innerHeight}</div>
      <div>Screen: {viewportInfo.screenWidth} × {viewportInfo.screenHeight}</div>
      <div>Ratio: {viewportInfo.devicePixelRatio}</div>
      <div>Hook: {width} × {height}</div>
      <div>Mobile: {isMobile ? 'Yes' : 'No'}</div>
      <div>Touch: {viewportInfo.isTouch ? 'Yes' : 'No'}</div>
      <div style={{ fontSize: '8px', marginTop: '4px', wordBreak: 'break-all' }}>
        UA: {viewportInfo.userAgent.slice(0, 50)}...
      </div>
      <div style={{ fontSize: '8px', marginTop: '4px', color: '#ccc' }}>
        Click to hide
      </div>
    </div>
  );
};

export default MobileDebugger;
