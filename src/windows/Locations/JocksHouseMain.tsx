import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const JocksHouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();

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
        src="/images/backdrops/BLANK.png"
        alt="Jock's House Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Living Room */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.JOCKS_HOUSE_LIVING_ROOM,
            "Living Room",
            "Sports trophies line the shelves. A worn football sits on the coffee table."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
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
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🛏️ Bedroom
      </button>

      {/* Garage/Workout Area */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.JOCKS_HOUSE_GARAGE,
            "Garage",
            "Weight sets and exercise equipment fill the space. Motivational posters on the walls."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
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
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🥤 Kitchen
      </button>
    </div>
  );
};

export default JocksHouseMain;
