import { useEffect, useState } from "react";
import { Button, Monitor } from "react95";
import useThemeSettings from "store/useThemeSettings";

const DesktopBackgroundSection = ({ src, itemSrc, pixelSrc }) => {
  const { setBackgroundImage, backgroundImage } = useThemeSettings();
  const [activeBg, setActiveBg] = useState<{ src: string; label: string }>({
    src: itemSrc,
    label: "2D Flunk",
  });

  useEffect(() => {
    if (!pixelSrc) {
      if (backgroundImage === itemSrc) {
        setActiveBg({ src: itemSrc, label: "Pixel Flunk" });
      } else if (backgroundImage === src) {
        setActiveBg({ src, label: "Backdrop" });
      }
    } else {
      if (backgroundImage === itemSrc) {
        setActiveBg({ src: itemSrc, label: "2D Flunk" });
      } else if (backgroundImage === pixelSrc) {
        setActiveBg({ src: pixelSrc, label: "Pixel Flunk" });
      } else if (backgroundImage === src) {
        setActiveBg({ src, label: "Backdrop" });
      }
    }
  }, [backgroundImage]);

  const handleNext = () => {
    if (!pixelSrc) {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else {
        setActiveBg({ src: itemSrc, label: "Pixel Flunk" });
      }
    } else {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src: pixelSrc, label: "Pixel Flunk" });
      } else if (activeBg.src === pixelSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else {
        setActiveBg({ src: itemSrc, label: "2D Flunk" });
      }
    }
  };

  const handlePrev = () => {
    if (!pixelSrc) {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else {
        setActiveBg({ src: itemSrc, label: "Pixel Flunk" });
      }
    } else {
      if (activeBg.src === itemSrc) {
        setActiveBg({ src: pixelSrc, label: "Pixel Flunk" });
      } else if (activeBg.src === pixelSrc) {
        setActiveBg({ src, label: "Backdrop" });
      } else {
        setActiveBg({ src: itemSrc, label: "2D Flunk" });
      }
    }
  };

  return (
    <div className="mt-6 flex flex-col px-3">
      <span className="text-lg font-bold">DESKTOP BACKGROUND</span>
      <div className="flex flex-col w-full gap-5">
        <span className="text-base lg:text-lg">
          Use your Flunk or your Flunks's backdrop as your desktop background
        </span>
        <div className="mx-auto flex flex-col">
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
          <div className="!w-full !flex items-center justify-between my-2">
            <Button onClick={handlePrev} variant="menu" square>
              <img src="/images/icons/arrow-left.png" className="h-6 w-auto" />
            </Button>
            <div className="flex items-center gap-1">
              {activeBg.src === backgroundImage && (
                <div className="h-2.5 w-2.5 bg-green-500 rounded-full" />
              )}
              <span className="text-lg leading-[1]">{activeBg.label}</span>
            </div>
            <Button onClick={handleNext} variant="menu" square>
              <img src="/images/icons/arrow-right.png" className="h-6 w-auto" />
            </Button>
          </div>
          <Button
            onClick={() => {
              setBackgroundImage(activeBg.src);
            }}
          >
            Set as Desktop Background
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DesktopBackgroundSection;
