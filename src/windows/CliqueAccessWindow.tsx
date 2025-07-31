import React, { useState } from 'react';
import { Button, Frame, Window, WindowHeader, WindowContent } from 'react95';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import { CliqueAccessPanel } from 'components/CliqueAccess/CliqueAccessPanel';
import { CliqueType } from 'hooks/useCliqueAccess';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import Semester0Map from './Semester0Map';

const CliqueAccessWindow: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();

  const handleCliqueClick = (clique: CliqueType) => {
    // Open Semester Zero map when a clique is clicked
    openWindow({
      key: WINDOW_IDS.SEMESTER_0,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.SEMESTER_0}
          onClose={() => closeWindow(WINDOW_IDS.SEMESTER_0)}
          initialWidth="100%"
          initialHeight="100%"
          resizable={false}
          headerTitle="semester zero"
          headerIcon="/images/icons/semester0-icon.png"
        >
          <Semester0Map onClose={() => closeWindow(WINDOW_IDS.SEMESTER_0)} />
        </DraggableResizeableWindow>
      ),
    });
    
    // Close this window
    closeWindow(WINDOW_IDS.CLIQUE_ACCESS);
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.CLIQUE_ACCESS}
      headerTitle="Clique Access Status"
      headerIcon="/images/icons/high-school-icon.png"
      onClose={() => closeWindow(WINDOW_IDS.CLIQUE_ACCESS)}
      initialWidth="400px"
      initialHeight="500px"
      resizable={true}
    >
      <div className="p-4 h-full">
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">🏠 House Access System</h2>
          <p className="text-sm text-gray-600 mb-4">
            In Semester Zero, each clique has their own exclusive house. 
            You must own an NFT with the corresponding clique trait to gain access.
          </p>
        </div>

        <CliqueAccessPanel 
          showTitle={false} 
          onCliqueClick={handleCliqueClick}
        />

        <div className="mt-6 p-3 bg-blue-100 border border-blue-400 rounded">
          <h4 className="font-bold mb-2">💡 Tips:</h4>
          <ul className="text-sm space-y-1">
            <li>• Each clique house has unique rooms and secrets</li>
            <li>• Houses are only accessible to clique members</li>
            <li>• Click on an accessible house above to explore</li>
            <li>• Collect different clique NFTs to access all houses</li>
          </ul>
        </div>

        <div className="mt-4 flex gap-2">
          <Button 
            onClick={() => handleCliqueClick('GEEK')}
            className="flex-1"
          >
            Open Map
          </Button>
          <Button 
            onClick={() => closeWindow(WINDOW_IDS.CLIQUE_ACCESS)}
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </div>
    </DraggableResizeableWindow>
  );
};

export default CliqueAccessWindow;
