import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame, Button } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import AppLoader from "components/AppLoader";
import { AndroidOptimizations } from "components/AndroidOptimizations";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { usePaginatedItems } from "contexts/UserPaginatedItems";
import { useState } from "react";

const Onlyflunks: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();
  const { user, primaryWallet } = useDynamicContext();
  const { allItems, flunksCount, backpacksCount } = usePaginatedItems();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter items for display (show first 8 items for preview)
  const displayItems = allItems.slice(0, 8);
  const totalItemsCount = flunksCount + backpacksCount;

  // Use the same authentication check as other components - just check for wallet address
  const isAuthenticated = !!primaryWallet?.address;

  // Debug logging
  console.log('🧠 OnlyFlunks Authentication State:', {
    user: !!user,
    primaryWallet: !!primaryWallet,
    walletAddress: primaryWallet?.address,
    isAuthenticated,
    totalItemsCount,
    allItemsLength: allItems.length
  });

  return (
    <AppLoader bgImage="/images/loading/bootup.webp">
      <AndroidOptimizations />
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="OnlyFlunks"
        windowsId={WINDOW_IDS.FLUNKS_HUB}
        onClose={() => closeWindow(WINDOW_IDS.FLUNKS_HUB)}
        initialWidth="600px"
        initialHeight="500px"
        headerIcon="/images/icons/onlyflunks.png"
      >
        <Frame variant="inside" className="p-4 h-full w-full flex flex-col items-start gap-4">
          {!isAuthenticated ? (
            // Show wallet connection UI when user is not authenticated
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <h3>🔒 Connect Wallet to Access OnlyFlunks</h3>
              <p className="text-center">
                OnlyFlunks requires wallet authentication to access premium content and features.
              </p>
              <div className="flex flex-col items-center gap-4">
                <DynamicWidget />
                <p className="text-xs opacity-70 text-center">
                  Supported: Flow Wallet, Lilico, Dapper, Blocto
                </p>
              </div>
              <div className="text-xs text-center p-4 bg-gray-100 rounded">
                <strong>Debug Info:</strong><br />
                User: {user ? '✅' : '❌'}<br />
                Wallet: {primaryWallet ? '✅' : '❌'}<br />
                Address: {primaryWallet?.address || 'None'}
              </div>
            </div>
          ) : (
            // Show OnlyFlunks content when authenticated
            <>
              <div className="flex items-center justify-between w-full">
                <h3>🧠 Welcome to OnlyFlunks</h3>
                <div className="text-sm text-green-600">
                  ✅ {primaryWallet.address?.slice(0, 8)}...
                </div>
              </div>
              
              <div className="flex items-center justify-between w-full">
                <p>Your collection: {totalItemsCount} items ({flunksCount} Flunks, {backpacksCount} Backpacks)</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={viewMode === 'grid' ? 'default' : 'flat'}
                    onClick={() => setViewMode('grid')}
                  >
                    🔲 Grid
                  </Button>
                  <Button 
                    size="sm" 
                    variant={viewMode === 'list' ? 'default' : 'flat'}
                    onClick={() => setViewMode('list')}
                  >
                    📄 List
                  </Button>
                </div>
              </div>
              
              {totalItemsCount === 0 ? (
                <div className="w-full h-32 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-300">
                  <div className="text-4xl">🎒</div>
                  <p className="text-center text-gray-600">
                    No Flunks or Backpack items found in your wallet.<br />
                    <small>Make sure your wallet contains Flunks NFTs to access premium content.</small>
                  </p>
                </div>
              ) : (
                <>
                  {viewMode === 'grid' ? (
                    // Grid View - 4 columns for images
                    <div className="grid grid-cols-4 gap-2 w-full mt-4">
                      {displayItems.map((item, index) => (
                        <Frame 
                          key={`${item.collection}-${item.serialNumber}`}
                          variant="well" 
                          className="!p-1 cursor-pointer md:hover:bg-gray-100 transition-colors active:bg-gray-200"
                          onClick={() => {
                            // Open detailed item view
                            openWindow({
                              key: `${WINDOW_IDS.ONLYFLUNKS_ITEM}${item.serialNumber}`,
                              window: (
                                <div>Item details for {item.collection} #{item.serialNumber}</div>
                              )
                            });
                          }}
                        >
                          <img
                            src={item.MetadataViewsDisplay?.thumbnail?.url || '/images/placeholder-nft.png'}
                            alt={`${item.collection} #${item.serialNumber}`}
                            className="w-full h-16 object-cover bg-gray-200 select-none pointer-events-none"
                            style={{
                              imageRendering: "auto",
                            }}
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-nft.png';
                            }}
                          />
                          <div className="text-xs text-center mt-1 truncate">
                            {item.collection} #{item.serialNumber}
                          </div>
                        </Frame>
                      ))}
                    </div>
                  ) : (
                    // List View
                    <div className="w-full space-y-2 mt-4">
                      {displayItems.map((item, index) => (
                        <Frame 
                          key={`${item.collection}-${item.serialNumber}`}
                          variant="field"
                          className="!p-2 cursor-pointer md:hover:bg-gray-100 transition-colors active:bg-gray-200 flex items-center gap-3"
                          onClick={() => {
                            // Open detailed item view
                            openWindow({
                              key: `${WINDOW_IDS.ONLYFLUNKS_ITEM}${item.serialNumber}`,
                              window: (
                                <div>Item details for {item.collection} #{item.serialNumber}</div>
                              )
                            });
                          }}
                        >
                          <img
                            src={item.MetadataViewsDisplay?.thumbnail?.url || '/images/placeholder-nft.png'}
                            alt={`${item.collection} #${item.serialNumber}`}
                            className="w-12 h-12 object-cover bg-gray-200 select-none pointer-events-none flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/images/placeholder-nft.png';
                            }}
                          />
                          <div className="flex-grow">
                            <div className="font-bold text-sm">
                              {item.collection} #{item.serialNumber}
                            </div>
                            <div className="text-xs text-gray-600">
                              {item.collection === 'Flunks' ? '🎓 Flunk NFT' : '🎒 Backpack Item'}
                            </div>
                          </div>
                          <Button size="sm">View</Button>
                        </Frame>
                      ))}
                    </div>
                  )}
                  
                  {totalItemsCount > 8 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-center">
                      <p className="text-sm mb-2">
                        Showing 8 of {totalItemsCount} items. 
                      </p>
                      <Button onClick={() => openWindow({
                        key: WINDOW_IDS.USER_PROFILE,
                        window: <div>User Profile window would open here</div>
                      })}>
                        🎯 View All Items
                      </Button>
                    </div>
                  )}
                </>
              )}
              
              <p className="mt-4 text-center text-sm text-gray-600">
                🚀 Premium features coming soon: quests, upgrades, and secret missions.
              </p>
            </>
          )}
        </Frame>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default Onlyflunks;
