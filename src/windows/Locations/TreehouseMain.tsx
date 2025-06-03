import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const TreehouseMain = () => {
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
        src="/images/locations/treehouse/daybg.png"
        alt="Treehouse Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Top Left - Loft */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.TREEHOUSE_LOFT,
            "Loft",
            "A creaky ladder leads to a dusty loft with old comic books."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🪜 Loft
      </button>

      {/* Top Right - Work Desk */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.TREEHOUSE_DESK,
            "Work Desk",
            "The desk has a map with tacks, red yarn, and a walkie talkie."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        📻 Work Desk
      </button>

      {/* Bottom Left - Trunk */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.TREEHOUSE_TRUNK,
            "Old Trunk",
            "Inside is a flashlight, half a diary, and something locked..."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🧳 Trunk
      </button>

      {/* Bottom Right - Window View */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.TREEHOUSE_WINDOW,
            "Secret Window",
            "You can peek out over the lake from here. Something glimmers."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🪟 Window View
      </button>
    </div>
  );
};

export default TreehouseMain;
