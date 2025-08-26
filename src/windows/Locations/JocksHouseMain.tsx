import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useTimeBasedImage } from "utils/timeBasedImages";

const JocksHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  
  // Use your uploaded day/night images for Jocks House
  const dayImage = "/images/icons/jocks-house-day.png";
  const nightImage = "/images/icons/jocks-house-night.png";
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
        alt={`Jock's House Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
        onError={(e) => {
          e.currentTarget.src = "/images/backdrops/BLANK.png";
        }}
      />

      {/* Day/Night Atmospheric Overlay */}
      <div 
        className={`absolute inset-0 z-1 transition-all duration-500 ${
          !timeBasedInfo.isDay 
            ? 'bg-blue-900 bg-opacity-20' 
            : 'bg-yellow-100 bg-opacity-5'
        }`}
      />

      {/* Time Info Display */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
        {timeBasedInfo.currentTime}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-10">
        {/* Garage */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.JOCKS_HOUSE_GARAGE,
              "Garage",
              "Weight sets and exercise equipment fill the space. Motivational posters on the walls."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          💪 Garage
        </button>

        {/* Kitchen */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.JOCKS_HOUSE_KITCHEN,
              "Kitchen",
              "Protein shakes and energy bars stack the counter. A meal prep schedule is taped to the fridge."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🥤 Kitchen
        </button>

        {/* Living Room */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.JOCKS_HOUSE_LIVING_ROOM,
              "Living Room",
              "Sports trophies line the shelves. A worn football sits on the coffee table."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🏆 Living Room
        </button>

        {/* Bedroom */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.JOCKS_HOUSE_BEDROOM,
              "Bedroom",
              "Letterman jackets hang in the closet. Team photos cover the walls."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🛏️ Bedroom
        </button>
      </div>
    </div>
  );
};

export default JocksHouseMain;
