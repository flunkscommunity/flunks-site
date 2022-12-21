import { useWindowsContext } from "contexts/WindowsContext";
import useWindowSize from "hooks/useWindowSize";
import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { Button, Window, WindowContent, WindowHeader } from "react95";
import styled from "styled-components";

interface Props {
  headerTitle: string;
  children: React.ReactNode;
  onClose?: () => void;
  offSetHeight?: number;
  initialHeight?: string;
  initialWidth?: string;
  showHeaderActions?: boolean;
}

const WindowButtons = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
`;

const CustomWindowBody = styled(WindowContent)`
  @media (max-width: 768px) {
    padding-left: 0;
    padding-right: 0;
    padding-bottom: 0;
    padding-top: 4px;
  }
`;

const DraggableResizeableWindow: React.FC<Props> = (props) => {
  const {
    headerTitle,
    offSetHeight = 0,
    onClose,
    initialHeight = "90%",
    initialWidth = "90%",
    showHeaderActions = true,
    children,
  } = props;
  const windowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable>(null);
  const { width, height } = useWindowSize();

  const handleMaximize = () => {
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
      // console.log(numOfChildren);
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

  return (
    <Draggable
      ref={draggableRef}
      handle="strong"
      bounds="parent"
      onStart={onStart}
      disabled={width < 768}
    >
      <Window
        ref={windowRef}
        className="window"
        style={{
          position: "absolute",
          resize: "both",
          overflow: "hidden",
          width: width < 768 ? "100%" : initialWidth,
          maxWidth: "100%",
          height: width < 768 ? "100%" : initialHeight,
          maxHeight: "calc(100% - 48px)",
        }}
        onClick={bringWindowToFront}
      >
        <strong className="cursor" onDoubleClick={handleMaximize}>
          <WindowHeader
            className="window-title"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              userSelect: "none",
              padding: "20px 8px",
            }}
          >
            <span>{headerTitle}</span>
            {showHeaderActions && (
              <WindowButtons>
                {/* <Button disabled>
                <img src="/images/minimize.png" width="60%" height="60%" />
              </Button> */}
                <Button onClick={handleMaximize}>
                  <img src="/images/maximize.png" width="60%" height="60%" />
                </Button>
                <Button onClick={onClose}>
                  <span className="close-icon" />
                </Button>
              </WindowButtons>
            )}
          </WindowHeader>
        </strong>

        <CustomWindowBody
          style={{
            height: `calc(100% - 44px - ${offSetHeight}px)`,
            width: "100%",
            maxWidth: "100%",
            position: "relative",
          }}
        >
          {children}
        </CustomWindowBody>
      </Window>
    </Draggable>
  );
};

export default DraggableResizeableWindow;
