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

      {/* Lab */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.GEEKS_HOUSE_LAB,
            "Science Lab",
            "Beakers bubble with mysterious experiments. Chemistry sets and microscopes cover the workbench."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
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
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
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
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        📖 Library
      </button>

      {/* Workshop */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.GEEKS_HOUSE_WORKSHOP,
            "Workshop",
            "Electronic components and half-built gadgets litter the workbench. Soldering irons and circuit boards everywhere."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🔧 Workshop
      </button>
    </div>
  );
};

export default GeeksHouseMain;
