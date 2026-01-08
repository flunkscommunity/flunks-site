import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";
import { getCliqueColors, getCliqueIcon } from "utils/cliqueColors";
import { getFontStyle } from "utils/fontConfig";

const PrepsHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use your uploaded day/night images for Preps House
  const dayImage = "/images/locations/snow locations/preps-house-snow-day.png";
  const nightImage = "/images/locations/snow locations/preps-house-snow-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  const openRoom = (roomKey: string, title: string, content: string) => {
    const cliqueColors = getCliqueColors('PREP');
    const fontStyle = getFontStyle('PREP');
    
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
            {getCliqueIcon('PREP')} {title}
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

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black">
      {/* Image Section */}
      <div className="relative flex-1 flex items-center justify-center min-h-0">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Prep's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="max-w-full max-h-full object-contain transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
            !timeBasedInfo.isDay 
              ? 'bg-purple-900 bg-opacity-20' 
              : 'bg-pink-100 bg-opacity-5'
          }`}
        />

        {/* Time Info Display */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
          {timeBasedInfo.currentTime}
        </div>
      </div>

      {/* Room Buttons Section */}
      <div className="w-full bg-gradient-to-r from-pink-800 via-purple-900 to-pink-800 p-2 border-t-2 border-pink-400 shadow-xl flex-shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
        {/* Kitchen */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.PREPS_HOUSE_SALON,
              "Kitchen",
              "A gourmet kitchen with marble countertops and stainless steel appliances. Fresh herbs grow in designer planters by the window. Only the finest ingredients."
            )
          }
          className="bg-gradient-to-br from-pink-600 to-purple-800 hover:from-pink-500 hover:to-purple-700 text-white px-4 py-2 rounded-lg border-2 border-pink-400 hover:border-pink-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          🍳 Kitchen
        </button>

        {/* Bedroom */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.PREPS_HOUSE_WALK_IN_CLOSET,
              "Bedroom",
              "A Four post bed with silk sheets and decorative pillows. Vanity table with antique mirrors and jewelry boxes."
            )
          }
          className="bg-gradient-to-br from-pink-600 to-purple-800 hover:from-pink-500 hover:to-purple-700 text-white px-4 py-2 rounded-lg border-2 border-pink-400 hover:border-pink-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          🛏️ Bedroom
        </button>

        {/* Living Room */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.PREPS_HOUSE_STUDY,
              "Living Room",
              "Elegant furniture arranged around a marble fireplace. Fresh flowers in crystal vases and art books on polished coffee tables."
            )
          }
          className="bg-gradient-to-br from-pink-600 to-purple-800 hover:from-pink-500 hover:to-purple-700 text-white px-4 py-2 rounded-lg border-2 border-pink-400 hover:border-pink-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          🏛️ Living
        </button>

        {/* Basement */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.PREPS_HOUSE_POOL_AREA,
              "Basement",
              "A finished basement with a home theater system and plush seating. Wine cellar and exercise equipment in separate sections."
            )
          }
          className="bg-gradient-to-br from-pink-600 to-purple-800 hover:from-pink-500 hover:to-purple-700 text-white px-4 py-2 rounded-lg border-2 border-pink-400 hover:border-pink-300 transition-all duration-300 hover:scale-105 text-center text-sm font-bold shadow-lg hover:shadow-xl whitespace-nowrap"
        >
          🎬 Basement
        </button>
        </div>
      </div>
    </div>
  );
};

export default PrepsHouseMain;
