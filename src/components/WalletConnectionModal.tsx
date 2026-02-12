import React, { useEffect } from 'react';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import FlowWalletApp from 'windows/FlowWalletApp';
import { useUnifiedWallet } from 'contexts/UnifiedWalletContext';
import { isMobileApp } from 'utils/buildMode';

interface WalletConnectionModalProps {
  onClose: () => void;
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ onClose }) => {
  const { openWindow } = useWindowsContext();
  const { connectFCL } = useUnifiedWallet();

  useEffect(() => {
    if (isMobileApp()) {
      connectFCL().catch(e => console.error('Connect error:', e));
    } else {
      openWindow({
        key: WINDOW_IDS.FLOW_WALLET_APP,
        window: <FlowWalletApp />
      });
    }
    onClose();
  }, [openWindow, onClose, connectFCL]);

  return null;
};

export default WalletConnectionModal;
