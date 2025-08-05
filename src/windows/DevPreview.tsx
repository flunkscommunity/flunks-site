import React from 'react';
import styled from 'styled-components';
import { useWindowsContext } from 'contexts/WindowsContext';
import DraggableResizeableWindow from 'components/DraggableResizeableWindow';
import { WINDOW_IDS } from 'fixed';

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
`;

const PreviewFrame = styled.iframe`
  flex: 1;
  border: 2px inset #c0c0c0;
  background: white;
  width: 100%;
  height: 100%;
`;

const DevPreview: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.DEV_PREVIEW}
      headerTitle="Development Preview - localhost:3000"
      headerIcon="/images/icons/programs.png"
      onClose={() => closeWindow(WINDOW_IDS.DEV_PREVIEW)}
      initialWidth="1000px"
      initialHeight="700px"
      resizable={true}
    >
      <PreviewContainer>
        <PreviewFrame
          src="http://localhost:3000"
          title="Development Preview"
        />
      </PreviewContainer>
    </DraggableResizeableWindow>
  );
};

export default DevPreview;
