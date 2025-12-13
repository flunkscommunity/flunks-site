import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import CellarDoorDigitalLock from "components/CellarDoorDigitalLock";
import { getCliqueColors, getCliqueIcon } from "utils/cliqueColors";
import { getFontStyle } from "utils/fontConfig";
import HiddenRiffWindow from "windows/Games/HiddenRiffWindow";
import FreaksTVWindow from "windows/Games/FreaksTVWindow";
import { isFeatureEnabled } from "utils/buildMode";
import FreaksHouseLivingRoom from "./FreaksHouseLivingRoom";
import FreaksHouseAttic from "./FreaksHouseAttic";
import FreaksHouseKitchen from "./FreaksHouseKitchen";

const FreaksHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use day/night images for Freaks House
  const dayImage = "/images/locations/snow locations/freaks-house-snow-day.png";
  const nightImage = "/images/locations/snow locations/freaks-house-snow-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  const getCurrentBackground = () => {
    return timeBasedInfo.currentImage;
  };

  const openRoom = (roomKey: string, title: string, content: string) => {
    const cliqueColors = getCliqueColors('FREAK');
    const fontStyle = getFontStyle('FREAK');
    
    openWindow({
      key: roomKey,
      window: (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(450px, 90vw)',
            maxHeight: '70vh',
            backgroundColor: cliqueColors.primary,
            border: '3px solid #FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Title */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '12px 16px',
            borderBottom: '2px solid rgba(255,255,255,0.3)',
            ...fontStyle,
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center'
          }}>
            {getCliqueIcon('FREAK')} {title}
          </div>
          
          {/* Content */}
          <div style={{
            padding: '20px',
            flex: 1,
            backgroundColor: cliqueColors.primary,
            ...fontStyle,
            fontSize: '18px',
            lineHeight: '1.6',
            color: '#FFFFFF',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflow: 'auto'
          }}>
            {content}
          </div>
          
          {/* Close Button */}
          <div style={{
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'flex-end',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <button
              onClick={() => closeWindow(roomKey)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '4px',
                color: '#FFFFFF',
                padding: '6px 12px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                ...fontStyle,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Close
            </button>
          </div>
        </div>
      ),
    });
  };

  const openBedroom = () => {
    openWindow({
      key: WINDOW_IDS.FREAKS_HOUSE_BEDROOM,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FREAKS_HOUSE_BEDROOM}
          headerTitle="Freak's Bedroom"
          onClose={() => closeWindow(WINDOW_IDS.FREAKS_HOUSE_BEDROOM)}
          initialWidth="min(75vw, 900px)"
          initialHeight="90vh"
          resizable={true}
        >
          <div className="w-full h-full bg-[#1a1a1a] text-white overflow-auto flex flex-col">
            {/* Image Section - Takes up most of the space */}
            <div className="relative flex-1 min-h-[400px] bg-black">
              <img
                src="/images/locations/freaks-bedroom.png"
                alt="Freak's Bedroom Interior"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/images/backdrops/BLANK.png";
                }}
              />
            </div>
            
            {/* Description and Buttons Section - Below the image */}
            <div className="bg-black bg-opacity-90 p-4 sm:p-6 border-t border-gray-600">
              <h1 className="text-xl sm:text-2xl mb-2 sm:mb-3 font-bold text-center" style={{ fontFamily: "'ms_sans_serif', 'Courier New', monospace" }}>🖤 Freak's Bedroom</h1>
              <p className="text-xs sm:text-sm leading-relaxed mb-2 sm:mb-3 text-center" style={{ fontFamily: "'ms_sans_serif', 'Courier New', monospace" }}>
                Black curtains block out the light. Band posters and dark artwork cover every inch of the walls.
                The air smells faintly of incense and rebellion.
              </p>
              <p className="text-xs text-gray-300 mb-4 text-center" style={{ fontFamily: "'ms_sans_serif', 'Courier New', monospace" }}>
                Explore different areas of the bedroom to discover hidden secrets and artistic chaos.
              </p>
              
              {/* Interactive Buttons */}
              <div className="max-w-lg mx-auto">
                {/* Three buttons in a row with responsive grid */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4">
                  {/* Hidden Riff - BUILD MODE ONLY */}
                  {isFeatureEnabled('showHiddenRiff') && (
                    <button
                      onClick={() => {
                        openWindow({
                          key: WINDOW_IDS.HIDDEN_RIFF,
                          window: <HiddenRiffWindow />,
                        });
                      }}
                      className="bg-amber-700 hover:bg-amber-800 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px]"
                    >
                      🎸 Guitar
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      openWindow({
                        key: WINDOW_IDS.FREAKS_TV,
                        window: <FreaksTVWindow />,
                      });
                    }}
                    className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px]"
                  >
                    📺 TV
                  </button>
                  
                  <button
                    onClick={() => {
                      alert('🖊️ Desk interaction coming soon!');
                    }}
                    className="bg-gray-700 hover:bg-gray-800 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg font-bold transition-all duration-200 hover:scale-105 shadow-lg text-sm sm:text-base min-h-[44px]"
                  >
                    🖊️ Desk
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  const openCellarDoorLock = () => {
    openWindow({
      key: WINDOW_IDS.FREAKS_HOUSE_CELLAR_DOOR_LOCK,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.FREAKS_HOUSE_CELLAR_DOOR_LOCK}
          headerTitle="Cellar Door - Digital Lock"
          onClose={() => closeWindow(WINDOW_IDS.FREAKS_HOUSE_CELLAR_DOOR_LOCK)}
          initialWidth="min(400px, 90vw)"
          initialHeight="min(500px, 80vh)"
          resizable={false}
        >
          <CellarDoorDigitalLock
            onUnlock={() => {
              closeWindow(WINDOW_IDS.FREAKS_HOUSE_CELLAR_DOOR_LOCK);
              openRoom(
                WINDOW_IDS.FREAKS_HOUSE_CELLAR_DOOR,
                "Cellar Door",
                "The ancient lock clicks open with a deep, resonating thud. Beyond the door, stone steps descend into absolute darkness. Cold air flows upward, carrying whispers of forgotten secrets and the faint scent of something long buried..."
              );
            }}
            onCancel={() => closeWindow(WINDOW_IDS.FREAKS_HOUSE_CELLAR_DOOR_LOCK)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Image Container - Full screen, no constraints */}
      <div className="relative w-full" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
        <img
          src={getCurrentBackground()}
          alt={`Freak's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />
      </div>

      {/* Bottom Buttons - BELOW the image */}
      <div className="w-full bg-gradient-to-r from-purple-900 via-gray-900 to-black p-3 border-t-4 border-purple-600 shadow-2xl">
        {/* Four room buttons in one horizontal line */}
        <div className="grid grid-cols-4 gap-3 w-full mx-auto mb-3">
          {/* Bedroom */}
          <button
            onClick={openBedroom}
            className="bg-gradient-to-br from-gray-800 to-gray-950 hover:from-gray-700 hover:to-gray-900 text-white px-3 py-3 sm:py-2 rounded-lg border-3 border-gray-600 hover:border-gray-500 transition-all duration-300 hover:scale-105 text-center text-sm sm:text-sm font-bold shadow-lg hover:shadow-xl min-h-[48px] active:scale-95"
            style={{ 
              fontFamily: 'Cooper Black, Georgia, serif',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            🖤 Bedroom
          </button>

          {/* Living Room */}
          <button
            onClick={() =>
              openWindow({
                key: WINDOW_IDS.FREAKS_HOUSE_BASEMENT,
                window: <FreaksHouseLivingRoom />,
              })
            }
            className="bg-gradient-to-br from-red-900 to-red-950 hover:from-red-800 hover:to-red-900 text-white px-3 py-3 sm:py-2 rounded-lg border-3 border-red-700 hover:border-red-600 transition-all duration-300 hover:scale-105 text-center text-sm sm:text-sm font-bold shadow-lg hover:shadow-xl min-h-[48px] active:scale-95"
            style={{ 
              fontFamily: 'Cooper Black, Georgia, serif',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            🎸 Living Room
          </button>

          {/* Attic */}
          <button
            onClick={() =>
              openWindow({
                key: WINDOW_IDS.FREAKS_HOUSE_ATTIC,
                window: <FreaksHouseAttic />,
              })
            }
            className="bg-gradient-to-br from-indigo-900 to-indigo-950 hover:from-indigo-800 hover:to-indigo-900 text-white px-3 py-3 sm:py-2 rounded-lg border-3 border-indigo-700 hover:border-indigo-600 transition-all duration-300 hover:scale-105 text-center text-sm sm:text-sm font-bold shadow-lg hover:shadow-xl min-h-[48px] active:scale-95"
            style={{ 
              fontFamily: 'Cooper Black, Georgia, serif',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            📚 Attic
          </button>

          {/* Kitchen */}
          <button
            onClick={() =>
              openWindow({
                key: WINDOW_IDS.FREAKS_HOUSE_KITCHEN,
                window: <FreaksHouseKitchen />,
              })
            }
            className="bg-gradient-to-br from-green-900 to-green-950 hover:from-green-800 hover:to-green-900 text-white px-3 py-3 sm:py-2 rounded-lg border-3 border-green-700 hover:border-green-600 transition-all duration-300 hover:scale-105 text-center text-sm sm:text-sm font-bold shadow-lg hover:shadow-xl min-h-[48px] active:scale-95"
            style={{ 
              fontFamily: 'Cooper Black, Georgia, serif',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ☕ Kitchen
          </button>
        </div>

        {/* Cellar Door Button - Bigger and centered below the row */}
        <div className="flex justify-center">
          <button
            onClick={openCellarDoorLock}
            className="bg-gradient-to-br from-purple-900 to-black hover:from-purple-800 hover:to-gray-900 text-purple-200 hover:text-purple-100 px-10 py-3 rounded-xl border-4 border-purple-700 hover:border-purple-500 transition-all duration-300 hover:scale-105 min-w-[280px] text-center shadow-xl hover:shadow-2xl"
            style={{
              fontFamily: 'serif',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              letterSpacing: '3px'
            }}
          >
            🚪 CELLAR DOOR
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreaksHouseMain;
