import React, { useEffect } from 'react';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import FlowWalletApp from 'windows/FlowWalletApp';

interface WalletConnectionModalProps {
  onClose: () => void;
}

const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({ onClose }) => {
  const { openWindow } = useWindowsContext();

  useEffect(() => {
    openWindow({
      key: WINDOW_IDS.FLOW_WALLET_APP,
      window: <FlowWalletApp />
    });
    onClose();
  }, [openWindow, onClose]);

  return null;
};

export default WalletConnectionModal;
