import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import AppLoader from "components/AppLoader";
import { AndroidOptimizations } from "components/AndroidOptimizations";

const Onlyflunks: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  // Sample images for demonstration - replace with actual OnlyFlunks images
  const sampleImages = [
    "/images/about-us/fp-1.avif",
    "/images/about-us/fp-2.avif", 
    "/images/about-us/fp-3.avif",
    "/images/about-us/fp-4.avif"
  ];

  return (
    <AppLoader bgImage="/images/loading/bootup.webp">
      <AndroidOptimizations />
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="OnlyFlunks"
        windowsId={WINDOW_IDS.FLUNKS_HUB}
        onClose={() => closeWindow(WINDOW_IDS.FLUNKS_HUB)}
        initialWidth="600px"
        initialHeight="500px"
        headerIcon="/images/icons/onlyflunks.png"
      >
        <Frame variant="inside" className="p-4 h-full w-full flex flex-col items-start gap-4">
          <h3>🧠 Welcome to OnlyFlunks</h3>
          <p>This will be the control center for Flunks interactions.</p>
          
          {/* 4 Image Grid - smaller images, 4 columns */}
          <div className="grid grid-cols-4 gap-2 w-full mt-4">
            {sampleImages.map((image, index) => (
              <Frame 
                key={index} 
                variant="well" 
                className="!p-1 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <img
                  src={image}
                  alt={`OnlyFlunks ${index + 1}`}
                  className="w-full h-16 object-cover bg-gray-200 select-none"
                  style={{
                    imageRendering: "auto",
                  }}
                />
              </Frame>
            ))}
          </div>
          
          <p className="mt-2">Coming soon: quests, upgrades, and secret missions.</p>
        </Frame>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default Onlyflunks;
