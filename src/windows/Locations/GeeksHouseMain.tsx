import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";

const GeeksHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use your uploaded day/night images for Geeks House
  const dayImage = "/images/icons/geeks-house-day.png";
  const nightImage = "/images/icons/geeks-house-night.png";
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
      {/* Container for the house image - shrunk to show full house */}
      <div className="relative w-4/5 h-4/5 max-w-4xl max-h-4xl">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Geek's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-contain z-0 transition-opacity duration-500"
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
      </div>

      {/* Time Info Display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
        {timeBasedInfo.currentTime}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10 flex-wrap justify-center max-w-4xl px-4">
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

        {/* Library */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.GEEKS_HOUSE_LIBRARY,
              "Library",
              "Floor-to-ceiling bookshelves filled with technical manuals and science fiction novels."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          📖 Library
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
    </div>
  );
};

export default GeeksHouseMain;
