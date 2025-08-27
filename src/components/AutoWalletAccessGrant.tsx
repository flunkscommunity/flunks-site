import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

/**
 * Automatically grants COMMUNITY access level to wallet-connected users
 * This fixes the issue where chat rooms and other apps don't appear
 * because users bypass the AccessGate when connecting wallets directly
 */
const AutoWalletAccessGrant: React.FC = () => {
  const { primaryWallet, user } = useDynamicContext();

  useEffect(() => {
    if (user && primaryWallet) {
      // Check if user already has access level set
      const existingAccessLevel = sessionStorage.getItem('flunks-access-level');
      
      if (!existingAccessLevel) {
        console.log('🔓 Wallet connected without access level - granting COMMUNITY access');
        
        // Grant community-level access automatically
        sessionStorage.setItem('flunks-access-granted', 'true');
        sessionStorage.setItem('flunks-access-level', 'COMMUNITY');
        sessionStorage.setItem('flunks-access-code', 'AUTO_WALLET_GRANT');
        
        console.log('✅ Auto-granted COMMUNITY access for wallet:', primaryWallet.address);
        
        // Force a re-render of conditional app icons by dispatching a custom event
        window.dispatchEvent(new Event('flunks-access-updated'));
      }
    }
  }, [user, primaryWallet]);

  // This component doesn't render anything
  return null;
};

export default AutoWalletAccessGrant;
