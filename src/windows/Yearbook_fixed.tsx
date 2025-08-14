import React, { useState, useEffect, useMemo } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { useWindowsContext } from '../contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import styled from 'styled-components';
import { Button, Select, TextInput, Frame, ScrollView, Progress } from 'react95';
import { FlunkNFT, YearbookFilters, YearbookStats } from '../types/Yearbook';
import { YearbookAPI, YearbookMockData } from '../utils/yearbookAPI';

const YearbookContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #f5f5dc 0%, #e6e6fa 100%);
  font-family: 'Times New Roman', serif;
`;

const HeaderSection = styled.div`
  background: linear-gradient(135deg, #4a4a4a 0%, #2c2c2c 100%);
  color: white;
  padding: 16px;
  text-align: center;
  border-bottom: 3px solid #ffd700;
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  }
  
  p {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 12px;
  background: linear-gradient(135deg, #e0e0e0 0%, #f0f0f0 100%);
  border-bottom: 2px solid #ccc;
  font-weight: bold;
  font-size: 12px;
  
  div {
    padding: 4px 8px;
    border-radius: 4px;
    background: white;
    box-shadow: inset 1px 1px 2px rgba(0,0,0,0.1);
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  background: #c0c0c0;
  border-top: 2px solid #dfdfdf;
  border-bottom: 2px solid #808080;
  
  span {
    font-weight: bold;
    font-size: 11px;
    white-space: nowrap;
  }
`;

const FlunksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
  flex: 1;
`;

const FlunkCard = styled.div`
  background: white;
  border: 3px solid #666;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 4px 4px 8px rgba(0,0,0,0.3);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 6px 6px 12px rgba(0,0,0,0.4);
  }
`;

const FlunkImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 2px solid #666;
`;

const FlunkInfo = styled.div`
  padding: 12px;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
  }
  
  .token-id {
    text-align: center;
    font-size: 12px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .clique-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 10px;
    font-weight: bold;
    color: white;
    margin-bottom: 8px;
    
    &.GEEK { background: #4CAF50; }
    &.JOCK { background: #FF5722; }
    &.PREP { background: #2196F3; }
    &.FREAK { background: #9C27B0; }
  }
  
  .rank {
    font-size: 11px;
    color: #666;
    margin-bottom: 8px;
  }
  
  .traits {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .trait {
      background: #f0f0f0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 9px;
      border: 1px solid #ddd;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
  color: #d32f2f;
  
  h3 {
    margin: 0;
    color: #d32f2f;
  }
`;

const Yearbook: React.FC = () => {
  const { closeWindow, minimizeWindow } = useWindowsContext();

  // State management
  const [flunks, setFlunks] = useState<FlunkNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<YearbookStats | null>(null);
  const [filters, setFilters] = useState<YearbookFilters>({
    clique: 'ALL',
    trait: 'ALL',
    search: '',
    sortBy: 'tokenId'
  });
  const [selectedTraitType, setSelectedTraitType] = useState<string>('ALL');

  // Load initial data
  useEffect(() => {
    loadYearbookData();
  }, []);

  const loadYearbookData = async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, use mock data - replace with real API when ready
      const USE_MOCK_DATA = true; // Set to false when your API is ready

      if (USE_MOCK_DATA) {
        // Simulate loading delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setFlunks(YearbookMockData.generateMockFlunks(100));
        setStats(YearbookMockData.getMockStats());
      } else {
        // Real API calls
        const [flunksData, statsData] = await Promise.all([
          YearbookAPI.fetchFlunks(filters),
          YearbookAPI.fetchStats()
        ]);
        setFlunks(flunksData);
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load yearbook data');
      console.error('Yearbook loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Extract all unique trait types and values
  const availableTraits = useMemo(() => {
    const traitMap = new Map<string, Set<string>>();
    
    flunks.forEach(flunk => {
      flunk.metadata.attributes.forEach(attr => {
        if (!traitMap.has(attr.trait_type)) {
          traitMap.set(attr.trait_type, new Set());
        }
        traitMap.get(attr.trait_type)!.add(attr.value);
      });
    });

    const result: { [key: string]: string[] } = {};
    traitMap.forEach((values, traitType) => {
      result[traitType] = Array.from(values).sort();
    });

    return result;
  }, [flunks]);

  const traitTypeOptions = useMemo(() => [
    { value: 'ALL', label: 'All Traits' },
    ...Object.keys(availableTraits).sort().map(traitType => ({
      value: traitType,
      label: traitType
    }))
  ], [availableTraits]);

  const traitValueOptions = useMemo(() => {
    if (selectedTraitType === 'ALL') {
      return [{ value: 'ALL', label: 'All Values' }];
    }
    
    const values = availableTraits[selectedTraitType] || [];
    return [
      { value: 'ALL', label: 'All Values' },
      ...values.map(value => ({ value, label: value }))
    ];
  }, [selectedTraitType, availableTraits]);

  const filteredFlunks = useMemo(() => {
    let filtered = flunks;

    // Filter by clique
    if (filters.clique !== 'ALL') {
      filtered = filtered.filter(flunk => flunk.clique === filters.clique);
    }

    // Filter by specific trait
    if (selectedTraitType !== 'ALL' && filters.trait !== 'ALL') {
      filtered = filtered.filter(flunk => 
        flunk.metadata.attributes.some(attr => 
          attr.trait_type === selectedTraitType && attr.value === filters.trait
        )
      );
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(flunk => 
        flunk.metadata.name.toLowerCase().includes(searchLower) ||
        flunk.tokenId.toString().includes(searchLower) ||
        flunk.metadata.attributes.some(attr => 
          attr.value.toLowerCase().includes(searchLower) ||
          attr.trait_type.toLowerCase().includes(searchLower)
        )
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'tokenId':
          return a.tokenId - b.tokenId;
        case 'rank':
          return (a.rank || 9999) - (b.rank || 9999);
        case 'name':
          return a.metadata.name.localeCompare(b.metadata.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [flunks, filters, selectedTraitType]);

  const displayStats = useMemo(() => {
    if (stats) return stats;
    
    // Calculate from current data if stats not available
    const total = flunks.length;
    const geeks = flunks.filter(f => f.clique === 'GEEK').length;
    const jocks = flunks.filter(f => f.clique === 'JOCK').length;
    const preps = flunks.filter(f => f.clique === 'PREP').length;
    const freaks = flunks.filter(f => f.clique === 'FREAK').length;
    
    return { total, geeks, jocks, preps, freaks, uniqueTraits: 0 };
  }, [flunks, stats]);

  const handleClose = () => {
    closeWindow(WINDOW_IDS.YEARBOOK);
  };

  const handleMinimize = () => {
    minimizeWindow(WINDOW_IDS.YEARBOOK);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <LoadingContainer>
          <Progress />
          <p>Loading Flunks High School Yearbook...</p>
        </LoadingContainer>
      );
    }

    if (error) {
      return (
        <ErrorContainer>
          <h3>📚 Oops! Yearbook Error</h3>
          <p>{error}</p>
          <Button onClick={loadYearbookData}>Try Again</Button>
        </ErrorContainer>
      );
    }

    return (
      <>
        <HeaderSection>
          <h1>
            📚 Flunks High School Yearbook
          </h1>
          <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
            Class of 2024 • 10,000 Unique Students
          </p>
        </HeaderSection>

        {!loading && (
          <StatsSection>
            <div>Total: {displayStats.total}</div>
            <div style={{ color: '#4CAF50' }}>GEEKS: {displayStats.geeks}</div>
            <div style={{ color: '#FF5722' }}>JOCKS: {displayStats.jocks}</div>
            <div style={{ color: '#2196F3' }}>PREPS: {displayStats.preps}</div>
            <div style={{ color: '#9C27B0' }}>FREAKS: {displayStats.freaks}</div>
          </StatsSection>
        )}

        <FilterSection>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Clique:</span>
            <Select
              value={filters.clique}
              onChange={(value) => setFilters(prev => ({ ...prev, clique: value.value }))}
              style={{ minWidth: '100px' }}
              options={[
                { value: 'ALL', label: 'All Cliques' },
                { value: 'GEEK', label: '🤓 GEEKS' },
                { value: 'JOCK', label: '🏈 JOCKS' },
                { value: 'PREP', label: '👔 PREPS' },
                { value: 'FREAK', label: '🎸 FREAKS' }
              ]}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Trait:</span>
            <Select
              value={selectedTraitType}
              onChange={(value) => {
                setSelectedTraitType(value.value);
                setFilters(prev => ({ ...prev, trait: 'ALL' }));
              }}
              style={{ minWidth: '120px' }}
              options={traitTypeOptions}
            />
          </div>

          {selectedTraitType !== 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Value:</span>
              <Select
                value={filters.trait || 'ALL'}
                onChange={(value) => setFilters(prev => ({ ...prev, trait: value.value }))}
                style={{ minWidth: '120px' }}
                options={traitValueOptions}
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Sort:</span>
            <Select
              value={filters.sortBy}
              onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value.value as 'tokenId' | 'rank' | 'name' }))}
              style={{ minWidth: '100px' }}
              options={[
                { value: 'tokenId', label: 'Token ID' },
                { value: 'rank', label: 'Rarity Rank' },
                { value: 'name', label: 'Name' }
              ]}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Search:</span>
            <TextInput
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Name, ID, or trait..."
              style={{ width: '150px' }}
            />
          </div>

          <Button
            onClick={() => {
              setFilters({
                clique: 'ALL',
                trait: 'ALL',
                search: '',
                sortBy: 'tokenId'
              });
              setSelectedTraitType('ALL');
            }}
            style={{ marginLeft: 'auto' }}
          >
            🔄 Reset
          </Button>

          <Button onClick={loadYearbookData}>
            🔄 Refresh
          </Button>
        </FilterSection>

        <FlunksGrid>
          {filteredFlunks.map((flunk) => (
            <FlunkCard key={flunk.tokenId}>
              <FlunkImage
                src={flunk.metadata.image}
                alt={flunk.metadata.name}
                onError={(e) => {
                  e.currentTarget.src = '/images/about-us/fp-1.avif';
                }}
              />
              <FlunkInfo>
                <h3>{flunk.metadata.name}</h3>
                <div className="token-id">#{flunk.tokenId}</div>
                
                {flunk.clique && (
                  <div className={`clique-badge ${flunk.clique}`}>
                    {flunk.clique}
                  </div>
                )}
                
                {flunk.rank && (
                  <div className="rank">Rank: #{flunk.rank}</div>
                )}
                
                <div className="traits">
                  {flunk.metadata.attributes.map((attr, index) => (
                    <span key={index} className="trait">
                      {attr.value}
                    </span>
                  ))}
                </div>
              </FlunkInfo>
            </FlunkCard>
          ))}
        </FlunksGrid>

        {filteredFlunks.length === 0 && !loading && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flex: 1,
            fontSize: '18px',
            color: '#666'
          }}>
            No Flunks found matching your filters 📚
          </div>
        )}
      </>
    );
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.YEARBOOK}
      headerTitle="📚 Flunks High School Yearbook"
      onClose={handleClose}
      initialWidth="1000px"
      initialHeight="700px"
      resizable={true}
    >
      <YearbookContainer>
        {renderContent()}
      </YearbookContainer>
    </DraggableResizeableWindow>
  );
};

export default Yearbook;
