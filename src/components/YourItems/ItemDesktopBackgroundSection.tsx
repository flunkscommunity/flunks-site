import { useEffect, useState } from "react";
import { Button, Frame, Monitor } from "react95";
import useThemeSettings from "store/useThemeSettings";
import styled from "styled-components";

// Retro neon styled components
const RetroSectionTitle = styled.span`
  font-family: 'Courier New', monospace;
  color: #ff00ff;
  text-shadow: 
    0 0 5px #ff00ff,
    0 0 10px #ff00ff,
    0 0 15px #ff00ff;
  font-weight: bold;
  animation: neonPulse 2s ease-in-out infinite alternate;
  
  @keyframes neonPulse {
    0% { 
      text-shadow: 
        0 0 5px #ff00ff,
        0 0 10px #ff00ff,
        0 0 15px #ff00ff;
    }
    100% { 
      text-shadow: 
        0 0 8px #ff00ff,
        0 0 15px #ff00ff,
        0 0 25px #ff00ff;
    }
  }
`;

const RetroText = styled.span`
  font-family: 'Courier New', monospace;
  color: #00ffff;
  text-shadow: 
    0 0 5px #00ffff,
    0 0 10px #00ffff,
    0 0 15px #00ffff;
  font-weight: bold;
`;

const RetroFrame = styled(Frame)`
  background: linear-gradient(135deg, #000020 0%, #000040 50%, #000060 100%) !important;
  border: 2px solid #00ffff !important;
  box-shadow: 
    inset 0 0 0 1px #0088aa,
    0 0 8px #00ffff22,
    0 0 15px #00ffff11 !important;
`;

const RetroButton = styled(Button)`
  background: #800080 !important;
  border: 2px solid #ff00ff !important;
  color: #ffffff !important;
  font-family: 'Courier New', monospace !important;
  font-weight: bold !important;
  text-shadow: 0 0 3px #ff00ff !important;
  
  &:hover {
    background: #400040 !important;
    box-shadow: 0 0 8px #ff00ff !important;
  }
`;

const DesktopBackgroundSection = ({ src, itemSrc, pixelSrc }) => {
  const { setBackgroundImage, backgroundImage } = useThemeSettings();
  const [activeBg, setActiveBg] = useState<{ src: string; label: string }>({
    src: itemSrc,
    label: "Portrait",
  });

  useEffect(() => {
    if (!pixelSrc) {
      if (backgroundImage === itemSrc) {
        setActiveBg({ src: itemSrc, label: "Portrait" });
      } else if (backgroundImage === src) {
        setActiveBg({ src, label: "Backdrop" });
      }
    } else {
      if (backgroundImage === itemSrc) {
        setActiveBg({ src: itemSrc, label: "Portrait" });
      } else if (backgroundImage === pixelSrc) {
        setActiveBg({ src: pixelSrc, label: "Original" });
      } else if (backgroundImage === src) {
        setActiveBg({ src, label: "Backdrop" });
      }
    }
  }, [backgroundImage, itemSrc, pixelSrc, src]);

  const handleNext = () => {
    if (!pixelSrc) {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else {
        setActiveBg({ src: itemSrc, label: "Portrait" });
      }
    } else {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src: pixelSrc, label: "Original" });
      } else if (activeBg.src === pixelSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else {
        setActiveBg({ src: itemSrc, label: "Portrait" });
      }
    }
  };

  const handlePrev = () => {
    if (!pixelSrc) {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else {
        setActiveBg({ src: itemSrc, label: "Portrait" });
      }
    } else {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else if (activeBg.src === pixelSrc) {
        setActiveBg({ src: itemSrc, label: "Portrait" });
      } else {
        setActiveBg({ src: pixelSrc, label: "Original" });
      }
    }
  };

  return (
    <div className="mt-6 flex flex-col px-3 max-w-[1440px] mx-auto">
      <RetroSectionTitle className="text-lg font-bold">DESKTOP BACKGROUND</RetroSectionTitle>
      <div className="flex flex-col w-full gap-5">
        <RetroText className="text-base lg:text-lg">
          Use your Flunks or your Flunks' backdrop as your desktop background
        </RetroText>
        <RetroFrame variant="well" className="mx-auto !flex flex-col w-full px-2 py-10">
          <div className="mx-auto">
            <Monitor
              backgroundStyles={{
                backgroundImage: `url("${activeBg.src}")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                justifyContent: "start",
                alignItems: "end",
              }}
            />
          </div>
          <div className="flex w-full max-w-[240px] mx-auto items-start justify-between my-2 gap-2 mt-3">
            <Button onClick={handlePrev} square variant="thin" className="flex-shrink-0">
              <img src="/images/icons/arrow-left.png" className="h-6 w-auto" />
            </Button>
            <RetroFrame variant="well" className="!flex justify-center items-center gap-1 w-full py-1.5">
              {activeBg.src === backgroundImage && (
                <div className="h-2.5 w-2.5 bg-green-500 rounded-full" />
              )}
              <RetroText className="text-lg leading-[1]">{activeBg.label}</RetroText>
            </RetroFrame>
            <Button onClick={handleNext} square variant="thin" className="flex-shrink-0">
              <img src="/images/icons/arrow-right.png" className="h-6 w-auto" />
            </Button>
          </div>
          <RetroButton
            onClick={() => {
              setBackgroundImage(activeBg.src);
            }}
            className="mx-auto"
          >
            <RetroText>Set as Desktop Background</RetroText>
          </RetroButton>
        </RetroFrame>
      </div>
    </div>
  );
};

export default DesktopBackgroundSection;
