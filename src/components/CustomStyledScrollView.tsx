import { ScrollViewProps, createScrollbars } from "react95";
import { insetShadow } from "react95/dist/common";
import styled from "styled-components";

const size = {
  mobile: "320px",
  tablet: "768px",
  laptop: "1024px",
  desktop: "2560px",
};

export const CustomStyledScrollView = styled.div<
  Pick<ScrollViewProps, "shadow">
>`
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
    width: calc(100% - 4px);
    height: calc(100% - 4px);

    border-style: solid;
    border-width: 2px;
    border-left-color: ${({ theme }) => theme.borderDarkest};
    border-top-color: ${({ theme }) => theme.borderDarkest};
    border-right-color: ${({ theme }) => theme.borderLight};
    border-bottom-color: ${({ theme }) => theme.borderLight};

    pointer-events: none;
    ${(props) => props.shadow && `box-shadow:${insetShadow};`}
  }
`;

export const CustomScrollArea = styled.div`
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 4px;
  /* Android WebView performance optimizations */
  will-change: transform;
  -webkit-overflow-scrolling: touch;
  transform: translateZ(0);
  backface-visibility: hidden;
  /* Improve scroll performance on Android */
  overflow-anchor: none;
  overflow: auto;
  ${createScrollbars()}
  ::-webkit-scrollbar {
    width: 16px;
    height: 16px;

    @media (min-width: ${size.tablet}) {
      width: 18px;
      height: 18px;
    }

    @media (min-width: ${size.laptop}) {
      width: 26px;
      height: 26px;
    }
  }
  ::-webkit-scrollbar-button {
    outline-offset: -2px;
    width: 16px;
    height: 16px;

    @media (min-width: ${size.tablet}) {
      width: 18px;
      height: 18px;
    }

    @media (min-width: ${size.laptop}) {
      width: 26px;
      height: 26px;
    }
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: 0 0;
  }
`;
