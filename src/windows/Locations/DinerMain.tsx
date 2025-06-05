import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const DinerMain = () => {
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
        alt="Diner Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top Left */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.DINER_TOP_LEFT,
            "Counter",
            "The smell of coffee lingers near the stools."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        ☕ Counter
      </button>

      {/* Top Right */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.DINER_TOP_RIGHT,
            "Kitchen",
            "Pots clatter and something sizzles on the grill."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🍳 Kitchen
      </button>

      {/* Bottom Left */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.DINER_BOTTOM_LEFT,
            "Booth",
            "A cracked vinyl seat creaks as you sit."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🍔 Booth
      </button>

      {/* Bottom Right */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.DINER_BOTTOM_RIGHT,
            "Parking",
            "Rain collects in puddles by the neon sign."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🅿️ Parking
      </button>
    </div>
  );
};

export default DinerMain;
