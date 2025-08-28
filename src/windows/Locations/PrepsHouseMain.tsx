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
    <div className="relative w-full h-full flex items-center justify-center bg-gray-900">
      {/* Container for the house image - shrunk to show full house */}
      <div className="relative w-4/5 h-4/5 max-w-4xl max-h-4xl">
        <img
          src={timeBasedInfo.currentImage}
          alt={`Prep's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
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
              : 'bg-pink-100 bg-opacity-5'
          }`}
        />
      </div>

      {/* Time Info Display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
        {timeBasedInfo.currentTime}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        {/* Back Porch */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.PREPS_HOUSE_SALON,
              "Back Porch",
              "A pristine covered porch with white wicker furniture and perfectly arranged potted plants. The view overlooks an immaculate garden."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🌸 Back Porch
        </button>

        {/* Bedroom */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.PREPS_HOUSE_WALK_IN_CLOSET,
              "Bedroom",
              "A canopy bed with silk sheets and decorative pillows. Vanity table with antique mirrors and jewelry boxes."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          �️ Bedroom
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
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          �️ Living Room
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
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          � Basement
        </button>
      </div>
    </div>
  );
};

export default PrepsHouseMain;
