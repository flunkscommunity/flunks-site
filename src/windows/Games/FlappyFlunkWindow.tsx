// src/windows/Games/FlappyFlunkWindow.tsx

import React from 'react';

const FlappyFlunkWindow: React.FC = () => {
  return (
    <iframe
      src="/Games/FlappyBird/index.html"
      title="Flappy Flunk"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
      }}
    />
  );
};

export default FlappyFlunkWindow;
