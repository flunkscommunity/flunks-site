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
  background: 
    linear-gradient(45deg, #ff00ff 25%, transparent 25%),
    linear-gradient(-45deg, #ff00ff 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #00ffff 75%),
    linear-gradient(-45deg, transparent 75%, #00ffff 75%),
    linear-gradient(135deg, #8B00FF 0%, #FF1493 50%, #00CED1 100%);
  background-size: 20px 20px, 20px 20px, 20px 20px, 20px 20px, 100% 100%;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px, 0 0;
  font-family: 'MS Sans Serif', sans-serif;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const HeaderSection = styled.div`
  background: 
    linear-gradient(90deg, #FF00FF 0%, #00FFFF 25%, #FFFF00 50%, #FF00FF 75%, #00FFFF 100%);
  color: #000;
  padding: 16px;
  text-align: center;
  border-bottom: 5px solid #FFD700;
  border-top: 3px solid #FF1493;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
    animation: shine 2s infinite;
  }
  
  @keyframes shine {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: bold;
    text-shadow: 
      2px 2px 0px #FF1493,
      4px 4px 0px #8B00FF,
      6px 6px 0px #00CED1;
    font-family: 'MS Sans Serif', sans-serif;
    letter-spacing: 2px;
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  @keyframes glow {
    from { text-shadow: 
      2px 2px 0px #FF1493,
      4px 4px 0px #8B00FF,
      6px 6px 0px #00CED1; }
    to { text-shadow: 
      2px 2px 10px #FF1493,
      4px 4px 15px #8B00FF,
      6px 6px 20px #00CED1; }
  }
  
  p {
    margin: 0;
    font-size: 14px;
    font-weight: bold;
    text-shadow: 1px 1px 2px #000;
    color: #000;
  }
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 12px;
  background: 
    linear-gradient(45deg, #FF1493 25%, #00CED1 25%),
    linear-gradient(-45deg, #FF1493 25%, #00CED1 25%),
    linear-gradient(45deg, #00CED1 75%, #FFFF00 75%),
    linear-gradient(-45deg, #00CED1 75%, #FFFF00 75%);
  background-size: 12px 12px;
  background-position: 0 0, 0 6px, 6px -6px, -6px 0px;
  border-bottom: 3px solid #FF00FF;
  font-weight: bold;
  font-size: 12px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
  }
  
  div {
    padding: 6px 12px;
    border-radius: 0;
    background: #C0C0C0;
    border: 2px outset #C0C0C0;
    box-shadow: none;
    font-family: 'MS Sans Serif', sans-serif;
    position: relative;
    z-index: 1;
    animation: pulse 2s infinite;
    
    &:nth-child(1) { animation-delay: 0s; }
    &:nth-child(2) { animation-delay: 0.5s; }
    &:nth-child(3) { animation-delay: 1s; }
    &:nth-child(4) { animation-delay: 1.5s; }
    &:nth-child(5) { animation-delay: 2s; }
  }
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
  padding: 12px 16px;
  background: 
    repeating-linear-gradient(
      45deg,
      #FF00FF,
      #FF00FF 10px,
      #00FFFF 10px,
      #00FFFF 20px
    );
  border-top: 3px solid #FFD700;
  border-bottom: 3px solid #FF1493;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(192, 192, 192, 0.9);
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  span {
    font-weight: bold;
    font-size: 11px;
    white-space: nowrap;
    color: #000;
    text-shadow: 1px 1px 0px #FFF;
    font-family: 'MS Sans Serif', sans-serif;
  }
`;

const FlunksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
  padding: 16px;
  overflow-y: auto;
  flex: 1;
  background: 
    radial-gradient(circle at 25% 25%, #FF00FF 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, #00FFFF 0%, transparent 50%),
    radial-gradient(circle at 75% 25%, #FFFF00 0%, transparent 50%),
    radial-gradient(circle at 25% 75%, #FF1493 0%, transparent 50%);
  background-size: 40px 40px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.95);
    z-index: 0;
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
`;

const FlunkCard = styled.div`
  background: #C0C0C0;
  border: 3px outset #C0C0C0;
  border-radius: 0;
  overflow: hidden;
  box-shadow: 4px 4px 0px #808080;
  transition: all 0.2s;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    height: 2px;
    background: linear-gradient(90deg, #FF00FF, #00FFFF, #FFFF00, #FF1493);
    z-index: 1;
  }
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 6px 6px 0px #FF00FF, 8px 8px 0px #00FFFF;
    border: 3px solid #FFD700;
    
    &::before {
      height: 4px;
      animation: neonFlow 1s infinite;
    }
  }
  
  @keyframes neonFlow {
    0% { background: linear-gradient(90deg, #FF00FF, #00FFFF, #FFFF00, #FF1493); }
    25% { background: linear-gradient(90deg, #00FFFF, #FFFF00, #FF1493, #FF00FF); }
    50% { background: linear-gradient(90deg, #FFFF00, #FF1493, #FF00FF, #00FFFF); }
    75% { background: linear-gradient(90deg, #FF1493, #FF00FF, #00FFFF, #FFFF00); }
    100% { background: linear-gradient(90deg, #FF00FF, #00FFFF, #FFFF00, #FF1493); }
  }
`;

const FlunkImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 3px solid #FF00FF;
  position: relative;
  filter: contrast(1.2) saturate(1.3);
  
  &:hover {
    filter: contrast(1.4) saturate(1.5) hue-rotate(15deg);
  }
`;

const FlunkInfo = styled.div`
  padding: 12px;
  background: #C0C0C0;
  position: relative;
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    font-weight: bold;
    text-align: center;
    font-family: 'MS Sans Serif', sans-serif;
    color: #000;
    text-shadow: 1px 1px 0px #FFF;
  }
  
  .token-id {
    text-align: center;
    font-size: 12px;
    color: #000;
    margin-bottom: 8px;
    font-weight: bold;
    background: linear-gradient(90deg, #FF00FF, #00FFFF);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: none;
  }
  
  .clique-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 0;
    font-size: 10px;
    font-weight: bold;
    color: #000;
    margin-bottom: 8px;
    border: 2px outset;
    font-family: 'MS Sans Serif', sans-serif;
    text-shadow: none;
    
    &.GEEK { 
      background: #00FF00;
      border-color: #00FF00;
      box-shadow: 2px 2px 0px #008000;
    }
    &.JOCK { 
      background: #FF4500;
      border-color: #FF4500;
      box-shadow: 2px 2px 0px #CC3300;
    }
    &.PREP { 
      background: #00BFFF;
      border-color: #00BFFF;
      box-shadow: 2px 2px 0px #0080CC;
    }
    &.FREAK { 
      background: #FF00FF;
      border-color: #FF00FF;
      box-shadow: 2px 2px 0px #CC00CC;
    }
  }
  
  .rank {
    font-size: 11px;
    color: #000;
    margin-bottom: 8px;
    font-weight: bold;
    font-family: 'MS Sans Serif', sans-serif;
  }
  
  .traits {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    
    .trait {
      background: #FFFF00;
      padding: 2px 6px;
      border-radius: 0;
      font-size: 9px;
      border: 1px outset #FFFF00;
      font-family: 'MS Sans Serif', sans-serif;
      color: #000;
      font-weight: bold;
      box-shadow: 1px 1px 0px #CCCC00;
      
      &:nth-child(2n) {
        background: #00FFFF;
        border-color: #00FFFF;
        box-shadow: 1px 1px 0px #00CCCC;
      }
      
      &:nth-child(3n) {
        background: #FF69B4;
        border-color: #FF69B4;
        box-shadow: 1px 1px 0px #CC4080;
      }
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
  background: 
    repeating-linear-gradient(
      90deg,
      #FF00FF 0px,
      #FF00FF 20px,
      #00FFFF 20px,
      #00FFFF 40px
    );
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(192, 192, 192, 0.9);
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  p {
    font-family: 'MS Sans Serif', sans-serif;
    font-weight: bold;
    color: #000;
    font-size: 16px;
    text-shadow: 1px 1px 0px #FFF;
    animation: blink 1s infinite;
  }
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.3; }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 16px;
  background: 
    repeating-linear-gradient(
      45deg,
      #FF0000,
      #FF0000 10px,
      #FFFF00 10px,
      #FFFF00 20px
    );
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(192, 192, 192, 0.9);
  }
  
  > * {
    position: relative;
    z-index: 1;
  }
  
  h3 {
    margin: 0;
    color: #FF0000;
    font-family: 'MS Sans Serif', sans-serif;
    font-size: 18px;
    text-shadow: 2px 2px 0px #000;
    animation: errorPulse 1.5s infinite;
  }
  
  p {
    color: #000;
    font-family: 'MS Sans Serif', sans-serif;
    font-weight: bold;
    text-shadow: 1px 1px 0px #FFF;
  }
  
  @keyframes errorPulse {
    0%, 100% { transform: scale(1); color: #FF0000; }
    50% { transform: scale(1.1); color: #FF6600; }
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
