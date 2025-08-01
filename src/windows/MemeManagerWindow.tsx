import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { Window, WindowContent, Button, GroupBox, TextInput, Select, Slider } from 'react95';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';
import * as htmlToImage from 'html-to-image';
import { memeGenerator, MEME_TEMPLATES } from '../utils/memeGenerator';

// Force button styles to ensure they work
const StyledButton = styled(Button)`
  cursor: pointer !important;
  pointer-events: auto !important;
  user-select: none !important;
  
  &:hover {
    cursor: pointer !important;
  }
  
  &:disabled {
    cursor: not-allowed !important;
  }
`;

// Native button for testing
const NativeButton = styled.button`
  padding: 8px 16px;
  background: #c0c0c0;
  border: 2px outset #c0c0c0;
  font-family: 'MS Sans Serif', sans-serif;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #d0d0d0;
  }
  
  &:active {
    border: 2px inset #c0c0c0;
  }
  
  &:disabled {
    background: #a0a0a0;
    cursor: not-allowed;
  }
`;

const MemeContainer = styled.div`
  display: flex;
  height: 600px;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', sans-serif;
`;

const CanvasArea = styled.div`
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ControlPanel = styled.div`
  width: 300px;
  padding: 16px;
  border-left: 2px inset #c0c0c0;
  overflow-y: auto;
`;

const MemeCanvas = styled.div`
  position: relative;
  max-width: 500px;
  max-height: 400px;
  border: 2px inset #c0c0c0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const MemeImage = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
`;

const TextOverlay = styled.div<{
  top: number;
  left: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  strokeWidth: number;
  strokeColor: string;
}>`
  position: absolute;
  top: ${props => props.top}%;
  left: ${props => props.left}%;
  transform: translate(-50%, -50%);
  font-size: ${props => props.fontSize}px;
  font-family: ${props => props.fontFamily};
  color: ${props => props.color};
  font-weight: bold;
  text-align: center;
  cursor: move;
  user-select: none;
  white-space: nowrap;
  -webkit-text-stroke: ${props => props.strokeWidth}px ${props => props.strokeColor};
  text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
  z-index: 10;
`;

const FileUploadButton = styled.label`
  display: inline-block;
  padding: 8px 16px;
  background: #c0c0c0;
  border: 2px outset #c0c0c0;
  cursor: pointer;
  font-family: 'MS Sans Serif', sans-serif;
  
  &:hover {
    background: #d0d0d0;
  }
  
  &:active {
    border: 2px inset #c0c0c0;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ControlSection = styled(GroupBox)`
  margin-bottom: 16px;
`;

const ColorInput = styled.input`
  width: 40px;
  height: 30px;
  border: 2px inset #c0c0c0;
  cursor: pointer;
`;

const PromptTextarea = styled.textarea`
  width: 100%;
  height: 80px;
  border: 2px inset #c0c0c0;
  padding: 4px;
  font-family: 'MS Sans Serif', sans-serif;
  resize: vertical;
`;

const PresetMemeButton = styled(Button)`
  width: 100%;
  margin-bottom: 4px;
`;

interface TextElement {
  id: number;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontFamily: string;
  strokeWidth: number;
  strokeColor: string;
}

interface MemeManagerWindowProps {
  onClose: () => void;
}

const PRESET_MEMES = [
  { text: "WHEN YOU REALIZE", position: { x: 50, y: 20 } },
  { text: "DRAKE POINTING", position: { x: 50, y: 80 } },
  { text: "ME EXPLAINING TO MY MOM", position: { x: 50, y: 20 } },
  { text: "NOBODY:", position: { x: 50, y: 20 } },
  { text: "LITERALLY NOBODY:", position: { x: 50, y: 30 } },
  { text: "ME:", position: { x: 50, y: 80 } },
];

const FONT_OPTIONS = [
  { value: 'Impact, sans-serif', label: 'Impact (Classic)' },
  { value: 'Arial Black, sans-serif', label: 'Arial Black' },
  { value: 'Comic Sans MS, cursive', label: 'Comic Sans' },
  { value: 'MS Sans Serif, sans-serif', label: 'MS Sans Serif' },
];

const MemeManagerWindow: React.FC<MemeManagerWindowProps> = ({ onClose }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [memePrompt, setMemePrompt] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  
  // Current text settings
  const [currentText, setCurrentText] = useState('');
  const [currentFontSize, setCurrentFontSize] = useState(36);
  const [currentColor, setCurrentColor] = useState('#FFFFFF');
  const [currentFont, setCurrentFont] = useState('Impact, sans-serif');
  const [currentStrokeWidth, setCurrentStrokeWidth] = useState(2);
  const [currentStrokeColor, setCurrentStrokeColor] = useState('#000000');
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTextElement = () => {
    if (!currentText.trim()) {
      console.log('No text to add');
      return;
    }
    
    console.log('Adding text element:', currentText);
    
    const newElement: TextElement = {
      id: Date.now(),
      text: currentText,
      x: 50,
      y: 50,
      fontSize: currentFontSize,
      color: currentColor,
      fontFamily: currentFont,
      strokeWidth: currentStrokeWidth,
      strokeColor: currentStrokeColor,
    };
    
    setTextElements([...textElements, newElement]);
    setCurrentText('');
  };

  const removeTextElement = (id: number) => {
    setTextElements(textElements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
  };

  const updateSelectedElement = (updates: Partial<TextElement>) => {
    if (selectedElement === null) return;
    
    setTextElements(textElements.map(el => 
      el.id === selectedElement ? { ...el, ...updates } : el
    ));
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: number) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const element = textElements.find(el => el.id === elementId);
      if (element) {
        const elementX = (element.x / 100) * rect.width;
        const elementY = (element.y / 100) * rect.height;
        setDragOffset({
          x: e.clientX - elementX,
          y: e.clientY - elementY
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || selectedElement === null || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = ((e.clientX - dragOffset.x - rect.left) / rect.width) * 100;
    const newY = ((e.clientY - dragOffset.y - rect.top) / rect.height) * 100;
    
    updateSelectedElement({
      x: Math.max(0, Math.min(100, newX)),
      y: Math.max(0, Math.min(100, newY))
    });
  }, [isDragging, selectedElement, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const generateMemeText = async () => {
    if (!memePrompt.trim()) {
      console.log('No prompt provided for meme generation');
      return;
    }
    
    console.log('Generating meme text for prompt:', memePrompt);
    console.log('Selected template:', selectedTemplate);
    
    setIsGeneratingText(true);
    
    try {
      // Use the enhanced meme generator
      let generatedText;
      if (selectedTemplate) {
        console.log('Using template:', selectedTemplate);
        generatedText = await memeGenerator.generateWithAI(memePrompt, selectedTemplate);
      } else {
        console.log('Using auto-detect');
        generatedText = memeGenerator.processPrompt(memePrompt);
      }
      
      console.log('Generated text:', generatedText);
      
      // Split text into lines and create text elements
      const lines = generatedText.split('\n').filter(line => line.trim());
      console.log('Split into lines:', lines);
      
      // Clear existing text elements first
      setTextElements([]);
      
      // Add new text elements with smart positioning
      lines.forEach((line, index) => {
        if (line.trim()) {
          const newElement: TextElement = {
            id: Date.now() + index * 100,
            text: line.trim(),
            x: 50,
            y: 15 + (index * (60 / Math.max(lines.length - 1, 1))), // Smart spacing based on number of lines
            fontSize: Math.max(24, 40 - (lines.length * 2)), // Smaller font for more lines
            color: currentColor,
            fontFamily: currentFont,
            strokeWidth: currentStrokeWidth,
            strokeColor: currentStrokeColor,
          };
          
          console.log('Adding text element:', newElement);
          
          setTimeout(() => {
            setTextElements(prev => {
              console.log('Current text elements:', prev);
              return [...prev, newElement];
            });
          }, index * 150);
        }
      });
      
    } catch (error) {
      console.error('Error generating meme text:', error);
      // Fallback to simple generation
      const fallbackText = `WHEN ${memePrompt.toUpperCase()}`;
      console.log('Using fallback text:', fallbackText);
      
      const newElement: TextElement = {
        id: Date.now(),
        text: fallbackText,
        x: 50,
        y: 50,
        fontSize: currentFontSize,
        color: currentColor,
        fontFamily: currentFont,
        strokeWidth: currentStrokeWidth,
        strokeColor: currentStrokeColor,
      };
      setTextElements([newElement]);
    } finally {
      setIsGeneratingText(false);
    }
  };

  const addPresetMeme = (preset: typeof PRESET_MEMES[0]) => {
    const newElement: TextElement = {
      id: Date.now(),
      text: preset.text,
      x: preset.position.x,
      y: preset.position.y,
      fontSize: currentFontSize,
      color: currentColor,
      fontFamily: currentFont,
      strokeWidth: currentStrokeWidth,
      strokeColor: currentStrokeColor,
    };
    
    setTextElements([...textElements, newElement]);
  };

  const downloadMeme = async () => {
    if (!canvasRef.current) return;
    
    try {
      const dataUrl = await htmlToImage.toPng(canvasRef.current, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
      });
      
      const link = document.createElement('a');
      link.download = `flunks-meme-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error downloading meme:', error);
    }
  };

  const clearCanvas = () => {
    setTextElements([]);
    setUploadedImage(null);
    setSelectedElement(null);
  };

  const selectedElementData = selectedElement ? textElements.find(el => el.id === selectedElement) : null;

  return (
    <DraggableResizeableWindow 
      windowsId={WINDOW_IDS.MEME_MANAGER}
      headerTitle="🎭 Flunks Meme Manager"
      onClose={onClose}
      initialWidth="900px"
      initialHeight="700px"
      resizable={true}
    >
      <WindowContent>
        <MemeContainer>
          <CanvasArea>
            <MemeCanvas ref={canvasRef}>
              {uploadedImage ? (
                <MemeImage src={uploadedImage} alt="Meme base" />
              ) : (
                <div style={{ color: '#666', textAlign: 'center' }}>
                  Upload an image to start creating memes!
                </div>
              )}
              
              {textElements.map((element) => (
                <TextOverlay
                  key={element.id}
                  top={element.y}
                  left={element.x}
                  fontSize={element.fontSize}
                  color={element.color}
                  fontFamily={element.fontFamily}
                  strokeWidth={element.strokeWidth}
                  strokeColor={element.strokeColor}
                  onMouseDown={(e) => handleMouseDown(e, element.id)}
                  style={{
                    border: selectedElement === element.id ? '2px dashed #ff0000' : 'none',
                    backgroundColor: selectedElement === element.id ? 'rgba(255,0,0,0.1)' : 'transparent',
                  }}
                >
                  {element.text}
                </TextOverlay>
              ))}
            </MemeCanvas>
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <Button onClick={downloadMeme} disabled={!uploadedImage}>
                💾 Download Meme
              </Button>
              <Button onClick={clearCanvas}>
                🗑️ Clear All
              </Button>
            </div>
          </CanvasArea>
          
          <ControlPanel>
            <ControlSection label="📁 Upload Image">
              <FileUploadButton htmlFor="image-upload">
                📷 Choose Image
              </FileUploadButton>
              <HiddenFileInput
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                ref={fileInputRef}
              />
            </ControlSection>
            
            <ControlSection label="🤖 AI Meme Generator">
              <div style={{ marginBottom: '8px' }}>
                <label>Template:</label>
                <Select
                  options={[
                    { value: '', label: 'Auto-detect (Smart)' },
                    ...MEME_TEMPLATES.map(t => ({ value: t.name, label: t.name }))
                  ]}
                  defaultValue=""
                  width={200}
                  onChange={(e) => {
                    if (e && typeof e === 'object' && 'value' in e) {
                      setSelectedTemplate(e.value || '');
                    }
                  }}
                />
              </div>
              <div style={{ marginBottom: '8px' }}>
                <PromptTextarea
                  placeholder="Describe your meme idea... (e.g., 'working from home vs office')"
                  value={memePrompt}
                  onChange={(e) => setMemePrompt(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                <NativeButton 
                  onClick={() => {
                    console.log('Generate button clicked - prompt:', memePrompt);
                    console.log('Prompt trimmed:', memePrompt.trim());
                    console.log('Is generating:', isGeneratingText);
                    if (!memePrompt.trim()) {
                      console.log('Setting default prompt for testing');
                      setMemePrompt('When you realize');
                      return;
                    }
                    generateMemeText();
                  }}
                  disabled={isGeneratingText}
                  style={{ 
                    flex: 1
                  }}
                >
                  {isGeneratingText ? '🤖 Generating...' : '✨ Generate Meme Text'}
                </NativeButton>
                <NativeButton
                  onClick={() => {
                    console.log('Random button clicked');
                    try {
                      const randomIdea = memeGenerator.getRandomMemeIdea();
                      console.log('Random idea:', randomIdea);
                      setMemePrompt(randomIdea);
                    } catch (error) {
                      console.error('Error getting random idea:', error);
                      setMemePrompt('When you realize');
                    }
                  }}
                  style={{ 
                    width: '80px'
                  }}
                >
                  🎲 Random
                </NativeButton>
              </div>
            </ControlSection>
            
            <ControlSection label="📝 Add Text">
              <div style={{ marginBottom: '8px' }}>
                <TextInput
                  placeholder="Enter meme text..."
                  value={currentText}
                  onChange={(e) => setCurrentText(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <Button onClick={addTextElement} disabled={!currentText.trim()}>
                ➕ Add Text
              </Button>
            </ControlSection>
            
            <ControlSection label="🎨 Text Style">
              <div style={{ marginBottom: '8px' }}>
                <label>Font Size: {currentFontSize}px</label>
                <Slider
                  min={12}
                  max={72}
                  value={currentFontSize}
                  onChange={(value) => {
                    setCurrentFontSize(value);
                    if (selectedElementData) updateSelectedElement({ fontSize: value });
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <label>Font Family:</label>
                <Select
                  options={FONT_OPTIONS}
                  defaultValue={currentFont}
                  width={200}
                  onChange={(e) => {
                    if (e && typeof e === 'object' && 'value' in e) {
                      setCurrentFont(e.value || 'Impact, sans-serif');
                      if (selectedElementData) updateSelectedElement({ fontFamily: e.value || 'Impact, sans-serif' });
                    }
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <div>
                  <label>Text Color:</label>
                  <ColorInput
                    type="color"
                    value={currentColor}
                    onChange={(e) => {
                      setCurrentColor(e.target.value);
                      if (selectedElementData) updateSelectedElement({ color: e.target.value });
                    }}
                  />
                </div>
                <div>
                  <label>Stroke Color:</label>
                  <ColorInput
                    type="color"
                    value={currentStrokeColor}
                    onChange={(e) => {
                      setCurrentStrokeColor(e.target.value);
                      if (selectedElementData) updateSelectedElement({ strokeColor: e.target.value });
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <label>Stroke Width: {currentStrokeWidth}px</label>
                <Slider
                  min={0}
                  max={8}
                  value={currentStrokeWidth}
                  onChange={(value) => {
                    setCurrentStrokeWidth(value);
                    if (selectedElementData) updateSelectedElement({ strokeWidth: value });
                  }}
                />
              </div>
            </ControlSection>
            
            <ControlSection label="📜 Quick Presets">
              {PRESET_MEMES.map((preset, index) => (
                <PresetMemeButton
                  key={index}
                  onClick={() => addPresetMeme(preset)}
                >
                  {preset.text}
                </PresetMemeButton>
              ))}
            </ControlSection>
            
            {textElements.length > 0 && (
              <ControlSection label="📝 Text Elements">
                {textElements.map((element) => (
                  <div 
                    key={element.id}
                    style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '4px',
                      backgroundColor: selectedElement === element.id ? '#0080ff' : 'transparent',
                      color: selectedElement === element.id ? 'white' : 'black',
                      cursor: 'pointer',
                      marginBottom: '2px'
                    }}
                    onClick={() => setSelectedElement(element.id)}
                  >
                    <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {element.text.substring(0, 20)}...
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTextElement(element.id);
                      }}
                    >
                      ✖
                    </Button>
                  </div>
                ))}
              </ControlSection>
            )}
          </ControlPanel>
        </MemeContainer>
      </WindowContent>
    </DraggableResizeableWindow>
  );
};

export default MemeManagerWindow;
