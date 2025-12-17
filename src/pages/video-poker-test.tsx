/**
 * Video Poker Test Page
 * 
 * Direct access: http://localhost:3000/video-poker-test
 * 
 * This is a standalone test page to preview Video Poker aesthetics
 * and test gameplay before wiring up to the full GUM system.
 */

import { useState, useEffect } from 'react';
import Head from 'next/head';
import VideoPokerBattleTested from '../components/games/VideoPokerBattleTested';
import VideoPoker from '../components/games/VideoPoker';
import { useGum } from '../contexts/GumContext';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useUnifiedWallet } from '../contexts/UnifiedWalletContext';

export default function VideoPokerTest() {
  // Real wallet integration
  const { primaryWallet } = useDynamicContext();
  const { address: unifiedAddress } = useUnifiedWallet();
  const walletAddress = unifiedAddress || primaryWallet?.address;
  
  // Real GUM balance from context
  const { balance: realGumBalance, updateBalance } = useGum();
  
  // Dev mode toggle
  const [devMode, setDevMode] = useState(true);
  const [devGumBalance, setDevGumBalance] = useState(1000);
  
  // Which version to show
  const [version, setVersion] = useState<'battle-tested' | 'original'>('battle-tested');
  
  // Use dev or real balance based on mode
  const currentBalance = devMode ? devGumBalance : realGumBalance;
  
  const handleGumChange = async (amount: number) => {
    if (devMode) {
      setDevGumBalance(prev => Math.max(0, prev + amount));
      console.log(`[DEV] GUM ${amount > 0 ? '+' : ''}${amount}, new balance: ${devGumBalance + amount}`);
    } else {
      // TODO: Wire up to real API like slots
      // For now, just update the context balance
      updateBalance(realGumBalance + amount);
      console.log(`[REAL] GUM ${amount > 0 ? '+' : ''}${amount}, new balance: ${realGumBalance + amount}`);
    }
  };

  return (
    <>
      <Head>
        <title>🃏 Video Poker Test</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-4">
        {/* Controls */}
        <div className="max-w-md mx-auto mb-4 p-4 bg-black/50 rounded-lg border border-purple-500/30">
          <h1 className="text-2xl font-bold text-white mb-4">🃏 Video Poker Test</h1>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-4 mb-4">
            <label className="text-white flex items-center gap-2">
              <input
                type="checkbox"
                checked={devMode}
                onChange={(e) => setDevMode(e.target.checked)}
                className="w-4 h-4"
              />
              Dev Mode (fake GUM)
            </label>
          </div>
          
          {/* Version Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setVersion('battle-tested')}
              className={`px-3 py-1 rounded ${version === 'battle-tested' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Battle-Tested
            </button>
            <button
              onClick={() => setVersion('original')}
              className={`px-3 py-1 rounded ${version === 'original' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              Original
            </button>
          </div>
          
          {/* Balance Display */}
          <div className="text-lg text-yellow-400 font-bold">
            🍬 GUM: {currentBalance.toLocaleString()}
            {devMode && (
              <span className="text-xs text-gray-400 ml-2">(dev mode)</span>
            )}
          </div>
          
          {/* Dev Controls */}
          {devMode && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => setDevGumBalance(prev => prev + 500)}
                className="px-2 py-1 bg-green-600 text-white rounded text-sm"
              >
                +500 GUM
              </button>
              <button
                onClick={() => setDevGumBalance(1000)}
                className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
              >
                Reset to 1000
              </button>
            </div>
          )}
          
          {/* Wallet Status */}
          {!devMode && (
            <div className="mt-2 text-sm text-gray-400">
              {walletAddress 
                ? `Wallet: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}`
                : '⚠️ No wallet connected'
              }
            </div>
          )}
        </div>
        
        {/* Video Poker Component */}
        <div className="max-w-lg mx-auto">
          {version === 'battle-tested' ? (
            <VideoPokerBattleTested
              walletAddress={devMode ? 'dev-test-wallet' : walletAddress}
              gumBalance={currentBalance}
              onGumChange={handleGumChange}
            />
          ) : (
            <VideoPoker
              walletAddress={devMode ? 'dev-test-wallet' : walletAddress}
              gumBalance={currentBalance}
              onGumChange={handleGumChange}
            />
          )}
        </div>
        
        {/* Quick Info */}
        <div className="max-w-md mx-auto mt-4 p-4 bg-black/30 rounded-lg text-gray-400 text-sm">
          <h3 className="text-white font-bold mb-2">📍 Location in App:</h3>
          <p>Currently: 4 Thieves Bar → Interior → Video Poker button</p>
          <p className="mt-2">Planned: Underground area of Semester Zero (1 of 4 games)</p>
          
          <h3 className="text-white font-bold mt-4 mb-2">🔧 To Wire Up:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Create API endpoint (or reuse slots/transaction)</li>
            <li>Connect to useGum() context</li>
            <li>Add instant balance updates like slots</li>
          </ul>
        </div>
      </div>
    </>
  );
}
