import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useState } from "react";

const HighSchoolMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const [isNightMode, setIsNightMode] = useState(false);

  const toggleDayNight = () => {
    setIsNightMode(!isNightMode);
  };

  const getCurrentBackground = () => {
    const dayImage = "/images/backgrounds/locations/high-school/cover-day.png";
    const nightImage = "/images/backgrounds/locations/high-school/cover-night.png";
    const fallbackImage = "/images/backgrounds/locations/high-school/cover.png";
    
    return isNightMode ? nightImage : dayImage;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to original image if day/night specific images don't exist
    e.currentTarget.src = "/images/backgrounds/locations/high-school/cover.png";
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
        alt={`High School Background - ${isNightMode ? 'Night' : 'Day'}`}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
        onError={handleImageError}
      />

      {/* Day/Night Atmospheric Overlay */}
      <div 
        className={`absolute inset-0 z-1 transition-all duration-500 ${
          isNightMode 
            ? 'bg-blue-900 bg-opacity-30' 
            : 'bg-yellow-100 bg-opacity-10'
        }`}
        style={{
          background: isNightMode 
            ? 'linear-gradient(180deg, rgba(25, 25, 112, 0.3) 0%, rgba(0, 0, 0, 0.4) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 224, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
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

      {/* Hallway */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.HIGH_SCHOOL_HALLWAY,
            "Hallway",
            "Lockers line the walls, covered in mysterious graffiti and faded club posters."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🚪 Hallway
      </button>

      {/* Classroom */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.HIGH_SCHOOL_CLASSROOM,
            "Classroom",
            "Dusty desks with carved initials. The chalkboard still has equations from the last day of school."
          )
        }
        className="absolute top-4 center-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105 left-1/2 transform -translate-x-1/2"
      >
        📚 Classroom
      </button>

      {/* Cafeteria */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.HIGH_SCHOOL_CAFETERIA,
            "Cafeteria",
            "Empty lunch trays still sit on tables. A suspicious smell lingers in the air."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🍽️ Cafeteria
      </button>

      {/* Gymnasium */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.HIGH_SCHOOL_GYMNASIUM,
            "Gymnasium",
            "The basketball hoops are bent at strange angles. Echoes of old cheers seem to bounce off the walls."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🏀 Gymnasium
      </button>

      {/* Library */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.HIGH_SCHOOL_LIBRARY,
            "Library",
            "Books are scattered everywhere. One particular book seems to glow faintly on the librarian's desk."
          )
        }
        className="absolute bottom-4 center-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105 left-1/2 transform -translate-x-1/2"
      >
        📖 Library
      </button>

      {/* Principal's Office */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.HIGH_SCHOOL_OFFICE,
            "Principal's Office",
            "The desk drawers are slightly open. Student files are scattered about with red marks and strange symbols."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🏢 Office
      </button>
    </div>
  );
};

export default HighSchoolMain;
