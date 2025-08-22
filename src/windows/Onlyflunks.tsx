import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Frame, Button } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import AppLoader from "components/AppLoader";
import { AndroidOptimizations } from "components/AndroidOptimizations";
import { useDynamicContext, DynamicWidget } from "@dynamic-labs/sdk-react-core";

const Onlyflunks: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const { user, primaryWallet } = useDynamicContext();

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
          {!user || !primaryWallet ? (
            // Show wallet connection UI when user is not authenticated
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <h3>🔒 Connect Wallet to Access OnlyFlunks</h3>
              <p className="text-center">
                OnlyFlunks requires wallet authentication to access premium content and features.
              </p>
              <div className="flex flex-col items-center gap-4">
                <DynamicWidget />
                <p className="text-xs opacity-70 text-center">
                  Supported: Flow Wallet, Lilico, Dapper, Blocto
                </p>
              </div>
            </div>
          ) : (
            // Show OnlyFlunks content when authenticated
            <>
              <div className="flex items-center justify-between w-full">
                <h3>🧠 Welcome to OnlyFlunks</h3>
                <div className="text-sm text-green-600">
                  ✅ {primaryWallet.address?.slice(0, 8)}...
                </div>
              </div>
              <p>Premium content for connected wallet holders.</p>
              
              {/* 4 Image Grid - smaller images, 4 columns */}
              <div className="grid grid-cols-4 gap-2 w-full mt-4">
                {sampleImages.map((image, index) => (
                  <Frame 
                    key={index} 
                    variant="well" 
                    className="!p-1 cursor-pointer md:hover:bg-gray-100 transition-colors active:bg-gray-200"
                  >
                    <img
                      src={image}
                      alt={`OnlyFlunks ${index + 1}`}
                      className="w-full h-16 object-cover bg-gray-200 select-none pointer-events-none"
                      style={{
                        imageRendering: "auto",
                      }}
                    />
                  </Frame>
                ))}
              </div>
              
              <p className="mt-2">Coming soon: quests, upgrades, and secret missions.</p>
            </>
          )}
        </Frame>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default Onlyflunks;
