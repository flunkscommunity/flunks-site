import React, { useEffect } from 'react';
import * as fcl from '@onflow/fcl';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import FlappyLeaderboardWindow from './FlappyLeaderboardWindow';

const FlappyFlunkWindow: React.FC = () => {
  const { openWindow, closeWindow } = useWindowsContext();

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'FLAPPY_SCORE') {
        const score = event.data.score;
        fcl.currentUser().snapshot().then((user: any) => {
          const wallet = user?.addr;
          if (!wallet) return;
          fetch('/api/flappyflunk-score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet, score }),
          });
        });
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const openLeaderboard = () => {
    openWindow({
      key: WINDOW_IDS.FLAPPY_FLUNK_LEADERBOARD,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FLAPPY_FLUNK_LEADERBOARD}
          onClose={() => closeWindow(WINDOW_IDS.FLAPPY_FLUNK_LEADERBOARD)}
          headerTitle="Leaderboard"
          initialWidth="320px"
          initialHeight="400px"
          headerIcon="/images/icons/flappyflunk.png"
        >
          <FlappyLeaderboardWindow />
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="flex flex-col h-full w-full">
      <iframe
        src="/Games/FlappyFlunk/index.html"
        title="Flappy Flunk"
        style={{ width: '100%', height: '100%', border: 'none' }}
      />
      <button
        onClick={openLeaderboard}
        className="mt-2 px-2 py-1 bg-blue-500 text-white"
      >
        Leaderboard
      </button>
    </div>
  );
};

export default FlappyFlunkWindow;
