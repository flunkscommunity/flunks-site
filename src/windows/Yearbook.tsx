import React, { useState, useEffect, useMemo } from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { useWindowsContext } from '../contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import styled from 'styled-components';
import { Button, Select, TextInput, Frame, ScrollView, Progress, Checkbox } from 'react95';
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
  
  @media (max-width: 768px) {
    padding: 12px;
    
    h1 {
      font-size: 22px;
      letter-spacing: 1px;
    }
    
    p {
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    
    h1 {
      font-size: 18px;
      letter-spacing: 0.5px;
    }
    
    p {
      font-size: 11px;
    }
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
  flex-wrap: wrap;
  gap: 8px;
  
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
    min-width: 60px;
    text-align: center;
    
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
  
  @media (max-width: 768px) {
    padding: 8px;
    font-size: 10px;
    
    div {
      padding: 4px 8px;
      min-width: 50px;
      font-size: 9px;
    }
  }
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }
  
  .filter-group {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    flex: 1;
    min-width: 120px;
  }
  
  span {
    font-weight: bold;
    font-size: 11px;
    white-space: nowrap;
    color: #000;
    text-shadow: 1px 1px 0px #FFF;
    font-family: 'MS Sans Serif', sans-serif;
    min-width: 40px;
  }
  
  select, input {
    flex: 1;
    min-width: 80px;
  }
  
  @media (max-width: 768px) {
    padding: 8px;
    gap: 8px;
    
    .filter-row {
      flex-direction: column;
      gap: 8px;
      align-items: stretch;
    }
    
    .filter-group {
      min-width: 100%;
      justify-content: space-between;
    }
    
    span {
      font-size: 10px;
      min-width: 60px;
    }
    
    select, input {
      min-width: 120px;
    }
  }
  
  @media (max-width: 480px) {
    .filter-group {
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
    }
    
    span {
      text-align: left;
    }
    
    select, input {
      min-width: 100%;
    }
  }
`;

const TraitFilterSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border: 2px inset #C0C0C0;
  margin-top: 8px;
  max-height: 300px;
  overflow-y: auto;
  
  .trait-category {
    border-bottom: 1px solid #808080;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .trait-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #C0C0C0;
    border-bottom: 1px solid #808080;
    cursor: pointer;
    font-family: 'MS Sans Serif', sans-serif;
    font-weight: bold;
    font-size: 11px;
    
    &:hover {
      background: #D0D0D0;
    }
    
    .trait-name {
      color: #000;
    }
    
    .trait-count {
      color: #666;
      font-size: 10px;
    }
    
    .expand-icon {
      font-size: 12px;
      transition: transform 0.2s;
      
      &.expanded {
        transform: rotate(180deg);
      }
    }
  }
  
  .trait-values {
    padding: 8px;
    background: #FFFFFF;
    display: none;
    flex-direction: column;
    gap: 4px;
    
    &.expanded {
      display: flex;
    }
    
    .trait-value {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px;
      cursor: pointer;
      border-radius: 2px;
      
      &:hover {
        background: #E0E0E0;
      }
      
      label {
        font-family: 'MS Sans Serif', sans-serif;
        font-size: 10px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        
        .value-name {
          color: #000;
        }
        
        .value-count {
          color: #666;
          margin-left: auto;
        }
      }
    }
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
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 8px;
    padding: 8px;
  }
  
  @media (max-width: 360px) {
    grid-template-columns: 1fr;
    gap: 8px;
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
  
  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-2px) scale(1.01);
      box-shadow: 4px 4px 0px #FF00FF, 6px 6px 0px #00FFFF;
    }
  }
  
  @media (max-width: 480px) {
    &:hover {
      transform: none;
      box-shadow: 4px 4px 0px #808080;
    }
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
  
  @media (max-width: 768px) {
    height: 160px;
  }
  
  @media (max-width: 480px) {
    height: 140px;
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
  
  @media (max-width: 768px) {
    padding: 10px;
    
    h3 {
      font-size: 13px;
    }
    
    .token-id {
      font-size: 11px;
    }
    
    .clique-badge {
      font-size: 9px;
      padding: 3px 6px;
    }
    
    .rank {
      font-size: 10px;
    }
    
    .traits .trait {
      font-size: 8px;
      padding: 1px 4px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    
    h3 {
      font-size: 12px;
    }
    
    .token-id {
      font-size: 10px;
    }
    
    .clique-badge {
      font-size: 8px;
      padding: 2px 4px;
    }
    
    .rank {
      font-size: 9px;
    }
    
    .traits .trait {
      font-size: 7px;
      padding: 1px 3px;
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
    sortBy: 'random'
  });
  
  // New trait filtering state
  const [selectedTraits, setSelectedTraits] = useState<{ [traitType: string]: string[] }>({});
  const [expandedTraits, setExpandedTraits] = useState<{ [traitType: string]: boolean }>({});

  // Load initial data immediately and show Flunks right away
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
        // Generate more mock data and show it immediately (no artificial delay)
        const mockFlunks = YearbookMockData.generateMockFlunks(200);
        const mockStats = YearbookMockData.getMockStats();
        
        setFlunks(mockFlunks);
        setStats(mockStats);
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

  // Extract all unique trait types and values with counts
  const availableTraits = useMemo(() => {
    const traitMap = new Map<string, Map<string, number>>();
    
    flunks.forEach(flunk => {
      flunk.metadata.attributes.forEach(attr => {
        if (!traitMap.has(attr.trait_type)) {
          traitMap.set(attr.trait_type, new Map());
        }
        const valueMap = traitMap.get(attr.trait_type)!;
        valueMap.set(attr.value, (valueMap.get(attr.value) || 0) + 1);
      });
    });

    const result: { [key: string]: { [value: string]: number } } = {};
    traitMap.forEach((valueMap, traitType) => {
      const values: { [value: string]: number } = {};
      Array.from(valueMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([value, count]) => {
          values[value] = count;
        });
      result[traitType] = values;
    });

    return result;
  }, [flunks]);

  // Handle trait expansion toggle
  const toggleTraitExpansion = (traitType: string) => {
    setExpandedTraits(prev => ({
      ...prev,
      [traitType]: !prev[traitType]
    }));
  };

  // Handle trait value selection
  const toggleTraitValue = (traitType: string, value: string) => {
    setSelectedTraits(prev => {
      const currentValues = prev[traitType] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [traitType]: newValues
      };
    });
  };

  // Clear all trait filters
  const clearAllTraits = () => {
    setSelectedTraits({});
  };

  const filteredFlunks = useMemo(() => {
    let filtered = flunks;

    // Filter by clique
    if (filters.clique !== 'ALL') {
      filtered = filtered.filter(flunk => flunk.clique === filters.clique);
    }

    // Filter by selected traits (new Flowty-style filtering)
    Object.entries(selectedTraits).forEach(([traitType, selectedValues]) => {
      if (selectedValues.length > 0) {
        filtered = filtered.filter(flunk => 
          flunk.metadata.attributes.some(attr => 
            attr.trait_type === traitType && selectedValues.includes(attr.value)
          )
        );
      }
    });

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

    // Sort - randomize by default, but allow other sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'tokenId':
          return a.tokenId - b.tokenId;
        case 'rank':
          return (a.rank || 9999) - (b.rank || 9999);
        case 'name':
          return a.metadata.name.localeCompare(b.metadata.name);
        case 'random':
        default:
          // Consistent randomization based on token ID
          return (a.tokenId % 17) - (b.tokenId % 17);
      }
    });

    return filtered;
  }, [flunks, filters, selectedTraits]);

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
          <div className="filter-row">
            <div className="filter-group">
              <span>Clique:</span>
              <Select
                value={filters.clique}
                onChange={(value) => setFilters(prev => ({ ...prev, clique: value.value }))}
                options={[
                  { value: 'ALL', label: 'All Cliques' },
                  { value: 'GEEK', label: '🤓 GEEKS' },
                  { value: 'JOCK', label: '🏈 JOCKS' },
                  { value: 'PREP', label: '👔 PREPS' },
                  { value: 'FREAK', label: '🎸 FREAKS' }
                ]}
              />
            </div>

            <div className="filter-group">
              <span>Sort:</span>
              <Select
                value={filters.sortBy}
                onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value.value as 'tokenId' | 'rank' | 'name' | 'random' }))}
                options={[
                  { value: 'random', label: 'Random' },
                  { value: 'tokenId', label: 'Token ID' },
                  { value: 'rank', label: 'Rarity Rank' },
                  { value: 'name', label: 'Name' }
                ]}
              />
            </div>

            <div className="filter-group">
              <span>Search:</span>
              <TextInput
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Name, ID, or trait..."
              />
            </div>

            <div className="filter-group">
              <Button
                onClick={() => {
                  setFilters({
                    clique: 'ALL',
                    trait: 'ALL',
                    search: '',
                    sortBy: 'random'
                  });
                  clearAllTraits();
                }}
              >
                🔄 Reset
              </Button>

              <Button onClick={loadYearbookData}>
                🔄 Refresh
              </Button>
            </div>
          </div>

          {/* New Flowty-style Trait Filtering */}
          <TraitFilterSection>
            {Object.entries(availableTraits).map(([traitType, values]) => (
              <div key={traitType} className="trait-category">
                <div 
                  className="trait-header"
                  onClick={() => toggleTraitExpansion(traitType)}
                >
                  <div className="trait-name">{traitType}</div>
                  <div className="trait-count">{Object.keys(values).length}</div>
                  <div className={`expand-icon ${expandedTraits[traitType] ? 'expanded' : ''}`}>
                    ▼
                  </div>
                </div>
                <div className={`trait-values ${expandedTraits[traitType] ? 'expanded' : ''}`}>
                  {Object.entries(values).map(([value, count]) => (
                    <div key={value} className="trait-value">
                      <label>
                        <Checkbox
                          checked={selectedTraits[traitType]?.includes(value) || false}
                          onChange={() => toggleTraitValue(traitType, value)}
                        />
                        <span className="value-name">{value}</span>
                        <span className="value-count">{count}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TraitFilterSection>
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
