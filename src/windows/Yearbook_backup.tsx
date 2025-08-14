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
  position: relative;
  
  &::before {
    content: '📖';
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24px;
  }
  
  &::after {
    content: '🎓';
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24px;
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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
  overflow-y: auto;
  flex: 1;
`;

const FlunkCard = styled.div<{ clique: string }>`
  background: white;
  border: 3px solid ${props => 
    props.clique === 'GEEK' ? '#4CAF50' :
    props.clique === 'JOCK' ? '#FF5722' :
    props.clique === 'PREP' ? '#2196F3' :
    props.clique === 'FREAK' ? '#9C27B0' : '#666'
  };
  border-radius: 12px;
  padding: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 4px 4px 16px rgba(0,0,0,0.2);
    border-width: 4px;
  }
`;

const FlunkImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
  background: linear-gradient(45deg, #f0f0f0 25%, #e0e0e0 25%, #e0e0e0 50%, #f0f0f0 50%, #f0f0f0 75%, #e0e0e0 75%);
  background-size: 20px 20px;
`;

const FlunkName = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  color: #333;
`;

const FlunkId = styled.p`
  margin: 0 0 8px 0;
  font-size: 12px;
  text-align: center;
  color: #666;
`;

const CliqueBadge = styled.span<{ clique: string }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  text-transform: uppercase;
  background: ${props => 
    props.clique === 'GEEK' ? '#4CAF50' :
    props.clique === 'JOCK' ? '#FF5722' :
    props.clique === 'PREP' ? '#2196F3' :
    props.clique === 'FREAK' ? '#9C27B0' : '#666'
  };
  color: white;
  margin: 2px;
`;

const TraitPill = styled.span`
  display: inline-block;
  padding: 2px 6px;
  margin: 1px;
  background: #f0f0f0;
  border-radius: 8px;
  font-size: 10px;
  color: #555;
`;

const StatsSection = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 16px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 2px solid #ddd;
  font-size: 14px;
  font-weight: bold;
`;

const LoadingSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
`;

const Yearbook: React.FC = () => {
  const { closeWindow } = useWindowsContext();
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

  const handleFlunkClick = (flunk: FlunkNFT) => {
    // Open detailed view - could integrate with existing item viewer
    console.log('Viewing Flunk:', flunk);
    // TODO: Integrate with existing NFT detail modal or window
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.YEARBOOK}
      headerTitle="Flunks High School Yearbook 📖"
      headerIcon="/images/icons/open-book.png"
      onClose={() => closeWindow(WINDOW_IDS.YEARBOOK)}
      initialWidth="900px"
      initialHeight="700px"
      resizable={true}
      showMaximizeButton={true}
    >
      <YearbookContainer>
        <HeaderSection>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 'bold' }}>
            Flunks High School Yearbook
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <span>Search:</span>
            <TextInput
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Name, ID, or trait..."
              style={{ flex: 1, maxWidth: '200px' }}
            />
          </div>

          <Button onClick={loadYearbookData} disabled={loading}>
            🔄 Refresh
          </Button>
        </FilterSection>

        {loading ? (
          <LoadingSection>
            <h3>📚 Loading Yearbook...</h3>
            <Progress value={50} />
            <p style={{ marginTop: '16px', color: '#666' }}>
              Fetching student records from the blockchain...
            </p>
          </LoadingSection>
        ) : error ? (
          <LoadingSection>
            <h3>❌ Error Loading Yearbook</h3>
            <p style={{ color: '#d32f2f' }}>{error}</p>
            <Button onClick={loadYearbookData}>Try Again</Button>
          </LoadingSection>
        ) : (
          <ScrollView style={{ flex: 1 }}>
            <FlunksGrid>
              {filteredFlunks.map((flunk) => (
                <FlunkCard
                  key={flunk.tokenId}
                  clique={flunk.clique || 'UNKNOWN'}
                  onClick={() => handleFlunkClick(flunk)}
                >
                  <FlunkImage 
                    src={flunk.metadata.image} 
                    alt={flunk.metadata.name}
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).src = '/images/icons/user.png';
                    }}
                  />
                  <FlunkName>{flunk.metadata.name}</FlunkName>
                  <FlunkId>#{flunk.tokenId}</FlunkId>
                  
                  {flunk.clique && (
                    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                      <CliqueBadge clique={flunk.clique}>
                        {flunk.clique}
                      </CliqueBadge>
                    </div>
                  )}

                  {flunk.rank && (
                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                      Rank: #{flunk.rank}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {flunk.metadata.attributes
                      .filter(attr => attr.trait_type !== 'Clique')
                      .slice(0, 3)
                      .map((attr, index) => (
                        <TraitPill key={index}>
                          {attr.value}
                        </TraitPill>
                      ))
                    }
                  </div>
                </FlunkCard>
              ))}
            </FlunksGrid>

            {filteredFlunks.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <h3>📭 No students found</h3>
                <p>Try adjusting your search filters</p>
              </div>
            )}
          </ScrollView>
        )}
      </YearbookContainer>
    </DraggableResizeableWindow>
  );
};

export default Yearbook;
