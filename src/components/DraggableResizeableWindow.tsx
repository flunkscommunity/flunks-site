import { useWindowsContext } from "contexts/WindowsContext";
import useWindowSize from "hooks/useWindowSize";
import { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Button, Window, WindowContent, WindowHeader } from "react95";
import styled from "styled-components";
import ErrorWindow from "windows/ErrorWindow";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface Props {
  headerTitle: string;
  headerIcon?: string;
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
  toolbar?: React.ReactNode;
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
    headerIcon,
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
    toolbar,
  } = props;
  const windowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable>(null);
  const { width, height } = useWindowSize();
  const { closeWindow, bringWindowToFront } = useWindowsContext();
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

  const _bringWindowToFront = (e?: React.MouseEvent<HTMLDivElement>) => {
    if (e) {
      e.stopPropagation();
    }

    bringWindowToFront(props.windowsId);
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

      _bringWindowToFront();
      if (draggableRef.current) {
        draggableRef.current.setState({
          x: width < 768 ? 0 : numOfChildren * 10,
          y: width < 768 ? 0 : numOfChildren * 10,
        });
      }
    }
  }, []);

  const onStart = () => _bringWindowToFront();
  const isMobile = width < 768;

  const getHeight = useCallback(() => {
    if (width < 768) return "100%";
    if (initialHeight === "auto" && height < 900) {
      return "100%";
    }

    return initialHeight;
  }, [height]);

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
      defaultPosition={{
        x: width / 2 - windowRef.current?.clientWidth! / 2,
        y: height / 2 - windowRef.current?.clientHeight! / 2 - offSetHeight,
      }}
      cancel="#action"
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
          height: getHeight(),
          maxHeight: "calc(100% - 48px)",
          ...props.style,
        }}
        onClick={_bringWindowToFront}
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
            <div className="flex items-center gap-2">
              {headerIcon && <img src={headerIcon} className="h-5"></img>}
              <span className="!text-xl">{headerTitle}</span>
            </div>
            {showHeaderActions && (
              <WindowButtons>
                {onHelp && (
                  <Button id="action" onClick={onHelp}>
                    <img
                      src="/images/icons/question.png"
                      width="60%"
                      height="60%"
                    />
                  </Button>
                )}
                {showMaximizeButton && (
                  <Button id="action" onClick={handleMaximize}>
                    <img
                      src="/images/icons/maximize.png"
                      width="60%"
                      height="60%"
                    />
                  </Button>
                )}
                <Button
                  id="action"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  className="pointer-events-auto"
                >
                  <span className="close-icon" />
                </Button>
              </WindowButtons>
            )}
          </WindowHeader>
        </strong>

        {toolbar}

        <WindowContent
          className="!px-2 flex flex-col w-full flex-grow max-h-[calc(100%-44px)]"
          style={{
            paddingTop: !!toolbar ? "0" : "16px",
          }}
        >
          {children}
        </WindowContent>
      </Window>
    </Draggable>
  );
};

export default DraggableResizeableWindow;
