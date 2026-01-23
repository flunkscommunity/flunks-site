import React, { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';
import styled from 'styled-components';
import { useDemoModeOptional } from '../contexts/DemoModeContext';

/**
 * SemesterZero Collection Setup Button
 * Allows users to initialize their Chapter 5 NFT collection
 * Must be set up before receiving airdrops
 */

// Custom wait function with longer timeout for Dapper wallet
const waitForSealWithTimeout = async (
  transactionId: string,
  timeoutSeconds: number = 90
): Promise<any> => {
  return new Promise((resolve, reject) => {
    let statusReceived = false;
    const timeout = setTimeout(() => {
      if (!statusReceived) {
        reject(new Error('Transaction timed out waiting for seal'));
      }
    }, timeoutSeconds * 1000);

    fcl.tx(transactionId).subscribe((txStatus: any) => {
      console.log('Transaction status update:', txStatus);
      
      if (txStatus.status >= 4) {
        statusReceived = true;
        clearTimeout(timeout);
        resolve(txStatus);
      }
    });
  });
};

interface SetupCollectionButtonProps {
  wallet?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

export const SetupCollectionButton: React.FC<SetupCollectionButtonProps> = ({ 
  wallet, 
  onSuccess,
  compact = false 
}) => {
  const [hasCollection, setHasCollection] = useState<boolean | null>(null);
  const [settingUp, setSettingUp] = useState(false);
  const [message, setMessage] = useState('');
  
  // Demo mode - skip all FCL calls
  const demoMode = useDemoModeOptional();
  const isDemoMode = demoMode?.isDemoMode || false;
  
  // Detect if user is using Dapper Wallet (starts with 0x and length is specific to Dapper)
  const isDapperWallet = wallet?.startsWith('0x') && wallet.length === 18;

  // Check if user already has collection (skip in demo mode)
  useEffect(() => {
    console.log('🔧 SetupCollectionButton useEffect:', { wallet, isDemoMode, demoModeContext: demoMode?.isDemoMode });
    
    if (!wallet) {
      setHasCollection(null);
      return;
    }
    
    // In demo mode, pretend collection is set up - check wallet address pattern too
    if (isDemoMode || wallet?.includes('demo')) {
      console.log('🎮 Demo mode: Skipping collection check for wallet:', wallet);
      setHasCollection(true);
      return;
    }
    
    checkCollection(wallet);
  }, [wallet, isDemoMode]);

  const checkCollection = async (address: string) => {
    try {
      const script = `
        import SemesterZeroV3 from 0xce9dd43888d99574
        import NonFungibleToken from 0x1d7e57aa55817448
        
        access(all) fun main(address: Address): Bool {
          let account = getAccount(address)
          
          // Check if storage has the collection using type check (no auth needed)
          let hasStorage = account.storage.type(at: /storage/SemesterZeroV3Collection) != nil
          
          if !hasStorage {
            return false
          }
          
          // Also check public capability (for receiving NFTs)
          let collectionRef = account.capabilities
            .borrow<&SemesterZeroV3.Collection>(
              /public/SemesterZeroV3Collection
            )
          
          return collectionRef != nil
        }
      `;
      
      const result = await fcl.query({
        cadence: script,
        args: (arg: any, t: any) => [arg(address, t.Address)]
      });
      
      setHasCollection(result);
    } catch (error) {
      console.error('Error checking collection:', error);
      // On error, assume collection doesn't exist to allow setup
      setHasCollection(false);
    }
  };

  const setupCollection = async () => {
    if (!wallet || settingUp) return;

    setSettingUp(true);
    setMessage('Setting up collection...');

    try {
      // Simplified transaction for Dapper Wallet compatibility
      // Uses minimal auth entitlements that Dapper supports
      const transaction = `
        import SemesterZeroV3 from 0xce9dd43888d99574
        import NonFungibleToken from 0x1d7e57aa55817448
        
        transaction {
          prepare(signer: auth(Storage, Capabilities) &Account) {
            // Check if collection already exists in storage
            let existingCollection = signer.storage.borrow<&SemesterZeroV3.Collection>(
              from: /storage/SemesterZeroV3Collection
            )
            
            if existingCollection != nil {
              log("✅ Collection already exists in storage")
              
              // Check if public capability exists
              let existingCap = signer.capabilities.get<&SemesterZeroV3.Collection>(
                /public/SemesterZeroV3Collection
              )
              
              // If capability doesn't exist or is invalid, recreate it
              if !existingCap.check() {
                log("🔧 Recreating public capability...")
                
                // Always unpublish first to clear any existing capability (Dapper-safe)
                signer.capabilities.unpublish(/public/SemesterZeroV3Collection)
                
                // Create new public capability (Dapper-safe)
                let newCap = signer.capabilities.storage.issue<&SemesterZeroV3.Collection>(
                  /storage/SemesterZeroV3Collection
                )
                
                // Publish the capability
                signer.capabilities.publish(newCap, at: /public/SemesterZeroV3Collection)
                log("✅ Public capability published!")
              }
              
              return
            }
            
            log("🆕 Creating new collection...")
            
            // ALWAYS unpublish first to ensure path is completely clear
            signer.capabilities.unpublish(/public/SemesterZeroV3Collection)
            log("🧹 Cleared public path")
            
            // Check if storage path is clear
            if signer.storage.borrow<&AnyResource>(from: /storage/SemesterZeroV3Collection) != nil {
              log("❌ Storage path already occupied!")
              panic("Collection storage path is already in use. Please contact support.")
            }
            
            // Create new empty collection
            let collection <- SemesterZeroV3.createEmptyCollection(nftType: Type<@SemesterZeroV3.NFT>())
            
            // Save collection to storage (Dapper-safe)
            signer.storage.save(<-collection, to: /storage/SemesterZeroV3Collection)
            log("💾 Collection saved to storage")
            
            // Create public capability (Dapper-safe)
            let collectionCap = signer.capabilities.storage.issue<&SemesterZeroV3.Collection>(
              /storage/SemesterZeroV3Collection
            )
            log("🔑 Capability issued")
            
            // Publish the capability
            signer.capabilities.publish(collectionCap, at: /public/SemesterZeroV3Collection)
            log("✅ Public capability published!")
            
            log("🎉 SemesterZeroV3 collection created!")
          }
        }
      `;

      const txId = await fcl.mutate({
        cadence: transaction,
        proposer: fcl.currentUser,
        payer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 999
      });

      console.log('✅ Transaction submitted:', txId);
      setMessage(`Transaction submitted: ${txId.slice(0, 8)}...`);
      
      // Track status updates while waiting
      const statusInterval = setInterval(() => {
        fcl.tx(txId).snapshot().then((status: any) => {
          if (status.status === 0 || status.status === 1) {
            setMessage('⏳ Transaction pending...');
          } else if (status.status === 2) {
            setMessage('⏳ Executing transaction...');
          } else if (status.status === 3) {
            setMessage('⏳ Sealing transaction...');
          } else if (status.status === 4) {
            clearInterval(statusInterval);
          }
        }).catch(() => {
          // Ignore snapshot errors
        });
      }, 2000);
      
      // Use custom wait function with 90 second timeout
      try {
        const sealedTx = await waitForSealWithTimeout(txId, 90);
        clearInterval(statusInterval);
        
        console.log('Transaction sealed:', sealedTx);
        
        if (sealedTx.status === 4 && sealedTx.statusCode === 0) {
          setMessage('✅ Collection set up successfully!');
          setHasCollection(true);
          
          if (onSuccess) {
            onSuccess();
          }
          
          // Recheck collection status
          setTimeout(() => {
            checkCollection(wallet);
          }, 1000);
          
          setTimeout(() => setMessage(''), 3000);
        } else {
          throw new Error(
            sealedTx.errorMessage || 
            `Transaction failed with status code: ${sealedTx.statusCode}`
          );
        }
        
      } catch (sealError: any) {
        clearInterval(statusInterval);
        console.error('Error waiting for seal:', sealError);
        
        // If it's a timeout, still check if collection was created
        if (sealError.message?.includes('timed out')) {
          setMessage('⚠️ Transaction taking longer than expected. Checking collection...');
          setTimeout(() => {
            checkCollection(wallet);
          }, 3000);
        } else {
          throw sealError;
        }
      }
      
    } catch (error: any) {
      console.error('Setup failed:', error);
      
      // Parse common errors
      let errorMessage = 'Failed to set up collection';
      
      if (error.message?.includes('ErrInvalidRequest') || error.message?.includes('not supported')) {
        errorMessage = '⚠️ Dapper Wallet detected: Please use Flow Wallet (Lilico) for setup';
      } else if (error.message?.includes('declined') || error.message?.includes('rejected')) {
        errorMessage = 'Transaction was declined';
      } else if (error.message?.includes('Authorizers')) {
        errorMessage = 'Please approve the transaction in your wallet';
      } else if (error.message?.includes('Declined: User rejected')) {
        errorMessage = 'Transaction rejected by user';
      } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = 'Transaction timed out. Please try again or check your wallet.';
        // Still check if collection was created despite timeout
        setTimeout(() => {
          checkCollection(wallet);
        }, 2000);
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message?.includes('follow your transaction')) {
        errorMessage = 'Transaction may still be processing. Checking status...';
        // Transaction was submitted but we lost track of it
        setTimeout(() => {
          checkCollection(wallet);
        }, 3000);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(`❌ ${errorMessage}`);
      setTimeout(() => setMessage(''), 8000);
    } finally {
      setSettingUp(false);
    }
  };

  // Don't show button if collection already exists
  if (hasCollection === true) {
    return compact ? null : (
      <SuccessContainer>
        <StatusText>✅ Collection ready!</StatusText>
        <RefreshButton onClick={() => wallet && checkCollection(wallet)}>
          🔄 Refresh
        </RefreshButton>
      </SuccessContainer>
    );
  }

  // Don't show if still checking
  if (hasCollection === null && wallet) {
    return compact ? null : (
      <StatusText>Checking collection...</StatusText>
    );
  }

  // Don't show if no wallet
  if (!wallet) {
    return compact ? null : (
      <StatusText>Connect wallet to set up collection</StatusText>
    );
  }

  return (
    <Container compact={compact}>
      {isDapperWallet && !compact && (
        <DapperWarning>
          ⚠️ <strong>Dapper Wallet users:</strong> This transaction may not be supported. 
          Please switch to <strong>Flow Wallet (Lilico)</strong> for collection setup.
        </DapperWarning>
      )}
      
      <SetupButton
        onClick={setupCollection}
        disabled={settingUp}
        compact={compact}
      >
        {settingUp ? '⏳ Setting up...' : '🎫 Set up Collection'}
      </SetupButton>
      
      {message && <Message error={message.startsWith('❌')}>{message}</Message>}
      
      {!compact && (
        <HelpText>
          Required to receive Chapter 5 NFTs (Pins, Patches, etc.)
        </HelpText>
      )}
    </Container>
  );
};

const Container = styled.div<{ compact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${props => props.compact ? '8px' : '12px'};
  padding: ${props => props.compact ? '8px' : '16px'};
`;

const SetupButton = styled.button<{ compact?: boolean }>`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: ${props => props.compact ? '10px 20px' : '14px 28px'};
  font-size: ${props => props.compact ? '11px' : '13px'};
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
  transition: all 0.2s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuccessContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
`;

const StatusText = styled.p`
  font-size: 12px;
  color: #10b981;
  font-weight: bold;
  margin: 0;
`;

const RefreshButton = styled.button`
  background: rgba(99, 102, 241, 0.2);
  color: #6366f1;
  border: 1px solid #6366f1;
  padding: 4px 12px;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(99, 102, 241, 0.3);
    transform: scale(1.05);
  }
`;

const Message = styled.p<{ error?: boolean }>`
  font-size: 11px;
  color: #fff;
  background: ${props => props.error ? 'rgba(239, 68, 68, 0.8)' : 'rgba(0, 0, 0, 0.7)'};
  padding: 8px 16px;
  border-radius: 6px;
  margin: 0;
  text-align: center;
  max-width: 300px;
  border: ${props => props.error ? '1px solid #ef4444' : 'none'};
`;

const HelpText = styled.p`
  font-size: 10px;
  color: #9ca3af;
  margin: 0;
  text-align: center;
  font-style: italic;
`;

const DapperWarning = styled.div`
  background: rgba(251, 191, 36, 0.2);
  border: 2px solid #fbbf24;
  color: #fbbf24;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 11px;
  text-align: center;
  line-height: 1.5;
  
  strong {
    color: #fff;
  }
`;

export default SetupCollectionButton;
