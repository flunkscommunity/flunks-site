import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import ShedDigitalLock from "components/ShedDigitalLock";
import { getCliqueColors, getCliqueIcon } from "utils/cliqueColors";
import { getFontStyle } from "utils/fontConfig";

const GeeksHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use your uploaded day/night images for Geeks House
  const dayImage = "/images/locations/snow locations/geeks-house-snow-day.png";
  const nightImage = "/images/locations/snow locations/geeks-house-snow-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  const openRoom = (roomKey: string, title: string, content: string) => {
    const cliqueColors = getCliqueColors('GEEK');
    const fontStyle = getFontStyle('GEEK');
    
    openWindow({
      key: roomKey,
      window: (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(450px, 95vw)',
            maxWidth: '450px',
            maxHeight: 'min(70vh, 500px)',
            minHeight: '300px',
            backgroundColor: cliqueColors.primary,
            border: '3px solid #FFFFFF',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Title */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: 'clamp(8px, 3vw, 12px) clamp(12px, 4vw, 16px)',
            borderBottom: '2px solid rgba(255,255,255,0.3)',
            ...fontStyle,
            fontSize: 'clamp(14px, 4vw, 16px)',
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            minHeight: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {getCliqueIcon('GEEK')} {title}
          </div>
          
          {/* Content */}
          <div style={{
            padding: 'clamp(12px, 5vw, 20px)',
            flex: 1,
            backgroundColor: cliqueColors.primary,
            ...fontStyle,
            fontSize: 'clamp(14px, 4vw, 18px)',
            lineHeight: '1.6',
            color: '#FFFFFF',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            overflow: 'auto',
            minHeight: '0'
          }}>
            {content}
          </div>
          
          {/* Close Button */}
          <div style={{
            padding: 'clamp(8px, 3vw, 12px) clamp(12px, 5vw, 20px)',
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
                padding: 'clamp(4px, 2vw, 6px) clamp(8px, 3vw, 12px)',
                fontSize: 'clamp(12px, 3.5vw, 14px)',
                fontWeight: 'bold',
                cursor: 'pointer',
                ...fontStyle,
                transition: 'all 0.2s ease',
                minWidth: '60px',
                whiteSpace: 'nowrap'
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

  const openShedWithLock = () => {
    openWindow({
      key: WINDOW_IDS.GEEKS_HOUSE_SHED_LOCK,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.GEEKS_HOUSE_SHED_LOCK}
          headerTitle="🔒 Shed Security Access"
          onClose={() => closeWindow(WINDOW_IDS.GEEKS_HOUSE_SHED_LOCK)}
          initialWidth="450px"
          initialHeight="700px"
          resizable={true}
        >
          <ShedDigitalLock 
            onCancel={() => closeWindow(WINDOW_IDS.GEEKS_HOUSE_SHED_LOCK)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Image Section */}
      <div className="relative flex-1">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Geek's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 z-1 transition-all duration-500 ${
            !timeBasedInfo.isDay 
              ? 'bg-green-900 bg-opacity-20' 
              : 'bg-cyan-100 bg-opacity-5'
          }`}
        />

        {/* Time Info Display */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
          {timeBasedInfo.currentTime}
        </div>
      </div>

      {/* Room Buttons Section */}
      <div className="bg-gray-800 p-4 border-t border-gray-600">
        <div className="flex gap-4 flex-wrap justify-center max-w-4xl mx-auto">
          {/* Lab */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.GEEKS_HOUSE_LAB,
                "Science Lab",
                "Beakers bubble with mysterious experiments. Chemistry sets and microscopes cover the workbench."
              )
            }
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
          >
            🧪 Lab
          </button>

          {/* Computer Room */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.GEEKS_HOUSE_COMPUTER_ROOM,
                "Computer Room",
                "Multiple monitors glow in the darkness. Lines of code scroll endlessly across the screens."
              )
            }
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
          >
            💻 Computer Room
          </button>

          {/* Kitchen */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.GEEKS_HOUSE_LIBRARY,
                "Kitchen",
                "Energy drinks and instant ramen dominate the counter space. Multiple coffee makers and a microwave that's seen too much use. Circuit boards double as trivets."
              )
            }
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
          >
            🍜 Kitchen
          </button>

          {/* Workshop */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.GEEKS_HOUSE_WORKSHOP,
                "Workshop",
                "Electronic components and half-built gadgets litter the workbench. Soldering irons and circuit boards everywhere. Zero parts go unused here."
              )
            }
            className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
          >
            🔧 Workshop
          </button>
        </div>

        {/* SHED Button - Longer and Ominous */}
        <div className="flex justify-center mt-4">
          <button
            onClick={openShedWithLock}
            className="bg-gradient-to-b from-red-900 to-black text-red-200 px-8 py-3 rounded-lg hover:from-red-800 hover:to-gray-900 hover:text-red-100 transition-all duration-300 hover:scale-105 min-w-[200px] text-center shadow-lg border-2 border-red-800 hover:border-red-600"
            style={{
              fontFamily: 'serif',
              fontSize: '18px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              letterSpacing: '2px'
            }}
          >
            🏚️ SHED
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeeksHouseMain;
