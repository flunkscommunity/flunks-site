import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import useSounds from "hooks/useSounds";
import React, { useEffect } from "react";
import { Button } from "react95";

interface Props {
  windowId: string;
  onClose?: () => void;
}

const FlunkMart: React.FC<Props> = (props) => {
  const { windowId, onClose } = props;
  const { closeWindow } = useWindowsContext();

  return (
    <div className="bg-black/80 absolute inset-0 z-[999] flex items-center justify-center md:block">
      <DraggableResizeableWindow
        windowsId={windowId}
        offSetHeight={44}
        headerTitle={"Flunk-E-Mart - coming soon"}
        onClose={() => {
          closeWindow(windowId);
          onClose && onClose();
        }}
        showMaximizeButton={false}
        showHeaderActions={false}
        initialHeight="auto"
        initialWidth="auto"
        openCentered
        style={{
          maxWidth: "400px",
          maxHeight: "200px",
          minHeight: "auto",
          minWidth: "auto",
        }}
        resizable={false}
        
      headerIcon="/images/icons/flunk-e-mart.png"
      >
        <div className="flex flex-col h-full gap-2 justify-center">
          <div className="flex flex-col items-start gap-10">
            <div className="flex items-center gap-4 overflow-hidden w-full">
              <img src="/images/icons/warning.png" />
              <span className="text-xl mt-1">
                We're still putting the final touches on Flunk-E-Mart. Coming
                soon, stay tuned!
              </span>
            </div>
          </div>
          <div className="flex flex-row justify-end items-center px-4 pt-2 gap-2">
            <Button onClick={() => closeWindow(windowId)} className="min-w-[70px]">OK</Button>
          </div>
        </div>
      </DraggableResizeableWindow>
    </div>
  );
};

export default FlunkMart;
