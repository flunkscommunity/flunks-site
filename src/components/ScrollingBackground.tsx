import React from 'react';
import styled, { keyframes } from 'styled-components';

// Different scrolling animation patterns
const scrollDiagonal = keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50%, -50%);
  }
`;

const scrollHorizontal = keyframes`
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
`;

const scrollVertical = keyframes`
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
`;

const scrollMatrix = keyframes`
  0% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-25%, -12.5%);
  }
  50% {
    transform: translate(-50%, -25%);
  }
  75% {
    transform: translate(-25%, -37.5%);
  }
  100% {
    transform: translate(0, -50%);
  }
`;

const crawlSlow = keyframes`
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-100%, -100%);
  }
`;

export type ScrollingPattern = 'diagonal' | 'horizontal' | 'vertical' | 'matrix' | 'crawl' | 'none';

interface ScrollingBackgroundProps {
  backgroundImage: string;
  pattern?: ScrollingPattern;
  speed?: number; // Animation duration in seconds
  opacity?: number;
  tileSize?: number; // Percentage of container size for each tile
}

const BackgroundContainer = styled.div<{
  backgroundImage: string;
  pattern: ScrollingPattern;
  speed: number;
  opacity: number;
  tileSize: number;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  background-image: url(${props => props.backgroundImage});
  background-size: ${props => props.tileSize}% ${props => props.tileSize}%;
  background-repeat: repeat;
  opacity: ${props => props.opacity};
  z-index: -1;
  animation: ${props => {
    const animationMap = {
      diagonal: scrollDiagonal,
      horizontal: scrollHorizontal,
      vertical: scrollVertical,
      matrix: scrollMatrix,
      crawl: crawlSlow,
      none: 'none'
    };
    return props.pattern !== 'none' ? animationMap[props.pattern] : 'none';
  }} ${props => props.speed}s linear infinite;
  
  /* Smooth performance optimizations */
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
`;

const ScrollingBackground: React.FC<ScrollingBackgroundProps> = ({
  backgroundImage,
  pattern = 'diagonal',
  speed = 20,
  opacity = 1,
  tileSize = 50
}) => {
  return (
    <BackgroundContainer
      backgroundImage={backgroundImage}
      pattern={pattern}
      speed={speed}
      opacity={opacity}
      tileSize={tileSize}
    />
  );
};

export default ScrollingBackground;
