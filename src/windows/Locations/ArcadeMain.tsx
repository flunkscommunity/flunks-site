import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useState } from "react";

const ArcadeMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const [isNightMode, setIsNightMode] = useState(false);

  const toggleDayNight = () => {
    setIsNightMode(!isNightMode);
  };

  const getCurrentBackground = () => {
    const dayImage = "/images/backgrounds/locations/arcade/cover-day.png";
    const nightImage = "/images/backgrounds/locations/arcade/cover-night.png";
    const fallbackImage = "/images/backdrops/BLANK.png";
    
    return isNightMode ? nightImage : dayImage;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to blank image if day/night specific images don't exist
    e.currentTarget.src = "/images/backdrops/BLANK.png";
  };

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
        src={getCurrentBackground()}
        alt={`Arcade Background - ${isNightMode ? 'Night' : 'Day'}`}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
        onError={handleImageError}
      />

      {/* Day/Night Atmospheric Overlay */}
      <div 
        className={`absolute inset-0 z-1 transition-all duration-500 ${
          isNightMode 
            ? 'bg-purple-900 bg-opacity-20' 
            : 'bg-yellow-100 bg-opacity-5'
        }`}
        style={{
          background: isNightMode 
            ? 'linear-gradient(180deg, rgba(75, 0, 130, 0.2) 0%, rgba(0, 0, 0, 0.3) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 224, 0.05) 0%, rgba(255, 215, 0, 0.03) 100%)'
        }}
      />

      {/* Day/Night Toggle Button */}
      <button
        onClick={toggleDayNight}
        className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded z-20 hover:bg-gray-700 transition-all duration-200 hover:scale-105 border border-gray-600"
        title={`Switch to ${isNightMode ? 'Day' : 'Night'} mode`}
      >
        {isNightMode ? '☀️ Day' : '🌙 Night'}
      </button>

      {/* Top Left */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.ARCADE_TOP_LEFT,
            "Front Area",
            "Old cabinets blink with forgotten high scores."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🎮 Front Area
      </button>

      {/* Top Right */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.ARCADE_TOP_RIGHT,
            "Prize Booth",
            "Dusty plush toys watch from behind the glass."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🎁 Prize Booth
      </button>

      {/* Bottom Left */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.ARCADE_BOTTOM_LEFT,
            "Snack Corner",
            "The popcorn machine hums softly in the dark."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🍿 Snack Corner
      </button>

      {/* Bottom Right */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.ARCADE_BOTTOM_RIGHT,
            "Back Room",
            "A locked door hides the real secrets of the arcade."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🚪 Back Room
      </button>
    </div>
  );
};

export default ArcadeMain;
