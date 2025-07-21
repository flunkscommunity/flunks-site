import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useWindowsContext } from 'contexts/WindowsContext';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { 
  Window, 
  WindowHeader, 
  WindowContent, 
  Button, 
  Frame, 
  MenuList,
  MenuListItem,
  Separator,
  TextField,
  Checkbox
} from 'react95';

const AppContainer = styled.div`
  display: flex;
  height: 100%;
  background: #c0c0c0;
`;

const TraitPanel = styled.div`
  width: 250px;
  border-right: 2px inset #c0c0c0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`;

const TraitSection = styled.div`
  margin-bottom: 2px;
`;

const TraitHeader = styled.div`
  background: linear-gradient(90deg, #1084d0, #0066cc);
  color: white;
  padding: 6px 8px;
  font-weight: bold;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:hover {
    background: linear-gradient(90deg, #0066cc, #1084d0);
  }
`;

const TraitList = styled.div<{ expanded: boolean }>`
  display: ${props => props.expanded ? 'block' : 'none'};
  background: #f0f0f0;
  max-height: 200px;
  overflow-y: auto;
`;

const TraitItem = styled.div<{ selected: boolean }>`
  padding: 4px 12px;
  cursor: pointer;
  font-size: 11px;
  background: ${props => props.selected ? '#316ac5' : 'transparent'};
  color: ${props => props.selected ? 'white' : 'black'};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.selected ? '#316ac5' : '#ddd'};
  }
`;

const PreviewFrame = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #87CEEB 0%, #98FB98 100%);
`;

const FlunkCanvas = styled.div`
  position: relative;
  width: 400px;
  height: 400px;
  background: white;
  border: 3px solid #000;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LayeredImage = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
`;

const ActionPanel = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
`;

const FlunkNameInput = styled.div`
  margin-top: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

interface TraitCategory {
  name: string;
  options: string[];
  layer: number;
}

interface SelectedTraits {
  [category: string]: string;
}

const MakeAFlunk: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow } = useWindowsContext();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    base: 'base',
    style: 'none',
    eyes: 'base-eyes'
  });
  
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    base: true,
    style: false,
    extras: false
  });
  
  const [flunkName, setFlunkName] = useState('My Custom Flunk');

  // Define trait categories and their available options
  const traitCategories: TraitCategory[] = [
    {
      name: 'Base Type',
      options: [
        'ART', 'BIOLOGY', 'CHEMISTRY', 'HISTORY', 
        'MATHS', 'MUSIC', 'PHYSICS', 'SPORT'
      ],
      layer: 1
    },
    {
      name: 'Style Theme',
      options: [
        'none', 'barbershop', 'baseball', 'casino', 'origami',
        'plague-doctor', 'radioactive', 'robot', 'skeleton'
      ],
      layer: 2
    },
    {
      name: 'Eyes',
      options: ['base-eyes'],
      layer: 3
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const selectTrait = (category: string, trait: string) => {
    setSelectedTraits(prev => ({
      ...prev,
      [category]: trait
    }));
  };

  const getImagePath = (category: string, trait: string, part: string) => {
    if (category === 'base') {
      return `/images/jnr-traits/bases/${part}_BASE.${trait}.png`;
    } else if (category === 'style' && trait !== 'none') {
      return `/images/jnr-traits/${trait}-${part}.png`;
    } else if (category === 'eyes') {
      return `/images/jnr-traits/${trait}.png`;
    }
    return null;
  };

  const renderFlunk = () => {
    const layers = [];
    const parts = ['torso', 'head', 'bottoms', 'lh', 'rh', 'back', 'shoes'];
    
    // Base layer (always present)
    if (selectedTraits.base) {
      parts.forEach((part, index) => {
        const imagePath = getImagePath('base', selectedTraits.base, part.toUpperCase());
        if (imagePath) {
          layers.push(
            <LayeredImage
              key={`base-${part}`}
              src={imagePath}
              alt={`Base ${part}`}
              style={{ zIndex: 10 + index }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          );
        }
      });
    }

    // Style layer (if selected)
    if (selectedTraits.style && selectedTraits.style !== 'none') {
      parts.forEach((part, index) => {
        const imagePath = getImagePath('style', selectedTraits.style, part);
        if (imagePath) {
          layers.push(
            <LayeredImage
              key={`style-${part}`}
              src={imagePath}
              alt={`${selectedTraits.style} ${part}`}
              style={{ zIndex: 20 + index }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          );
        }
      });
    }

    // Eyes layer
    if (selectedTraits.eyes) {
      const eyesPath = getImagePath('eyes', selectedTraits.eyes, '');
      if (eyesPath) {
        layers.push(
          <LayeredImage
            key="eyes"
            src={eyesPath}
            alt="Eyes"
            style={{ zIndex: 30 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
    }

    return layers;
  };

  const downloadFlunk = () => {
    // This would implement canvas-to-image download functionality
    alert('Download feature coming soon! 📸');
  };

  const randomizeFlunk = () => {
    const newTraits: SelectedTraits = {
      base: traitCategories[0].options[Math.floor(Math.random() * traitCategories[0].options.length)],
      style: traitCategories[1].options[Math.floor(Math.random() * traitCategories[1].options.length)],
      eyes: 'base-eyes'
    };
    setSelectedTraits(newTraits);
  };

  const resetFlunk = () => {
    setSelectedTraits({
      base: 'base',
      style: 'none',
      eyes: 'base-eyes'
    });
    setFlunkName('My Custom Flunk');
  };

  return (
    <DraggableResizeableWindow
      headerTitle="Make a Flunk"
      headerIcon="/images/icons/pocket-juniors.png"
      windowsId={WINDOW_IDS.MAKE_A_FLUNK}
      onClose={() => closeWindow(WINDOW_IDS.MAKE_A_FLUNK)}
      initialWidth="800px"
      initialHeight="600px"
      resizable={true}
    >
      <AppContainer>
        <TraitPanel>
          <div style={{ padding: '8px', background: '#f0f0f0', fontSize: '11px', fontWeight: 'bold' }}>
            🎨 Customize Your Flunk
          </div>
          
          <TraitSection>
            <TraitHeader onClick={() => toggleSection('base')}>
              📚 Base Class
              <span>{expandedSections.base ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.base}>
              {traitCategories[0].options.map((option) => (
                <TraitItem
                  key={option}
                  selected={selectedTraits.base === option}
                  onClick={() => selectTrait('base', option)}
                >
                  <span style={{ fontSize: '14px' }}>
                    {option === 'ART' && '🎨'}
                    {option === 'BIOLOGY' && '🧬'}
                    {option === 'CHEMISTRY' && '⚗️'}
                    {option === 'HISTORY' && '📜'}
                    {option === 'MATHS' && '🔢'}
                    {option === 'MUSIC' && '🎵'}
                    {option === 'PHYSICS' && '🔬'}
                    {option === 'SPORT' && '⚽'}
                  </span>
                  {option.toLowerCase()}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('style')}>
              👔 Style Theme
              <span>{expandedSections.style ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.style}>
              {traitCategories[1].options.map((option) => (
                <TraitItem
                  key={option}
                  selected={selectedTraits.style === option}
                  onClick={() => selectTrait('style', option)}
                >
                  <span style={{ fontSize: '14px' }}>
                    {option === 'none' && '🚫'}
                    {option === 'barbershop' && '💈'}
                    {option === 'baseball' && '⚾'}
                    {option === 'casino' && '🎰'}
                    {option === 'origami' && '📄'}
                    {option === 'plague-doctor' && '🩺'}
                    {option === 'radioactive' && '☢️'}
                    {option === 'robot' && '🤖'}
                    {option === 'skeleton' && '💀'}
                  </span>
                  {option === 'none' ? 'No Style' : option.replace('-', ' ')}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('extras')}>
              👀 Extras
              <span>{expandedSections.extras ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.extras}>
              <TraitItem
                selected={selectedTraits.eyes === 'base-eyes'}
                onClick={() => selectTrait('eyes', 'base-eyes')}
              >
                👀 Default Eyes
              </TraitItem>
            </TraitList>
          </TraitSection>
        </TraitPanel>

        <PreviewFrame>
          <FlunkCanvas ref={canvasRef}>
            {renderFlunk()}
          </FlunkCanvas>
          
          <FlunkNameInput>
            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Name:</span>
            <TextField
              value={flunkName}
              onChange={(e) => setFlunkName(e.target.value)}
              style={{ width: '200px' }}
            />
          </FlunkNameInput>

          <ActionPanel>
            <Button onClick={randomizeFlunk}>
              🎲 Randomize
            </Button>
            <Button onClick={resetFlunk}>
              🔄 Reset
            </Button>
            <Button onClick={downloadFlunk}>
              📸 Save Image
            </Button>
          </ActionPanel>

          <div style={{ 
            marginTop: '20px', 
            fontSize: '11px', 
            color: '#666', 
            textAlign: 'center',
            maxWidth: '400px'
          }}>
            Mix and match traits to create your perfect Flunk! Choose a base class, add style themes, 
            and customize details. Your creation will be a unique combination of the Flunks universe traits.
          </div>
        </PreviewFrame>
      </AppContainer>
    </DraggableResizeableWindow>
  );
};

export default MakeAFlunk;
