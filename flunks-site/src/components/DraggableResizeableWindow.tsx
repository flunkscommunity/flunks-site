import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';

const WindowWrapper = styled.div<{ width: string; height: string }>`
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
`;

const Header = styled.div`
  background: #f0f0f0;
  padding: 10px;
  cursor: move;
  user-select: none;
`;

const Content = styled.div`
  padding: 10px;
`;

interface DraggableResizeableWindowProps {
  windowsId: string;
  onClose: () => void;
  initialWidth: string;
  initialHeight: string;
  headerTitle: string;
  headerIcon?: string;
  showMaximizeButton?: boolean;
  resizable?: boolean;
  children: React.ReactNode;
}

const DraggableResizeableWindow: React.FC<DraggableResizeableWindowProps> = ({ 
  windowsId, 
  onClose, 
  initialWidth, 
  initialHeight, 
  headerTitle, 
  headerIcon, 
  showMaximizeButton, 
  resizable, 
  children 
}) => {
  const windowRef = useRef<HTMLDivElement>(null);

  const handleDrag = (e: React.MouseEvent) => {
    // Implement drag functionality
  };

  const handleResize = (e: React.MouseEvent) => {
    // Implement resize functionality
  };

  useEffect(() => {
    // Add event listeners for drag and resize
    return () => {
      // Clean up event listeners
    };
  }, []);

  return (
    <WindowWrapper ref={windowRef} width={initialWidth} height={initialHeight}>
      <Header onMouseDown={handleDrag}>
        {headerIcon && <img src={headerIcon} alt="icon" style={{ marginRight: '8px' }} />}
        {headerTitle}
        {showMaximizeButton && <button onClick={onClose}>Maximize</button>}
      </Header>
      <Content>
        {children}
      </Content>
    </WindowWrapper>
  );
};

export default DraggableResizeableWindow;