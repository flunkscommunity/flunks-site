import { useWindowsContext } from "contexts/WindowsContext";
import useWindowSize from "hooks/useWindowSize";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Button, Window, WindowContent, WindowHeader } from "react95";
import styled from "styled-components";
import ErrorWindow from "windows/ErrorWindow";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface Props {
  headerTitle: string;
  children: React.ReactNode;
  onClose?: () => void;
  offSetHeight?: number;
  initialHeight?: string;
  initialWidth?: string;
  showHeaderActions?: boolean;
  showMaximizeButton?: boolean;
  windowClassName?: string;
  resizable?: boolean;
  openCentered?: boolean;
  authGuard?: boolean;
  windowsId: string;
  style?: React.CSSProperties;
  onHelp?: () => void;
}

const WindowButtons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const DraggableResizeableWindow: React.FC<Props> = (props) => {
  const {
    headerTitle,
    offSetHeight = 0,
    onClose,
    initialHeight = "90%",
    initialWidth = "90%",
    showHeaderActions = true,
    showMaximizeButton = true,
    children,
    windowClassName = "",
    resizable = true,
    authGuard = props.authGuard || false,
    onHelp,
  } = props;
  const windowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable>(null);
  const { width, height } = useWindowSize();
  const { closeWindow } = useWindowsContext();
  const { user } = useDynamicContext();

  const handleMaximize = () => {
    if (!resizable) return;

    if (windowRef.current) {
      if (windowRef.current.style.width === "100%") {
        windowRef.current.style.width = initialWidth;
        windowRef.current.style.height = initialHeight;
        windowRef.current.style.left = "0";
        windowRef.current.style.top = "0";
      } else {
        windowRef.current.style.height = "100%";
        windowRef.current.style.width = "100%";
        windowRef.current.style.top = "0";
        windowRef.current.style.left = "0";
      }

      if (draggableRef.current) {
        draggableRef.current.setState({
          x: 0,
          y: 0,
        });
      }
    }
  };

  const bringWindowToFront = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
    }

    if (windowRef.current) {
      let maxZ = 0;

      for (let child of Array.from(
        windowRef.current.parentElement?.children || []
      )) {
        if ((child as HTMLDivElement).style.zIndex) {
          const zIndex = parseInt((child as HTMLDivElement).style.zIndex);
          if (zIndex > maxZ) {
            maxZ = zIndex;
          }
        }
      }

      if (windowRef.current.style.zIndex === maxZ.toString()) return;

      windowRef.current.style.zIndex = `${maxZ + 1}`;
    }
  };

  useEffect(() => {
    if (width < 768 && draggableRef.current) {
      draggableRef.current.setState({
        x: 0,
        y: 0,
      });
    }
  }, [width, height]);

  useEffect(() => {
    if (windowRef.current) {
      const numOfChildren = windowRef.current.parentElement?.children.length;

      bringWindowToFront();
      if (draggableRef.current) {
        draggableRef.current.setState({
          x: width < 768 ? 0 : numOfChildren * 10,
          y: width < 768 ? 0 : numOfChildren * 10,
        });
      }
    }
  }, []);

  const onStart = () => bringWindowToFront();
  const isMobile = width < 768;

  if (authGuard && !user) {
    return (
      <ErrorWindow
        title="Error Starting Program"
        message="You're not signed in. Please sign in to continue..."
        actions={
          <>
            <Button onClick={() => closeWindow(props.windowsId)}>Close</Button>
            <DynamicConnectButton>
              <Button className="ml-auto">Sign In</Button>
            </DynamicConnectButton>
          </>
        }
        windowId={props.windowsId || ""}
      />
    );
  }

  return (
    <Draggable
      ref={draggableRef}
      handle="strong"
      bounds="parent"
      onStart={onStart}
      disabled={width < 768}
      position={
        props.openCentered && !isMobile
          ? { x: width / 2 - 200, y: height / 2 - 200 }
          : undefined
      }
    >
      <Window
        ref={windowRef}
        className={`${windowClassName} !flex !flex-col`}
        style={{
          position: "absolute",
          resize: resizable ? "both" : "none",
          overflow: "hidden",
          width: width < 768 ? "100%" : initialWidth,
          maxWidth: "100%",
          minWidth: width < 768 ? "100%" : "375px",
          minHeight: width < 768 ? "calc(100% - 48px)" : "",
          height: width < 768 ? "100%" : initialHeight,
          maxHeight: "calc(100% - 48px)",
          ...props.style,
        }}
        onClick={bringWindowToFront}
        id={props.windowsId}
      >
        <strong>
          <WindowHeader
            className="flex !items-center !justify-between !py-1 !px-2 !h-auto"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              userSelect: "none",
            }}
            onDoubleClick={handleMaximize}
          >
            <span className="!text-xl">{headerTitle}</span>
            {showHeaderActions && (
              <WindowButtons>
                {onHelp && (
                  <Button onClick={onHelp}>
                    <img src="/images/icons/question.png" width="60%" height="60%" />
                  </Button>
                )}
                {showMaximizeButton && (
                  <Button onClick={handleMaximize}>
                    <img src="/images/maximize.png" width="60%" height="60%" />
                  </Button>
                )}
                <Button onClick={onClose}>
                  <span className="close-icon" />
                </Button>
              </WindowButtons>
            )}
          </WindowHeader>
        </strong>

        <WindowContent className="!px-2 !pt-4 flex flex-col w-full flex-grow max-h-[calc(100%-44px)]">
          {children}
        </WindowContent>
      </Window>
    </Draggable>
  );
};

export default DraggableResizeableWindow;
