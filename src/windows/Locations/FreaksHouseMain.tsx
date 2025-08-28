import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";

const FreaksHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use your uploaded day/night images for Freaks House
  const dayImage = "/images/icons/freaks-house-day.png";
  const nightImage = "/images/icons/freaks-house-night.png";
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
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      {/* Full screen container for the house image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Freak's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="w-full h-full object-cover z-0 transition-opacity duration-500"
          onError={(e) => {
            e.currentTarget.src = "/images/backdrops/BLANK.png";
          }}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 z-1 transition-all duration-500 ${
            !timeBasedInfo.isDay 
              ? 'bg-purple-900 bg-opacity-30' 
              : 'bg-red-100 bg-opacity-10'
          }`}
        />
      </div>

      {/* Time Info Display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
        {timeBasedInfo.currentTime}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        {/* Bedroom */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.FREAKS_HOUSE_BEDROOM,
              "Bedroom",
              "Black curtains block out the light. Band posters and dark artwork cover every inch of the walls."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🖤 Bedroom
        </button>

        {/* Basement */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.FREAKS_HOUSE_BASEMENT,
              "Basement",
              "A makeshift recording studio with amplifiers and instruments scattered around. 8-tracks line the floor and cassettes are stacked to the ceiling."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🎸 Basement
        </button>

        {/* Attic */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.FREAKS_HOUSE_ATTIC,
              "Attic",
              "Dusty old books about the occult and conspiracy theories line makeshift shelves."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          📚 Attic
        </button>

        {/* Kitchen */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.FREAKS_HOUSE_KITCHEN,
              "Kitchen",
              "Energy drinks and instant noodles stack the counter. A coffee pot that never gets cleaned."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          ☕ Kitchen
        </button>
      </div>
    </div>
  );
};

export default FreaksHouseMain;
