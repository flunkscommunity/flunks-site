import { useWindowsContext } from "contexts/WindowsContext";
import useWindowSize from "hooks/useWindowSize";
import { useCallback, useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Button, Window, WindowContent, WindowHeader } from "react95";
import { WINDOW_IDS } from "fixed";
import styled from "styled-components";
import ErrorWindow from "windows/ErrorWindow";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

interface Props {
  headerTitle?: string;
  headerIcon?: string;
  headerRender?: React.ReactNode;
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
  
  button[id="action"] {
    margin: 0 !important;
    vertical-align: top !important;
  }
`;

// Gray extension that fills the safe area above the window on mobile
const SafeAreaExtension = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    /* Fallback for Dynamic Island / notch - approximately 59px on modern iPhones */
    height: 59px;
    height: constant(safe-area-inset-top); /* iOS 11.0-11.2 */
    height: env(safe-area-inset-top, 59px); /* iOS 11.2+ */
    /* Use the same gray color as the Windows95 title bar/chrome */
    background: ${({ theme }) => theme.material || '#c0c0c0'};
    z-index: 10000;
  }
`;

// Styled Window with proper positioning below the notch on mobile
const StyledWindow = styled(Window)`
  /* Mobile-specific styles */
  @media (max-width: 768px) {
    position: fixed !important;
    /* Fallback for Dynamic Island / notch */
    top: 59px !important;
    top: constant(safe-area-inset-top) !important; /* iOS 11.0-11.2 */
    top: env(safe-area-inset-top, 59px) !important; /* iOS 11.2+ */
    left: 0 !important;
    right: 0 !important;
    bottom: 48px !important;
    width: 100% !important;
    height: auto !important;
    max-height: none !important;
    min-height: 0 !important;
    border-radius: 0 !important;
    margin: 0 !important;
  }
`;

// Mobile-specific header with centered title and only close button
const MobileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 8px 12px;
  background: linear-gradient(180deg, #000080 0%, #1084d0 100%);
  min-height: 36px;
  
  .mobile-title {
    color: white;
    font-weight: bold;
    font-size: 16px;
    text-align: center;
    flex: 1;
    padding: 0 40px; /* Leave space for close button */
  }
  
  .mobile-close-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
  }
`;

const DraggableResizeableWindow: React.FC<Props> = (props) => {
  const {
    headerTitle,
    headerIcon,
    headerRender,
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
  const { closeWindow, bringWindowToFront, minimizeWindow, windowApps } = useWindowsContext();
  const { user } = useDynamicContext();

  // Check if this window is minimized
  const isMinimized = windowApps.find(app => app.key === props.windowsId)?.isMinimized || false;

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

  // Check if user is authenticated 
  const isAuthenticated = !!user;

  if (authGuard && !isAuthenticated) {
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

  // Handle minimized windows - special case for radio player to keep audio playing
  if (isMinimized) {
    if (props.windowsId === WINDOW_IDS.RADIO_PLAYER) {
      // Render radio player hidden but still mounted to keep audio playing
      return (
        <div style={{ display: 'none' }}>
          {children}
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {/* Gray extension fills the safe area (notch/Dynamic Island) on mobile */}
      {isMobile && <SafeAreaExtension />}
      <Draggable
        ref={draggableRef}
        handle="strong"
        bounds={{
          left: 0,
          top: 0,      // Allow windows to go to the very top (header will still be visible)
          right: width - 100,  // Leave some space on the right
          bottom: height - 48  // Leave some space at bottom
        }}
        onStart={onStart}
        disabled={width < 768}
        position={
          props.openCentered && !isMobile
            ? { x: width / 2 - 200, y: Math.max(height / 2 - 200, 10) }  // Ensure centered windows have some top margin
            : undefined
        }
        defaultPosition={{
          x: width / 2 - windowRef.current?.clientWidth! / 2,
          y: Math.max(height / 2 - windowRef.current?.clientHeight! / 2 - offSetHeight, 10), // Small top margin instead of 60px
        }}
        cancel="#action"
      >
      <StyledWindow
        ref={windowRef}
        className={`${windowClassName} !flex !flex-col cursor-win95-default`}
        data-window-id={props.windowsId}
        style={{
          position: isMobile ? undefined : "absolute",
          resize: resizable && !isMobile ? "both" : "none",
          overflow: "hidden",
          width: isMobile ? undefined : initialWidth,
          maxWidth: isMobile ? undefined : "100%",
          minWidth: isMobile ? undefined : "375px",
          minHeight: isMobile ? undefined : "",
          height: isMobile ? undefined : getHeight(),
          maxHeight: isMobile ? undefined : "calc(100% - 48px)",
          left: isMobile ? undefined : undefined,
          top: isMobile ? undefined : undefined,
          bottom: isMobile ? undefined : undefined,
          background: props.windowsId === 'HIGH_SCHOOL_OFFICE_SUCCESS' ? '#2a2a2a' : undefined,
          ...props.style,
        }}
        onClick={_bringWindowToFront}
        id={props.windowsId}
      >
        <strong>
          {headerRender ? (
            headerRender
          ) : isMobile ? (
            /* Mobile: Centered title with only close button */
            <MobileHeader>
              <span className="mobile-title">{headerTitle}</span>
              {showHeaderActions && (
                <div className="mobile-close-btn">
                  <Button
                    id="action"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose?.();
                    }}
                    className="pointer-events-auto cursor-win95-pointer"
                  >
                    <span className="close-icon" />
                  </Button>
                </div>
              )}
            </MobileHeader>
          ) : (
            /* Desktop: Full header with all buttons */
            <WindowHeader
              className="flex !items-center !justify-between !py-1 !px-2 !h-auto cursor-win95-move"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                userSelect: "none",
              }}
              onDoubleClick={handleMaximize}
            >
              <div className="flex items-center gap-2">
                {headerIcon && <img src={headerIcon} className="h-5" />}
                <span 
                  className="!text-xl select-none"
                  style={{
                    display: 'block',
                    padding: '2px 4px',
                    borderRadius: '2px',
                    userSelect: 'none'
                  }}
                >
                  {headerTitle}
                </span>
              </div>
              {showHeaderActions && (
                <WindowButtons>
                  {onHelp && (
                    <Button id="action" onClick={onHelp} className="cursor-win95-help">
                      <img
                        src="/images/icons/question.png"
                        width="60%"
                        height="60%"
                        style={{ display: 'block', margin: 'auto' }}
                      />
                    </Button>
                  )}
                  {showMaximizeButton && (
                    <Button id="action" onClick={handleMaximize} className="cursor-win95-pointer">
                      <img
                        src="/images/icons/maximize.png"
                        width="60%"
                        height="60%"
                        style={{ display: 'block', margin: 'auto' }}
                      />
                    </Button>
                  )}
                  <Button id="action" onClick={() => minimizeWindow(props.windowsId)} className="cursor-win95-pointer">
                    <img
                      src="/images/icons/minimize.png"
                      width="60%"
                      height="60%"
                      style={{ display: 'block', margin: 'auto' }}
                    />
                  </Button>
                  <Button
                    id="action"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("✖ Close button clicked for:", props.windowsId);
                      onClose?.();
                    }}
                    className="pointer-events-auto cursor-win95-pointer"
                  >
                    <span className="close-icon" />
                  </Button>
                </WindowButtons>
              )}
            </WindowHeader>
          )}
        </strong>

        {toolbar}

        <WindowContent
          className="flex flex-col flex-grow w-full h-full !px-2 max-h-none"
          style={{
            paddingTop: !!toolbar ? "0" : "16px",
            flexGrow: 1,
            height: "100%",
            minHeight: 0,
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            background: props.windowsId === 'HIGH_SCHOOL_OFFICE_SUCCESS' ? '#2a2a2a' : undefined,
            padding: props.windowsId === 'HIGH_SCHOOL_OFFICE_SUCCESS' ? '0' : undefined,
          }}
        >
          {children}
        </WindowContent>
      </StyledWindow>
    </Draggable>
    </>
  );
};

export default DraggableResizeableWindow;
