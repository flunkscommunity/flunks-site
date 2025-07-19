import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const SecretTreehouseMain = () => {
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
        alt="Secret Treehouse Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Loft */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.SECRET_TREEHOUSE_LOFT,
            "Loft",
            "A creaky ladder leads to a dusty loft with old comic books and forgotten treasures."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🪜 Loft
      </button>

      {/* Work Desk */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.SECRET_TREEHOUSE_DESK,
            "Work Desk",
            "The desk has a map with tacks, red yarn connecting clues, and a walkie talkie crackling with static."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        📻 Work Desk
      </button>

      {/* Old Trunk */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.SECRET_TREEHOUSE_TRUNK,
            "Old Trunk",
            "Inside is a flashlight, half a diary with mysterious entries, and something locked away..."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🧳 Trunk
      </button>

      {/* Secret Window */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.SECRET_TREEHOUSE_WINDOW,
            "Secret Window",
            "You can peek out over the lake from here. Something glimmers in the water below."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🪟 Window
      </button>
    </div>
  );
};

export default SecretTreehouseMain;
