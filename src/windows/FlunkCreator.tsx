import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useWindowsContext } from 'contexts/WindowsContext';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';
import { TRAIT_DATA } from '../data/traitData';
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

const FlunkCreator: React.FC = () => {
  const { user } = useDynamicContext();
  const { closeWindow } = useWindowsContext();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Universal function to clean up trait names for display
  const cleanTraitName = (name: string): string => {
    return name
      // Remove numbered prefixes like __0000_, _0001_, _0000s_0001_, etc.
      .replace(/__?\d{4}s?_\d{4}_/g, '')
      .replace(/__?\d{4}_/g, '')
      .replace(/_\d{4}s_\d{4}_/g, '')
      // Remove clique prefixes
      .replace(/^(FREAK|GEEK|JOCK|PREP)_/, '')
      // Remove category prefixes
      .replace(/PIGMENT[^-]*-\s*/, '')
      .replace(/PIGMENT\s*\([^)]+\)\s*-\s*/, '')
      // Remove parenthetical clique references
      .replace(/\([^)]*(?:FREAK|GEEK|JOCK|PREP)[^)]*\)/g, '')
      // Remove version suffixes
      .replace(/-V[123]$/g, '')
      // Remove leading/trailing dashes and spaces
      .replace(/^[-\s]+|[-\s]+$/g, '')
      // Replace underscores and multiple dashes with spaces
      .replace(/_+/g, ' ')
      .replace(/-+/g, ' ')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  const [selectedTraits, setSelectedTraits] = useState<SelectedTraits>({
    pigment: 'none', // Base color - prioritized first
    backdrop: 'none',
    torso: 'none',
    head: 'none',
    face: 'none',
    eyebrows: 'none',
    headOverlay: 'none'
  });
  
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    pigment: true, // Start with pigment expanded
    backdrop: false,
    torso: false,
    head: false,
    face: false,
    eyebrows: false,
    headOverlay: false
  });
  
  const [flunkName, setFlunkName] = useState('My Custom Flunk');

  // Define trait categories based on your actual NFT structure
  const traitCategories: TraitCategory[] = [
    {
      name: 'Backdrop',
      options: [], // Will be populated when you upload files
      layer: 1
    },
    {
      name: 'Clique',
      options: ['GEEK', 'JOCK', 'PREP', 'FREAK'],
      layer: 2
    },
    {
      name: 'Torso',
      options: [], // Will scan torso folder
      layer: 3
    },
    {
      name: 'Head',
      options: [], // Will scan head folder
      layer: 4
    },
    {
      name: 'Face',
      options: [], // Will scan face folder
      layer: 5
    },
    {
      name: 'Details',
      options: ['Eyebrows', 'Head Overlays', 'Pigment'],
      layer: 6
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const selectTrait = (category: string, trait: string) => {
    console.log('Selecting trait:', category, trait);
    setSelectedTraits(prev => ({
      ...prev,
      [category]: trait
    }));
  };

  const getImagePath = (category: string, trait: string) => {
    console.log('Getting image path for:', category, trait);
    if (trait === 'none') return null;
    
    // Map category names to TRAIT_DATA keys
    const categoryMap: { [key: string]: string } = {
      'backdrop': 'BACKDROPS',
      'torso': 'TORSO', 
      'head': 'HEAD',
      'face': 'FACE',
      'eyebrows': 'EYEBROWS',
      'headOverlay': 'HEAD_OVERLAYERS',
      'pigment': 'PIGMENT'
    };
    
    const dataKey = categoryMap[category];
    console.log('Category map result:', dataKey);
    if (!dataKey || !TRAIT_DATA[dataKey]) return null;
    
    const traitData = TRAIT_DATA[dataKey].find(t => t.name === trait);
    console.log('Found trait data:', traitData);
    return traitData ? traitData.path : null;
  };

  const renderFlunk = () => {
    const layers = [];
    
    // Backdrop layer (lowest z-index)
    if (selectedTraits.backdrop && selectedTraits.backdrop !== 'none') {
      const backdropPath = getImagePath('backdrop', selectedTraits.backdrop);
      if (backdropPath) {
        layers.push(
          <LayeredImage
            key="backdrop"
            src={backdropPath}
            alt="Backdrop"
            style={{ zIndex: 1 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
    }

    // Pigment layer (base character color)
    if (selectedTraits.pigment && selectedTraits.pigment !== 'none') {
      const pigmentPath = getImagePath('pigment', selectedTraits.pigment);
      if (pigmentPath) {
        layers.push(
          <LayeredImage
            key="pigment"
            src={pigmentPath}
            alt="Base Color"
            style={{ zIndex: 10 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
    }

    // Torso layer
    if (selectedTraits.torso && selectedTraits.torso !== 'none') {
      const torsoPath = getImagePath('torso', selectedTraits.torso);
      if (torsoPath) {
        layers.push(
          <LayeredImage
            key="torso"
            src={torsoPath}
            alt="Torso"
            style={{ zIndex: 20 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
    }

    // Head layer
    if (selectedTraits.head && selectedTraits.head !== 'none') {
      const headPath = getImagePath('head', selectedTraits.head);
      if (headPath) {
        layers.push(
          <LayeredImage
            key="head"
            src={headPath}
            alt="Head"
            style={{ zIndex: 30 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      }
    }

    // Face layer
    if (selectedTraits.face && selectedTraits.face !== 'none') {
      const facePath = getImagePath('face', selectedTraits.face);
      if (facePath) {
        layers.push(
          <LayeredImage
            key="face"
            src={facePath}
            alt="Face"
            style={{ zIndex: 40 }}
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
    // Randomly select a pigment/base color first
    const pigments = TRAIT_DATA.PIGMENT || [];
    const randomPigment = pigments.length > 0 ? pigments[Math.floor(Math.random() * pigments.length)].name : 'none';
    
    const newTraits: SelectedTraits = {
      pigment: randomPigment, // Base color selection
      backdrop: Math.random() > 0.5 ? 'none' : 'none', // Will be updated when files uploaded
      torso: 'none', // Will be randomized when files uploaded
      head: 'none', // Will be randomized when files uploaded  
      face: 'none', // Will be randomized when files uploaded
      eyebrows: 'none',
      headOverlay: 'none'
    };
    setSelectedTraits(newTraits);
  };

  const resetFlunk = () => {
    setSelectedTraits({
      pigment: 'none', // Base color selection
      backdrop: 'none',
      torso: 'none',
      head: 'none',
      face: 'none',
      eyebrows: 'none',
      headOverlay: 'none'
    });
    setFlunkName('My Custom Flunk');
  };

  return (
    <DraggableResizeableWindow
      headerTitle="Flunk Creator"
      headerIcon="/images/icons/pocket-juniors.png"
      windowsId={WINDOW_IDS.FLUNK_CREATOR}
      onClose={() => closeWindow(WINDOW_IDS.FLUNK_CREATOR)}
      initialWidth="800px"
      initialHeight="600px"
      resizable={true}
    >
      <AppContainer>
        <TraitPanel>
          <div style={{ padding: '8px', background: '#f0f0f0', fontSize: '11px', fontWeight: 'bold' }}>
            🎨 Customize Your Flunk
          </div>
          
          {/* PIGMENT FIRST - MAKES MOST SENSE FOR USER WORKFLOW */}
          
          {/* 1. PIGMENT/BASE COLOR - BACK TO FIRST POSITION */}
          <TraitSection>
            <TraitHeader 
              onClick={() => toggleSection('pigment')}
              style={{ 
                background: 'linear-gradient(90deg, #ff6b35, #f7931e)',
                border: '2px solid #e55100',
                fontWeight: 'bold'
              }}
            >
              🎨 Pigment (Start Here!)
              <span>{expandedSections.pigment ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.pigment}>
              <TraitItem
                selected={selectedTraits.pigment === 'none'}
                onClick={() => selectTrait('pigment', 'none')}
                style={{ background: selectedTraits.pigment === 'none' ? '#ffe0b3' : 'transparent' }}
              >
                🚫 No Base Color
              </TraitItem>
              {TRAIT_DATA.PIGMENT?.map((pigment) => {
                const displayName = cleanTraitName(pigment.name);
                
                return (
                  <TraitItem
                    key={pigment.name}
                    selected={selectedTraits.pigment === pigment.name}
                    onClick={() => selectTrait('pigment', pigment.name)}
                    style={{ background: selectedTraits.pigment === pigment.name ? '#ffe0b3' : 'transparent' }}
                  >
                    🎨 {displayName}
                  </TraitItem>
                );
              })}
            </TraitList>
          </TraitSection>

          {/* 2. BACKDROP - SECOND POSITION */}
          <TraitSection>
            <TraitHeader onClick={() => toggleSection('backdrop')}>
              🌄 Backdrop
              <span>{expandedSections.backdrop ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.backdrop}>
              <TraitItem
                selected={selectedTraits.backdrop === 'none'}
                onClick={() => selectTrait('backdrop', 'none')}
              >
                🚫 No Backdrop
              </TraitItem>
              {TRAIT_DATA.BACKDROPS?.map((backdrop) => (
                <TraitItem
                  key={backdrop.name}
                  selected={selectedTraits.backdrop === backdrop.name}
                  onClick={() => selectTrait('backdrop', backdrop.name)}
                >
                  🌄 {cleanTraitName(backdrop.name)}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          {/* 3. FACE - THIRD POSITION */}
          <TraitSection>
            <TraitHeader onClick={() => toggleSection('face')}>
              😊 Face
              <span>{expandedSections.face ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.face}>
              <TraitItem
                selected={selectedTraits.face === 'none'}
                onClick={() => selectTrait('face', 'none')}
              >
                🚫 Default
              </TraitItem>
              {TRAIT_DATA.FACE?.map((face) => (
                <TraitItem
                  key={face.name}
                  selected={selectedTraits.face === face.name}
                  onClick={() => selectTrait('face', face.name)}
                >
                  😊 {cleanTraitName(face.name)}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('backdrop')}>
              🌄 Backdrop
              <span>{expandedSections.backdrop ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.backdrop}>
              <TraitItem
                selected={selectedTraits.backdrop === 'none'}
                onClick={() => selectTrait('backdrop', 'none')}
              >
                🚫 No Backdrop
              </TraitItem>
              {/* More backdrop options will be added when files are uploaded */}
              {TRAIT_DATA.BACKDROPS?.map((backdrop) => (
                <TraitItem
                  key={backdrop.name}
                  selected={selectedTraits.backdrop === backdrop.name}
                  onClick={() => selectTrait('backdrop', backdrop.name)}
                >
                  🌄 {cleanTraitName(backdrop.name)}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('torso')}>
              � Torso
              <span>{expandedSections.torso ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.torso}>
              <TraitItem
                selected={selectedTraits.torso === 'none'}
                onClick={() => selectTrait('torso', 'none')}
              >
                🚫 Default
              </TraitItem>
              {/* Torso options will be populated when files are uploaded */}
              {TRAIT_DATA.TORSO?.map((torso) => (
                <TraitItem
                  key={torso.name}
                  selected={selectedTraits.torso === torso.name}
                  onClick={() => selectTrait('torso', torso.name)}
                >
                  👕 {cleanTraitName(torso.name)}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('head')}>
              🗣️ Head
              <span>{expandedSections.head ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.head}>
              <TraitItem
                selected={selectedTraits.head === 'none'}
                onClick={() => selectTrait('head', 'none')}
              >
                🚫 Default
              </TraitItem>
              {/* Head options will be populated when files are uploaded */}
              {TRAIT_DATA.HEAD?.map((head) => (
                <TraitItem
                  key={head.name}
                  selected={selectedTraits.head === head.name}
                  onClick={() => selectTrait('head', head.name)}
                >
                  💇 {cleanTraitName(head.name)}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('face')}>
              😊 Face
              <span>{expandedSections.face ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.face}>
              <TraitItem
                selected={selectedTraits.face === 'none'}
                onClick={() => selectTrait('face', 'none')}
              >
                🚫 Default
              </TraitItem>
              {/* Face options will be populated when files are uploaded */}
              {TRAIT_DATA.FACE?.map((face) => (
                <TraitItem
                  key={face.name}
                  selected={selectedTraits.face === face.name}
                  onClick={() => selectTrait('face', face.name)}
                >
                  😊 {cleanTraitName(face.name)}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('eyebrows')}>
              🤨 Eyebrows
              <span>{expandedSections.eyebrows ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.eyebrows}>
              <TraitItem
                selected={selectedTraits.eyebrows === 'none'}
                onClick={() => selectTrait('eyebrows', 'none')}
              >
                🚫 No Eyebrows
              </TraitItem>
              {TRAIT_DATA.EYEBROWS?.map((eyebrow) => (
                <TraitItem
                  key={eyebrow.name}
                  selected={selectedTraits.eyebrows === eyebrow.name}
                  onClick={() => selectTrait('eyebrows', eyebrow.name)}
                >
                  🤨 {cleanTraitName(eyebrow.name)}
                </TraitItem>
              ))}
            </TraitList>
          </TraitSection>

          <TraitSection>
            <TraitHeader onClick={() => toggleSection('headOverlay')}>
              🎩 Head Overlays
              <span>{expandedSections.headOverlay ? '▼' : '▶'}</span>
            </TraitHeader>
            <TraitList expanded={expandedSections.headOverlay}>
              <TraitItem
                selected={selectedTraits.headOverlay === 'none'}
                onClick={() => selectTrait('headOverlay', 'none')}
              >
                🚫 No Overlay
              </TraitItem>
              {TRAIT_DATA.HEAD_OVERLAYERS?.map((overlay) => (
                <TraitItem
                  key={overlay.name}
                  selected={selectedTraits.headOverlay === overlay.name}
                  onClick={() => selectTrait('headOverlay', overlay.name)}
                >
                  � {cleanTraitName(overlay.name)}
                </TraitItem>
              ))}
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
            Create your custom Flunk by mixing and matching traits! Start with a base color (pigment), 
            add torso and head styles, facial features, eyebrows, and customize with overlays.
          </div>
        </PreviewFrame>
      </AppContainer>
    </DraggableResizeableWindow>
  );
};

export default FlunkCreator;
