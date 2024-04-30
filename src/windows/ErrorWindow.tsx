import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import useSounds from "hooks/useSounds";
import React, { useEffect } from "react";

interface Props {
  title: string;
  message: string;
  actions: React.ReactNode;
  windowId: string;
  onClose?: () => void;
}

const ErrorWindow: React.FC<Props> = (props) => {
  const { message, title, actions, windowId, onClose } = props;
  const { closeWindow } = useWindowsContext();
  const { sounds, playSound } = useSounds();

  useEffect(() => {
    playSound(sounds.error);
  }, []);

  return (
    <div className="bg-black/80 fixed inset-0 z-[999]">
      <DraggableResizeableWindow
        windowsId={windowId}
        offSetHeight={44}
        headerTitle={title}
        onClose={() => {
          closeWindow(windowId);
          onClose && onClose();
        }}
        showMaximizeButton={false}
        showHeaderActions={false}
        initialHeight="auto"
        initialWidth="auto"
        openCentered
        resizable={false}
      >
        <div className="flex flex-col h-full gap-2 justify-center">
          <div className="flex flex-col items-start gap-10">
            <div className="flex items-center gap-4">
              <img src="/images/icons/error.png" />
              <span className="text-xl mt-1">{message}</span>
            </div>
          </div>
          <div className="flex flex-row justify-end items-center px-4 pt-2 gap-2">
            {actions}
          </div>
        </div>
      </DraggableResizeableWindow>
    </div>
  );
};

export default ErrorWindow;
