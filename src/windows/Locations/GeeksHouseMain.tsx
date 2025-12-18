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
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* Image Section */}
      <div className="relative flex-1 flex items-center justify-center min-h-0">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Geek's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-cover transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
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
      <div className="w-full bg-gradient-to-r from-cyan-800 via-green-900 to-cyan-800 p-2 border-t-2 border-cyan-500 shadow-xl flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
          {/* Lab */}
          <button
            onClick={() =>
              openRoom(
                WINDOW_IDS.GEEKS_HOUSE_LAB,
                "Science Lab",
                "Beakers bubble with mysterious experiments. Chemistry sets and microscopes cover the workbench."
              )
            }
            className="bg-gradient-to-br from-cyan-600 to-green-800 hover:from-cyan-500 hover:to-green-700 text-white px-4 py-2 rounded-lg border-2 border-cyan-400 hover:border-cyan-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
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
            className="bg-gradient-to-br from-cyan-600 to-green-800 hover:from-cyan-500 hover:to-green-700 text-white px-4 py-2 rounded-lg border-2 border-cyan-400 hover:border-cyan-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            💻 Computer
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
            className="bg-gradient-to-br from-cyan-600 to-green-800 hover:from-cyan-500 hover:to-green-700 text-white px-4 py-2 rounded-lg border-2 border-cyan-400 hover:border-cyan-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
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
            className="bg-gradient-to-br from-cyan-600 to-green-800 hover:from-cyan-500 hover:to-green-700 text-white px-4 py-2 rounded-lg border-2 border-cyan-400 hover:border-cyan-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
          >
            🔧 Workshop
          </button>

          {/* SHED Button */}
          <button
            onClick={openShedWithLock}
            className="col-span-2 md:col-span-4 bg-gradient-to-br from-red-900 to-black hover:from-red-800 hover:to-gray-900 text-red-200 hover:text-red-100 px-4 py-2 rounded-lg border-2 border-red-600 hover:border-red-500 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl"
          >
            🏚️ SHED
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeeksHouseMain;
