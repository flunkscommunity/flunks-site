import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useState } from "react";
import { useTimeBasedImage, isDayTime } from "utils/timeBasedImages";

const HighSchoolMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const [manualMode, setManualMode] = useState(false);
  const [isNightMode, setIsNightMode] = useState(false);

  // Use time-based images with your uploaded day/night photos
  const dayImage = "/images/icons/school-day.png";
  const nightImage = "/images/icons/school-night.png";
  const fallbackImage = "/images/backdrops/BLANK.png";

  // Get time-based image info
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  // Get current background - use manual override if set, otherwise use time-based
  const getCurrentBackground = () => {
    if (manualMode) {
      return isNightMode ? nightImage : dayImage;
    }
    return timeBasedInfo.currentImage;
  };

  const toggleDayNight = () => {
    setManualMode(true);
    setIsNightMode(!isNightMode);
  };

  const resetToAutoMode = () => {
    setManualMode(false);
    setIsNightMode(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to blank image if day/night specific images don't exist
    e.currentTarget.src = fallbackImage;
  };

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <DraggableResizeableWindow
          windowsId={roomKey}
          headerTitle={title}
          onClose={() => closeWindow(roomKey)}
          initialWidth="30vw"
          initialHeight="30vh"
          resizable={true}
        >
          <div className="p-3 text-sm leading-relaxed bg-[#1a1a1a] text-white w-full h-full overflow-hidden">
            <h1 className="text-lg mb-2 font-semibold">{title}</h1>
            <p className="text-xs leading-relaxed">{content}</p>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="relative w-full h-full">
      <img
        src={getCurrentBackground()}
        alt={`High School Background - ${manualMode ? (isNightMode ? 'Night' : 'Day') : (timeBasedInfo.isDay ? 'Day' : 'Night')}`}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
        onError={handleImageError}
      />

      {/* Day/Night Atmospheric Overlay */}
      <div 
        className={`absolute inset-0 z-1 transition-all duration-500 ${
          (manualMode ? isNightMode : !timeBasedInfo.isDay)
            ? 'bg-blue-900 bg-opacity-30' 
            : 'bg-yellow-100 bg-opacity-10'
        }`}
        style={{
          background: (manualMode ? isNightMode : !timeBasedInfo.isDay)
            ? 'linear-gradient(180deg, rgba(25, 25, 112, 0.3) 0%, rgba(0, 0, 0, 0.4) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 224, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
        }}
      />

      {/* Time Info Display */}
      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
        {manualMode ? 'Manual Mode' : `Auto: ${timeBasedInfo.currentTime}`}
      </div>

      {/* Day/Night Toggle Button */}
      <button
        onClick={toggleDayNight}
        className="absolute top-4 right-16 bg-gray-900 text-white px-4 py-2 rounded z-20 hover:bg-gray-700 transition-all duration-200 hover:scale-105 border border-gray-600"
        title={`Switch to ${(manualMode ? isNightMode : !timeBasedInfo.isDay) ? 'Day' : 'Night'} mode`}
      >
        {(manualMode ? isNightMode : !timeBasedInfo.isDay) ? '☀️ Day' : '🌙 Night'}
      </button>

      {/* Reset to Auto Mode Button */}
      {manualMode && (
        <button
          onClick={resetToAutoMode}
          className="absolute top-16 right-16 bg-blue-900 text-white px-3 py-1 rounded text-sm z-20 hover:bg-blue-700 transition-all duration-200"
          title="Reset to automatic time-based switching"
        >
          🕒 Auto
        </button>
      )}

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10 flex-wrap justify-center max-w-4xl px-4">
        {/* Hallway */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.HIGH_SCHOOL_HALLWAY,
              "Hallway",
              "Lockers line the walls, covered in mysterious graffiti and faded club posters."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
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
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
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
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
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
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
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
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
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
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🏢 Office
        </button>
      </div>
    </div>
  );
};

export default HighSchoolMain;
