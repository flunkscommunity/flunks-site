import { useWindowsContext } from "contexts/WindowsContext";
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
    children,
  } = props;
  const windowRef = useRef<HTMLDivElement>(null);
  const draggableRef = useRef<Draggable>(null);

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
    if (windowRef.current) {
      const numOfChildren = windowRef.current.parentElement?.children.length;
      console.log(numOfChildren);
      bringWindowToFront();
      if (draggableRef.current) {
        draggableRef.current.setState({
          x: numOfChildren * 10,
          y: numOfChildren * 10,
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
    >
      <Window
        ref={windowRef}
        className="window"
        style={{
          position: "absolute",
          resize: "both",
          overflow: "hidden",
          width: initialWidth,
          maxWidth: "100%",
          height: initialHeight,
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
          </WindowHeader>
        </strong>

        <WindowContent
          style={{
            height: `calc(100% - 44px - ${offSetHeight}px)`,
            width: "100%",
            maxWidth: "100%",
            position: "relative",
          }}
        >
          {children}
        </WindowContent>
      </Window>
    </Draggable>
  );
};

export default DraggableResizeableWindow;
