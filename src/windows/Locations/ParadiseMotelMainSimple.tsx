import React, { useState } from 'react';
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import MaidDialogue from "components/MaidDialogue";
import StoryManual from "components/StoryManual";
import { WINDOW_IDS } from "fixed";
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../../contexts/UnifiedWalletContext';
import SetupCollectionButton from '../../components/SetupCollectionButton';
import * as fcl from '@onflow/fcl';
// Ensure FCL is properly configured for mainnet
import '../../config/fcl';

// Room 1 Bell Component
interface Room1BellComponentProps {
  onClose: () => void;
  wallet?: string;
}

const Room1BellComponent: React.FC<Room1BellComponentProps> = ({ onClose, wallet }) => {
  const [ringCount, setRingCount] = useState(0);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');

  const handleBellRing = () => {
    setRingCount(prev => prev + 1);
  };

  const handleClaimGum = async () => {
    if (!wallet) {
      setClaimMessage('❌ Please connect your wallet first');
      return;
    }

    setClaiming(true);
    setClaimMessage('');

    try {
      const response = await fetch('/api/claim-room-1-bell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: wallet }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimed(true);
        setClaimMessage(`🎉 ${data.message || 'You claimed 100 GUM!'}`);
      } else {
        setClaimMessage(`⚠️ ${data.message || 'Already claimed or cooldown active'}`);
      }
    } catch (error) {
      console.error('Error claiming GUM:', error);
      setClaimMessage('❌ Error claiming GUM. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const getMessage = () => {
    if (ringCount === 0) return "There's a bell on the desk. Maybe you should ring it?";
    if (ringCount >= 1 && ringCount <= 3) return "Please ring only once, thanks management";
    if (ringCount >= 4 && ringCount <= 9) return "Seriously, stop";
    if (ringCount >= 10) return "Fine! Here's your reward. Happy now?";
    return "";
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_1}
      headerTitle="Paradise Motel - Lobby Bell"
      onClose={onClose}
      initialWidth="450px"
      initialHeight="600px"
      resizable={false}
    >
      <div className="w-full h-full bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-3 flex flex-col items-center justify-between overflow-hidden">
        {/* Room Description */}
        <div className="bg-black bg-opacity-50 p-3 rounded-lg max-w-full flex-shrink-0">
          <p className="text-amber-100 text-center text-sm font-serif leading-snug">
            {getMessage()}
          </p>
        </div>

        {/* Bell Display */}
        <div className="text-7xl my-2 animate-bounce flex-shrink-0">
          🔔
        </div>

        {/* Ring Bell Button */}
        {!claimed && (
          <button
            onClick={handleBellRing}
            className="bg-gradient-to-br from-amber-500 to-orange-700 hover:from-amber-400 hover:to-orange-600 text-white px-6 py-3 rounded-lg border-3 border-amber-300 hover:border-amber-200 transition-all duration-300 hover:scale-110 text-lg font-black shadow-2xl flex-shrink-0"
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            🔔 Ring Bell
          </button>
        )}

        {/* Claim GUM Button - Shows at 10 rings */}
        {ringCount >= 10 && !claimed && (
          <button
            onClick={handleClaimGum}
            disabled={claiming || !wallet}
            className={`bg-gradient-to-br from-green-500 to-emerald-700 hover:from-green-400 hover:to-emerald-600 text-white px-6 py-3 rounded-lg border-3 border-green-300 hover:border-green-200 transition-all duration-300 hover:scale-110 text-lg font-black shadow-2xl flex-shrink-0 ${
              claiming || !wallet ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            {claiming ? '⏳ Claiming...' : '💰 Claim 100 GUM'}
          </button>
        )}

        {/* Claim Message */}
        {claimMessage && (
          <div className={`p-3 rounded-lg text-center font-bold flex-shrink-0 ${
            claimMessage.includes('🎉') ? 'bg-green-500' : 'bg-red-500'
          }`}>
            {claimMessage}
          </div>
        )}
      </div>
    </DraggableResizeableWindow>
  );
};

// Simplified Paradise Motel component with proper buttons
const ParadiseMotelMainSimple = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  const effectiveWallet = primaryWallet;
  const walletAddress = unifiedAddress || primaryWallet?.address;

  // Get current hour for day/night logic (6 AM - 6 PM is daytime)
  const now = new Date();
  const hour = now.getHours();
  const isDayTime = hour >= 6 && hour < 18;

  // Function to open Room 1 with image
  const openRoom1 = () => {
    const roomImage = "/images/locations/paradise motel/room-1.png";

    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_ROOM_1,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_1}
          headerTitle="Paradise Motel - Room 1"
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_1)}
          initialWidth="80vw"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={roomImage}
              alt="Paradise Motel Room 1"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/images/backdrops/BLANK.png";
              }}
            />
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Function to open Room 6 with image
  const openRoom6 = () => {
    const roomImage = "/images/locations/paradise motel/room-6.png";

    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_ROOM_6,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_6}
          headerTitle="Paradise Motel - Room 6"
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_6)}
          initialWidth="80vw"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={roomImage}
              alt="Paradise Motel Room 6"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/images/backdrops/BLANK.png";
              }}
            />
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Function to open Room 7 based on time of day and key status
  const openRoom7 = async () => {
    if (isDayTime) {
      // During day: show room-7-day.png (locked with police tape)
      openWindow({
        key: WINDOW_IDS.PARADISE_MOTEL_ROOM_7,
        window: (
          <DraggableResizeableWindow
            windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_7}
            headerTitle="Paradise Motel - Room 7"
            onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_7)}
            initialWidth="80vw"
            initialHeight="80vh"
            resizable={true}
          >
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src="/images/locations/paradise motel/room-7-day.png"
                alt="Paradise Motel Room 7 (Day - Locked)"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
          </DraggableResizeableWindow>
        ),
      });
      return;
    }

    // NIGHT TIME: Check if user has the key
    if (!effectiveWallet?.address) {
      // No wallet - show locked image
      openWindow({
        key: WINDOW_IDS.PARADISE_MOTEL_ROOM_7,
        window: (
          <DraggableResizeableWindow
            windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_7}
            headerTitle="Paradise Motel - Room 7"
            onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_7)}
            initialWidth="80vw"
            initialHeight="80vh"
            resizable={true}
          >
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src="/images/locations/paradise motel/room-7-day.png"
                alt="Paradise Motel Room 7 (Locked)"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
          </DraggableResizeableWindow>
        ),
      });
      return;
    }

    // Check if user has obtained the Room 7 key
    let hasKey = false;
    
    try {
      const response = await fetch(`/api/check-room7-key?walletAddress=${effectiveWallet.address}`);
      const data = await response.json();
      hasKey = data.success && data.hasKey;
    } catch (error) {
      console.error('Failed to check Room 7 key:', error);
    }
      
    if (!hasKey) {
      // User doesn't have the key - show locked image
      openWindow({
        key: WINDOW_IDS.PARADISE_MOTEL_ROOM_7,
        window: (
          <DraggableResizeableWindow
            windowsId={WINDOW_IDS.PARADISE_MOTEL_ROOM_7}
            headerTitle="Paradise Motel - Room 7"
            onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_7)}
            initialWidth="80vw"
            initialHeight="80vh"
            resizable={true}
          >
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <img
                src="/images/locations/paradise motel/room-7-day.png"
                alt="Paradise Motel Room 7 (Locked - Need Key)"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
          </DraggableResizeableWindow>
        ),
      });
      return;
    }

    console.log('✅ User has Room 7 key, granting access to cutscene');
    
    // Award GUM for completing the Slacker objective (first-time visit)
    try {
      const response = await fetch('/api/paradise-motel-room7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: effectiveWallet.address,
          username: 'Anonymous'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Room 7 Slacker objective completed! +' + (data.gumAwarded || 50) + ' GUM');
        window.dispatchEvent(new CustomEvent('gum-balance-updated'));
      } else if (data.alreadyCompleted) {
        console.log('ℹ️ Room 7 already visited, no new GUM awarded');
      }
    } catch (error) {
      console.error('❌ Failed to award Room 7 Slacker GUM:', error);
    }
    
    // User has the key! Open the cutscene
    openWindow({
      key: WINDOW_IDS.STORY_MANUAL,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.STORY_MANUAL}
          onClose={() => closeWindow(WINDOW_IDS.STORY_MANUAL)}
          initialWidth="100vw"
          initialHeight="100vh"
          resizable={false}
          headerTitle="Story Mode"
          style={{ zIndex: 9999 }}
        >
          <StoryManual 
            autoPlayChapterId="paradise-motel" 
            onClose={() => closeWindow(WINDOW_IDS.STORY_MANUAL)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  // Function to ring the bell - Opens interactive bell component
  const ringBell = () => {
    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_ROOM_1,
      window: (
        <Room1BellComponent 
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_ROOM_1)}
          wallet={effectiveWallet?.address}
        />
      ),
    });
  };

  // Function to setup Chapter 5 NFT collection
  const setupChapter5Collection = async () => {
    if (!effectiveWallet?.address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      console.log('🏆 Setting up Flunks: Semester Zero collection...');
      console.log('📡 Using wallet address:', effectiveWallet.address);

      // Check if collection already exists
      console.log('🔍 Checking existing collection...');
      const hasCollection = await fcl.query({
        cadence: `
          import SemesterZero from 0x807c3d470888cc48
          import NonFungibleToken from 0x1d7e57aa55817448
          
          access(all) fun main(address: Address): Bool {
            return getAccount(address)
              .capabilities.get<&{NonFungibleToken.Receiver}>(SemesterZero.Chapter5CollectionPublicPath)
              .check()
          }
        `,
        args: (arg, t) => [arg(effectiveWallet.address, t.Address)],
      });

      if (hasCollection) {
        console.log('ℹ️ Collection already exists');
        alert('✅ You already have Flunks: Semester Zero enabled!');
        return;
      }

      console.log('📝 Creating collection transaction...');
      
      // Detect if using Dapper wallet - check connector or address format
      const isDapper = effectiveWallet.connector?.name?.toLowerCase().includes('dapper') || 
                       effectiveWallet.address?.startsWith('0x');
      
      const createCollectionCadence = isDapper ? `
import SemesterZero from 0x807c3d470888cc48
import NonFungibleToken from 0x1d7e57aa55817448

transaction() {
  prepare(signer: AuthAccount) {
    if signer.borrow<&SemesterZero.Chapter5Collection>(from: SemesterZero.Chapter5CollectionStoragePath) == nil {
      let collection <- SemesterZero.createEmptyChapter5Collection()
      signer.save(<-collection, to: SemesterZero.Chapter5CollectionStoragePath)
      
      signer.link<&{NonFungibleToken.Receiver}>(
        SemesterZero.Chapter5CollectionPublicPath,
        target: SemesterZero.Chapter5CollectionStoragePath
      )
      
      log("✅ Created Chapter 5 NFT collection")
    } else {
      log("ℹ️ Collection already exists")
    }
  }
  
  execute {
    log("🎃 Ready to receive Chapter 5 NFTs!")
  }
}
      ` : `
import SemesterZero from 0x807c3d470888cc48
import NonFungibleToken from 0x1d7e57aa55817448

transaction() {
  prepare(signer: auth(Storage, Capabilities) &Account) {
    if signer.storage.borrow<&SemesterZero.Chapter5Collection>(from: SemesterZero.Chapter5CollectionStoragePath) == nil {
      let collection <- SemesterZero.createEmptyChapter5Collection()
      signer.storage.save(<-collection, to: SemesterZero.Chapter5CollectionStoragePath)
      
      let nftCap = signer.capabilities.storage.issue<&{NonFungibleToken.Receiver}>(SemesterZero.Chapter5CollectionStoragePath)
      signer.capabilities.publish(nftCap, at: SemesterZero.Chapter5CollectionPublicPath)
      
      log("✅ Created Chapter 5 NFT collection")
    } else {
      log("ℹ️ Collection already exists")
    }
  }
  
  execute {
    log("🎃 Ready to receive Chapter 5 NFTs!")
  }
}
      `;

      console.log(`Using ${isDapper ? 'Dapper-compatible' : 'Cadence 1.0'} transaction`);

      const txId = await fcl.mutate({
        cadence: createCollectionCadence,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 9999,
      });

      console.log('⏳ Transaction submitted:', txId);
      alert('⏳ Transaction submitted! Waiting for confirmation...');

      const txStatus = await fcl.tx(txId).onceSealed();
      console.log('✅ Transaction sealed:', txStatus);

      if (txStatus.statusCode === 0) {
        alert('✅ Success! Flunks: Semester Zero collection is now enabled in your wallet!');
      } else {
        throw new Error(`Transaction failed with status code: ${txStatus.statusCode}`);
      }
    } catch (error) {
      console.error('❌ Error setting up collection:', error);
      alert(`❌ Error: ${error.message || 'Failed to setup collection'}`);
    }
  };

  // Function to open Lobby
  const openLobby = () => {
    openWindow({
      key: WINDOW_IDS.PARADISE_MOTEL_LOBBY,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.PARADISE_MOTEL_LOBBY}
          headerTitle="Paradise Motel - Lobby"
          onClose={() => closeWindow(WINDOW_IDS.PARADISE_MOTEL_LOBBY)}
          initialWidth="80vw"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex flex-col bg-black">
            <div className="relative flex-1 flex items-center justify-center min-h-0">
              <img
                src="/images/locations/paradise motel/lobby.png"
                alt="Paradise Motel Lobby"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>

            {/* Bottom Buttons */}
            <div className="w-full bg-gradient-to-r from-cyan-600 via-blue-700 to-orange-600 p-4 border-t-4 border-orange-400 shadow-2xl flex-shrink-0">
              {/* First row: Room buttons */}
              <div className="flex justify-center gap-4 flex-wrap mb-3">
                <button
                  onClick={openRoom1}
                  className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white px-4 py-2 rounded-lg border-4 border-purple-300 hover:border-purple-200 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🚪 Room 1
                </button>
                <button
                  onClick={openRoom6}
                  className="bg-gradient-to-br from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white px-4 py-2 rounded-lg border-4 border-pink-300 hover:border-pink-200 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🚪 Room 6
                </button>
                <button
                  onClick={openRoom7}
                  className="bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white px-4 py-2 rounded-lg border-4 border-red-300 hover:border-red-200 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🌙 Room 7
                </button>
                <button
                  onClick={ringBell}
                  className="bg-gradient-to-br from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 text-white px-4 py-2 rounded-lg border-4 border-yellow-300 hover:border-yellow-200 transition-all duration-300 hover:scale-105 text-center text-base font-black shadow-lg"
                  style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
                >
                  🔔 Bell
                </button>
              </div>

              {/* Second row: Semester Zero Collection Setup */}
              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-br from-green-900/80 to-teal-900/80 border-4 border-green-500 rounded-lg p-4">
                  <div className="text-center mb-3">
                    <h3 className="text-white text-lg font-black" style={{ fontFamily: 'Cooper Black, Georgia, serif' }}>
                      👁️ Flunks: Semester Zero Collection
                    </h3>
                    <p className="text-green-200 text-xs mt-1">Setup required to receive Chapter 5 NFTs</p>
                  </div>
                  <SetupCollectionButton 
                    wallet={walletAddress}
                    compact={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  // Function to open Round Back (maid interaction)
  const openRoundBack = () => {
    const roundBackImage = isDayTime 
      ? "/images/locations/paradise motel/daytime-round-back.png"
      : "/images/locations/paradise motel/night-round-back.png";

    openWindow({
      key: "paradise-motel-round-back",
      window: (
        <DraggableResizeableWindow
          windowsId="paradise-motel-round-back"
          headerTitle="Paradise Motel - 'Round Back"
          onClose={() => closeWindow("paradise-motel-round-back")}
          initialWidth="80vw"
          initialHeight="80vh"
          resizable={true}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <img
              src={roundBackImage}
              alt="Paradise Motel Round Back"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = "/images/backdrops/BLANK.png";
              }}
            />
            {isDayTime && (
              <div className="absolute bottom-4 left-4 right-4">
                <MaidDialogue onClose={() => closeWindow("paradise-motel-round-back")} />
              </div>
            )}
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black">
      <div className="relative flex-1 flex items-center justify-center min-h-0 px-0">
        <img
          src={isDayTime 
            ? "/images/locations/snow locations/paradise-motel-day-snow.png"
            : "/images/locations/snow locations/paradise-motel-night-snow.png"
          }
          alt="Paradise Motel"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />
      </div>
      
      <div className="w-full bg-gradient-to-r from-cyan-600 via-blue-700 to-orange-600 p-4 border-t-4 border-orange-400 shadow-2xl">
        <div className="flex justify-center gap-4">
          <button
            onClick={openLobby}
            className="bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white px-6 py-3 rounded-xl border-4 border-blue-300 hover:border-blue-200 transition-all duration-300 hover:scale-105 text-center text-lg font-black shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            🏨 Lobby
          </button>
          <button
            onClick={openRoundBack}
            className="bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white px-6 py-3 rounded-xl border-4 border-green-300 hover:border-green-200 transition-all duration-300 hover:scale-105 text-center text-lg font-black shadow-lg hover:shadow-xl"
            style={{ fontFamily: 'Cooper Black, Georgia, serif' }}
          >
            🔄 Round Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParadiseMotelMainSimple;