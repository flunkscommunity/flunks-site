import { useState, useEffect } from "react";
import { Frame, ProgressBar } from "react95";
import styled, { keyframes } from "styled-components";

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoaderWrapper = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #008080;
`;

const RotatingIcon = styled.img`
  width: 80px;
  height: 80px;
  animation: ${rotate} 2s linear infinite;
`;

const SemesterZeroLoader: React.FC = () => {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((p) => {
        if (p >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(p + 5, 100);
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <LoaderWrapper>
      <Frame className="p-8 flex flex-col items-center gap-4">
        <RotatingIcon src="/images/icons/semester0-icon.png" alt="Semester Zero" />
        <span className="text-xl">Loading Semester Zero...</span>
        <ProgressBar variant="tile" value={percent} />
      </Frame>
    </LoaderWrapper>
  );
};

export default SemesterZeroLoader;
