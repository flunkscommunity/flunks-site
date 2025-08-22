import React from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Frame, Button } from 'react95';

interface OnlyflunksDebuggerProps {
  paginatedItemsError?: Error | null;
  allItems?: any[];
  flunksCount?: number;
  backpacksCount?: number;
}

const OnlyflunksDebugger: React.FC<OnlyflunksDebuggerProps> = ({
  paginatedItemsError,
  allItems = [],
  flunksCount = 0,
  backpacksCount = 0
}) => {
  const { user, primaryWallet } = useDynamicContext();

  return (
    <Frame variant="well" className="p-3 mb-4">
      <h4 className="text-sm font-bold mb-2">🔧 OnlyFlunks Debug Info</h4>
      
      <div className="text-xs space-y-1">
        <div><strong>User:</strong> {user ? '✅ Connected' : '❌ Not connected'}</div>
        <div><strong>Wallet:</strong> {primaryWallet ? '✅ Connected' : '❌ Not connected'}</div>
        <div><strong>Wallet Address:</strong> {primaryWallet?.address || 'None'}</div>
        <div><strong>Connector:</strong> {primaryWallet?.connector?.name || 'None'}</div>
        
        <hr className="my-2" />
        
        <div><strong>Paginated Items Error:</strong> {paginatedItemsError ? `❌ ${paginatedItemsError.message}` : '✅ No error'}</div>
        <div><strong>All Items Count:</strong> {allItems.length}</div>
        <div><strong>Flunks Count:</strong> {flunksCount}</div>
        <div><strong>Backpacks Count:</strong> {backpacksCount}</div>
        <div><strong>Total Items:</strong> {flunksCount + backpacksCount}</div>
        
        <hr className="my-2" />
        
        <div><strong>Sample Item:</strong></div>
        {allItems.length > 0 ? (
          <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
            {JSON.stringify(allItems[0], null, 2)}
          </pre>
        ) : (
          <div className="text-gray-500">No items to display</div>
        )}
      </div>
      
      <Button 
        size="sm" 
        className="mt-2"
        onClick={() => {
          console.log('🔍 OnlyFlunks Manual Debug:', {
            user,
            primaryWallet,
            paginatedItemsError,
            allItems,
            flunksCount,
            backpacksCount
          });
        }}
      >
        Log Debug Info to Console
      </Button>
    </Frame>
  );
};

export default OnlyflunksDebugger;
