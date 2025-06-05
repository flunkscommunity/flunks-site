import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const MotelMain = () => {
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
        alt="Motel Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top Left */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.MOTEL_TOP_LEFT,
            "Office",
            "A flickering neon sign buzzes outside the window."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🛎️ Office
      </button>

      {/* Top Right */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.MOTEL_TOP_RIGHT,
            "Laundry",
            "There are piles of towels and the smell of detergent."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🧺 Laundry
      </button>

      {/* Bottom Left */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.MOTEL_BOTTOM_LEFT,
            "Vacant Room",
            "The key still dangles from the doorknob."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🔑 Vacant Room
      </button>

      {/* Bottom Right */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.MOTEL_BOTTOM_RIGHT,
            "Parking Lot",
            "An old car radio plays softly somewhere nearby."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🚗 Parking Lot
      </button>
    </div>
  );
};

export default MotelMain;
