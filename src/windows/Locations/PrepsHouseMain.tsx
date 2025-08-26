import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";

const PrepsHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use your uploaded day/night images for Preps House
  const dayImage = "/images/icons/preps-house-day.png";
  const nightImage = "/images/icons/preps-house-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <DraggableResizeableWindow
          windowsId={roomKey}
          headerTitle={title}
          onClose={() => closeWindow(roomKey)}
          initialWidth="400px"
          initialHeight="300px"
          resizable={false}
        >
          <div className="p-4 text-sm leading-relaxed bg-[#1a1a1a] text-white w-full h-full">
            <h1 className="text-xl mb-2">{title}</h1>
            <p>{content}</p>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={timeBasedInfo.currentImage}
        alt={`Prep's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
        onError={(e) => {
          e.currentTarget.src = "/images/backdrops/BLANK.png";
        }}
      />

      {/* Day/Night Atmospheric Overlay */}
      <div 
        className={`absolute inset-0 z-1 transition-all duration-500 ${
          !timeBasedInfo.isDay 
            ? 'bg-purple-900 bg-opacity-20' 
            : 'bg-pink-100 bg-opacity-5'
        }`}
      />

      {/* Time Info Display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
        {timeBasedInfo.currentTime}
      </div>

      {/* Salon */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PREPS_HOUSE_SALON,
            "Beauty Salon",
            "Professional hair styling tools and premium makeup palettes line the vanity mirrors."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        💄 Salon
      </button>

      {/* Walk-in Closet */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PREPS_HOUSE_WALK_IN_CLOSET,
            "Walk-in Closet",
            "Designer clothes organized by color and season. Shoes displayed like a boutique."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        👗 Closet
      </button>

      {/* Study */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PREPS_HOUSE_STUDY,
            "Study Room",
            "Perfectly organized textbooks and color-coded notes. Awards and certificates on the walls."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        📝 Study
      </button>

      {/* Pool Area */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PREPS_HOUSE_POOL_AREA,
            "Pool Area",
            "Crystal clear water reflects the manicured garden. Poolside furniture arranged perfectly."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🏊 Pool
      </button>
    </div>
  );
};

export default PrepsHouseMain;
