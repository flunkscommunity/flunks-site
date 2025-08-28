import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";

const ArcadeMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use your uploaded day/night images for Arcade
  const dayImage = "/images/icons/arcade-day.png";
  const nightImage = "/images/icons/arcade-night.png";
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <DraggableResizeableWindow
          windowsId={roomKey}
          headerTitle={title}
          onClose={() => closeWindow(roomKey)}
          initialWidth="min(400px, 90vw)"
          initialHeight="min(300px, 60vh)"
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
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      {/* Container for the arcade image - shrunk to show full arcade */}
      <div className="relative w-4/5 h-4/5 max-w-4xl max-h-4xl">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Arcade Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-contain z-0 transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 z-1 transition-all duration-500 ${
            !timeBasedInfo.isDay 
              ? 'bg-purple-900 bg-opacity-20' 
              : 'bg-yellow-100 bg-opacity-5'
          }`}
        />
      </div>

      {/* Time Info Display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
        {timeBasedInfo.currentTime}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10 flex-wrap justify-center max-w-4xl px-4">
        {/* Front Area */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.ARCADE_TOP_LEFT,
              "Front Area",
              "Old cabinets blink with forgotten high scores."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🎮 Front Area
        </button>

        {/* Prize Booth */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.ARCADE_TOP_RIGHT,
              "Prize Booth",
              "Dusty plush toys watch from behind the glass."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🎁 Prize Booth
        </button>

        {/* Snack Corner */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.ARCADE_BOTTOM_LEFT,
              "Snack Corner",
              "The popcorn machine hums softly in the dark."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🍿 Snack Corner
        </button>

        {/* Back Room */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.ARCADE_BOTTOM_RIGHT,
              "Back Room",
              "A locked door hides the real secrets of the arcade."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🚪 Back Room
        </button>
      </div>
    </div>
  );
};

export default ArcadeMain;
