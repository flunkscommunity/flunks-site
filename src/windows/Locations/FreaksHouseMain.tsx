import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const FreaksHouseMain = () => {
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
        alt="Freak's House Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Bedroom */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FREAKS_HOUSE_BEDROOM,
            "Bedroom",
            "Black curtains block out the light. Band posters and dark artwork cover every inch of the walls."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🖤 Bedroom
      </button>

      {/* Basement */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FREAKS_HOUSE_BASEMENT,
            "Basement",
            "A makeshift recording studio with amplifiers and instruments scattered around."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
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
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
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
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        ☕ Kitchen
      </button>
    </div>
  );
};

export default FreaksHouseMain;
