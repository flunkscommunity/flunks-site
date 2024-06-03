import React from "react";
import { useRef, useEffect } from "react";
import runCrowdAnimation from "scripts/crowd-simulator";

interface CrowdSimulatorProps {
  spriteSheetUrl: string;
  rows: number;
  cols: number;
}

const CrowdSimulator: React.FC<CrowdSimulatorProps> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!canvasRef?.current) return;
    runCrowdAnimation(
      canvasRef.current,
      props.spriteSheetUrl,
      props.rows,
      props.cols,
    );
  }, [canvasRef.current]);

  return (
    <canvas
      ref={canvasRef}
      className="h-[300px] w-full"
    />
  );
};

export default CrowdSimulator;
