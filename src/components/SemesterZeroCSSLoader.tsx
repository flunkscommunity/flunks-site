import React from 'react';
import styled, { keyframes } from 'styled-components';

const moveBg = keyframes`
  0%,30% { background-position: 0 0px; }
  50%,100% { background-position: 0 -0.1px; }
`;

const bounce = keyframes`
  50%,100% { top: 109.5%; }
`;

const textAnim = keyframes`
  0%,30% { transform: translateY(0); }
  80%,100% { transform: translateY(-260%); }
`;

const Loader = styled.div`
  width: fit-content;
  font-size: 17px;
  font-family: monospace;
  line-height: 1.4;
  font-weight: bold;
  padding: 30px 2px 50px;
  background: linear-gradient(#000 0 0) 0 0/100% 100% content-box padding-box no-repeat;
  position: relative;
  overflow: hidden;
  animation: ${moveBg} 2s infinite cubic-bezier(1,175,.5,175);
  color: white;
`;

const LoadingText = styled.span`
  display: inline-block;
  animation: ${textAnim} 2s infinite;
`;

const Icon = styled.img`
  position: absolute;
  width: 34px;
  height: 28px;
  top: 110%;
  left: 50%;
  transform: translateX(-50%);
  animation: ${bounce} 2s infinite cubic-bezier(1,175,.5,175);
`;

const SemesterZeroCSSLoader: React.FC = () => (
  <Loader>
    <LoadingText>Loading</LoadingText>
    <Icon src="/images/icons/semester0-icon.png" alt="Semester Zero" />
  </Loader>
);

export default SemesterZeroCSSLoader;
