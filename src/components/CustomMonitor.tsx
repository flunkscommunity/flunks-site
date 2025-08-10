import { useWindowsContext } from "contexts/WindowsContext";
import React, { forwardRef, useEffect, useRef } from "react";
import { AppBar, Button, ScrollViewProps, TextInput, Toolbar } from "react95";
import styled from "styled-components";
import Appbar from "./Appbar/Appbar";
import useThemeSettings from "store/useThemeSettings";
import ScrollingBackground, { ScrollingPattern } from "./ScrollingBackground";

export const StyledScrollView = styled.div<Pick<ScrollViewProps, "shadow">>`
  position: relative;
  box-sizing: border-box;
  padding: 2px;
  font-size: 1rem;
  border-style: solid;
  border-width: 2px;
  border-left-color: ${({ theme }) => theme.borderDark};
  border-top-color: ${({ theme }) => theme.borderDark};
  border-right-color: ${({ theme }) => theme.borderLightest};
  border-bottom-color: ${({ theme }) => theme.borderLightest};
  line-height: 1.5;
  &:before {
    position: absolute;
    left: 0;
    top: 0;
    content: "";
    width: calc(100%);
    height: calc(100%);
    border-style: solid;
    border-width: 2px;
    border-left-color: ${({ theme }) => theme.borderDarkest};
    border-top-color: ${({ theme }) => theme.borderDarkest};
    border-right-color: ${({ theme }) => theme.borderLight};
    border-bottom-color: ${({ theme }) => theme.borderLight};
    pointer-events: none;
  }
`;

type MonitorProps = {
  backgroundStyles?: React.CSSProperties;
  children?: React.ReactNode;
  showBottomBar?: boolean;
  customBackgroundImage?: string;
  enableScrollingBackground?: boolean;
  scrollingPattern?: ScrollingPattern;
  scrollingSpeed?: number;
  scrollingOpacity?: number;
  scrollingTileSize?: number;
};

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const Inner = styled.div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
`;

const MonitorBody = styled.div`
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 0%;
  background: ${({ theme }) => theme.material};
  border-top: 4px solid ${({ theme }) => theme.borderLightest};
  border-left: 4px solid ${({ theme }) => theme.borderLightest};
  border-bottom: 4px solid ${({ theme }) => theme.borderDark};
  border-right: 4px solid ${({ theme }) => theme.borderDark};
  outline: 1px dotted ${({ theme }) => theme.material};
  outline-offset: -3px;
  &:before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    outline: 1px dotted ${({ theme }) => theme.material};
  }
  box-shadow: 1px 1px 0 1px ${({ theme }) => theme.borderDarkest};
  @media (min-width: 768px) {
    &:after {
      content: "";
      display: inline-block;
      position: absolute;
      bottom: 4px;
      right: 12px;
      width: 16px;
      border-top: 2px solid #4d9046;
      border-bottom: 6px solid #07ff00;
    }
  }
`;

const Background = styled(StyledScrollView).attrs(() => ({
  "data-testid": "background",
}))`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    /* Ensure proper containment on mobile */
    max-width: 100vw;
    max-height: 100vh;
  }
`;

export const FlunkImage = styled.img`
  border-style: inset;
  border-bottom: 4px solid ${({ theme }) => theme.borderLight};
  border-right: 4px solid ${({ theme }) => theme.borderLight};
  border-top: 4px solid ${({ theme }) => theme.borderDark};
  border-left: 4px solid ${({ theme }) => theme.borderDark};
`;

const MonitorScreenContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: calc(100% - 48px);
  width: 100%;
  overflow: hidden;
`;

const CustomMonitor = forwardRef<HTMLDivElement, MonitorProps>(
  ({ 
    backgroundStyles, 
    children, 
    showBottomBar, 
    customBackgroundImage, 
    enableScrollingBackground = false,
    scrollingPattern = 'diagonal',
    scrollingSpeed = 20,
    scrollingOpacity = 1,
    scrollingTileSize = 50,
    ...otherProps 
  }, ref) => {
    const { backgroundColor, backgroundImage, oldMonitorMode, desktopBackground, desktopBackgroundType } =
      useThemeSettings();
    const backgroundRef = useRef<HTMLDivElement>(null);

    // Use desktop background for main desktop, fallback to regular background for other screens
    const isMainDesktop = showBottomBar; // Main desktop has the bottom bar/taskbar
    const finalBackgroundImage = customBackgroundImage || backgroundImage;
    const shouldUseScrollingBackground = enableScrollingBackground && finalBackgroundImage;

    // Apply desktop pattern styles using useEffect
    useEffect(() => {
      if (isMainDesktop && desktopBackgroundType === 'pattern' && backgroundRef.current) {
        const bgElement = backgroundRef.current;
        // Clear existing styles
        bgElement.style.backgroundImage = '';
        bgElement.style.backgroundColor = '';
        // Apply pattern styles by parsing the CSS string
        const tempDiv = document.createElement('div');
        tempDiv.style.cssText = desktopBackground;
        bgElement.style.background = tempDiv.style.background;
        bgElement.style.backgroundColor = tempDiv.style.backgroundColor;
      }
    }, [isMainDesktop, desktopBackgroundType, desktopBackground]);

    return (
      <Wrapper ref={ref} {...otherProps}>
        <Inner>
          <MonitorBody>
            <div
              className={`crt h-full w-full ${
                oldMonitorMode ? "old-monitor" : ""
              }`}
            >
              <Background
                ref={backgroundRef}
                style={{
                  ...backgroundStyles,
                  ...(isMainDesktop && desktopBackgroundType === 'pattern' ? {
                    // Desktop pattern will be applied via useEffect
                  } : isMainDesktop && desktopBackgroundType === 'image' ? {
                    // Use desktop image background
                    backgroundColor: shouldUseScrollingBackground ? 'transparent' : 'transparent',
                    backgroundImage: shouldUseScrollingBackground ? 'none' : `url(${desktopBackground})`,
                    backgroundSize: shouldUseScrollingBackground ? 'auto' : "cover",
                    backgroundPosition: shouldUseScrollingBackground ? 'auto' : "center",
                    backgroundRepeat: shouldUseScrollingBackground ? 'auto' : "no-repeat",
                  } : {
                    // Use regular image background
                    backgroundColor: shouldUseScrollingBackground ? 'transparent' : backgroundColor,
                    backgroundImage: shouldUseScrollingBackground ? 'none' : `url(${finalBackgroundImage})`,
                    backgroundSize: shouldUseScrollingBackground ? 'auto' : "cover",
                    backgroundPosition: shouldUseScrollingBackground ? 'auto' : "center",
                    backgroundRepeat: shouldUseScrollingBackground ? 'auto' : "no-repeat",
                  })
                }}
              >
                {shouldUseScrollingBackground && (
                  <ScrollingBackground 
                    backgroundImage={isMainDesktop && desktopBackgroundType === 'image' ? desktopBackground : finalBackgroundImage}
                    pattern={scrollingPattern}
                    speed={scrollingSpeed}
                    opacity={scrollingOpacity}
                    tileSize={scrollingTileSize}
                  />
                )}
                <MonitorScreenContainer>{children}</MonitorScreenContainer>

                {showBottomBar && <Appbar />}
              </Background>
            </div>
          </MonitorBody>
        </Inner>
      </Wrapper>
    );
  }
);

export default CustomMonitor;
