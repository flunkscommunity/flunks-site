import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useGum } from '../contexts/GumContext';
import { 
  getGumSources, 
  getUserGumTransactions, 
  type GumSource, 
  type GumTransaction 
} from '../utils/gumAPI';

const AdminContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(45deg, #1e1e1e, #2d2d30);
  border: 2px solid #ff00ff;
  border-radius: 8px;
  padding: 20px;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 10001;
  color: white;
  font-family: 'MS Sans Serif', sans-serif;
  box-shadow: 0 0 30px rgba(255, 0, 255, 0.3);
`;

const Title = styled.h2`
  color: #ff00ff;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 0 0 10px rgba(255, 0, 255, 0.5);
`;

const Section = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  border: 1px solid rgba(255, 0, 255, 0.3);
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.2);
`;

const SectionTitle = styled.h3`
  color: #00ffff;
  margin-bottom: 10px;
  font-size: 14px;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
`;

const StatCard = styled.div`
  background: linear-gradient(45deg, #333, #444);
  padding: 10px;
  border-radius: 4px;
  text-align: center;
  border: 1px solid #666;
`;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: #00ffff;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: #ccc;
  margin-top: 4px;
`;

const SourcesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SourceItem = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  font-size: 12px;
`;

const SourceName = styled.span`
  font-weight: bold;
  color: #fff;
  flex: 1;
`;

const SourceReward = styled.span`
  color: #00ff00;
  margin: 0 10px;
`;

const SourceCooldown = styled.span`
  color: #ffaa00;
  margin: 0 10px;
`;

const SourceLimit = styled.span`
  color: #ff6666;
`;

const TransactionsList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TransactionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 3px;
  font-size: 11px;
`;

const TransactionAmount = styled.span<{ $type: string }>`
  font-weight: bold;
  color: ${props => props.$type === 'earned' ? '#00ff00' : '#ff6666'};
`;

const TransactionSource = styled.span`
  color: #ccc;
  font-size: 10px;
`;

const TransactionTime = styled.span`
  color: #888;
  font-size: 10px;
`;

const TestButton = styled.button`
  background: linear-gradient(45deg, #ff00ff, #ff69b4);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  margin: 4px;
  
  &:hover {
    filter: brightness(1.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #ff4444;
  border: none;
  border-radius: 50%;
  color: white;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background: #ff6666;
  }
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-size: 11px;
  margin-top: 5px;
`;

const SuccessText = styled.div`
  color: #00ff00;
  font-size: 11px;
  margin-top: 5px;
`;

interface GumAdminPanelProps {
  onClose: () => void;
}

export const GumAdminPanel: React.FC<GumAdminPanelProps> = ({ onClose }) => {
  const { primaryWallet } = useDynamicContext();
  const { balance, stats, loading, error, earnGum, refreshStats, formatGumAmount } = useGum();
  
  const [sources, setSources] = useState<GumSource[]>([]);
  const [transactions, setTransactions] = useState<GumTransaction[]>([]);
  const [testResult, setTestResult] = useState<string>('');
  const [isTestLoading, setIsTestLoading] = useState(false);

  // Load sources and transactions
  useEffect(() => {
    const loadData = async () => {
      const sourcesData = await getGumSources();
      setSources(sourcesData);

      if (primaryWallet?.address) {
        const txData = await getUserGumTransactions(primaryWallet.address, 20);
        setTransactions(txData);
      }
    };

    loadData();
  }, [primaryWallet?.address]);

  // Test earning gum from different sources
  const testEarnGum = async (sourceName: string) => {
    if (!primaryWallet?.address) {
      setTestResult('No wallet connected');
      return;
    }

    setIsTestLoading(true);
    setTestResult('');

    try {
      const result = await earnGum(sourceName, { 
        test: true, 
        timestamp: new Date().toISOString() 
      });

      if (result.success) {
        setTestResult(`✅ Earned ${result.earned} gum from ${sourceName}!`);
        // Refresh data
        refreshStats();
        if (primaryWallet?.address) {
          const newTxData = await getUserGumTransactions(primaryWallet.address, 20);
          setTransactions(newTxData);
        }
      } else {
        setTestResult(`❌ Failed: ${result.error}`);
      }
    } catch (err) {
      setTestResult(`❌ Error: ${err}`);
    } finally {
      setIsTestLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!primaryWallet?.address) {
    return (
      <AdminContainer>
        <CloseButton onClick={onClose}>×</CloseButton>
        <Title>🍬 Gum Admin Panel</Title>
        <div style={{ textAlign: 'center', color: '#ff6666' }}>
          Please connect your wallet to use the gum system.
        </div>
      </AdminContainer>
    );
  }

  return (
    <AdminContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      <Title>🍬 Gum Admin Panel</Title>

      {/* Current Stats */}
      <Section>
        <SectionTitle>Current Stats</SectionTitle>
        <StatGrid>
          <StatCard>
            <StatValue>{formatGumAmount(balance)}</StatValue>
            <StatLabel>Current Balance</StatLabel>
          </StatCard>
          {stats && (
            <>
              <StatCard>
                <StatValue>{formatGumAmount(stats.total_earned)}</StatValue>
                <StatLabel>Total Earned</StatLabel>
              </StatCard>
              <StatCard>
                <StatValue>{formatGumAmount(stats.total_spent)}</StatValue>
                <StatLabel>Total Spent</StatLabel>
              </StatCard>
            </>
          )}
        </StatGrid>
        {error && <ErrorText>{error}</ErrorText>}
      </Section>

      {/* Gum Sources */}
      <Section>
        <SectionTitle>Available Gum Sources</SectionTitle>
        <SourcesList>
          {sources.map(source => (
            <SourceItem key={source.id}>
              <SourceName>{source.source_name}</SourceName>
              <SourceReward>+{source.base_reward}</SourceReward>
              <SourceCooldown>{source.cooldown_minutes}min</SourceCooldown>
              <SourceLimit>
                {source.daily_limit ? `${source.daily_limit}/day` : 'No limit'}
              </SourceLimit>
              <TestButton 
                onClick={() => testEarnGum(source.source_name)}
                disabled={isTestLoading}
              >
                Test
              </TestButton>
            </SourceItem>
          ))}
        </SourcesList>
        {testResult && (
          <div style={{ marginTop: '10px' }}>
            {testResult.includes('✅') ? (
              <SuccessText>{testResult}</SuccessText>
            ) : (
              <ErrorText>{testResult}</ErrorText>
            )}
          </div>
        )}
      </Section>

      {/* Recent Transactions */}
      <Section>
        <SectionTitle>Recent Transactions</SectionTitle>
        <TransactionsList>
          {transactions.length > 0 ? (
            transactions.map(tx => (
              <TransactionItem key={tx.id}>
                <div>
                  <TransactionAmount $type={tx.transaction_type}>
                    {tx.transaction_type === 'earned' ? '+' : '-'}{tx.amount}
                  </TransactionAmount>
                  <TransactionSource> from {tx.source}</TransactionSource>
                </div>
                <TransactionTime>{formatDate(tx.created_at)}</TransactionTime>
              </TransactionItem>
            ))
          ) : (
            <div style={{ color: '#888', fontSize: '12px', textAlign: 'center' }}>
              No transactions yet
            </div>
          )}
        </TransactionsList>
      </Section>
    </AdminContainer>
  );
};
