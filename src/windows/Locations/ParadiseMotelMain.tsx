import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const ParadiseMotelMain = () => {
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
        alt="Paradise Motel Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Lobby */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PARADISE_MOTEL_LOBBY,
            "Lobby",
            "The neon 'VACANCY' sign flickers. An old guest book sits open with names that don't quite look... normal."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🏨 Lobby
      </button>

      {/* Room 1 */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PARADISE_MOTEL_ROOM_1,
            "Room 1",
            "The bed is unmade and there's a strange stain on the carpet. The TV shows only static, but sometimes you think you see shapes moving in it."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🛏️ Room 1
      </button>

      {/* Room 2 */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PARADISE_MOTEL_ROOM_2,
            "Room 2",
            "This room looks exactly like Room 1, but everything is slightly... wrong. The mirror reflects something different than what's in the room."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🛏️ Room 2
      </button>

      {/* Pool Area */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.PARADISE_MOTEL_POOL,
            "Pool Area",
            "The pool water is an unusual shade of green. Floating in it is a rubber duck that wasn't there a moment ago."
          )
        }
        className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🏊 Pool
      </button>
    </div>
  );
};

export default ParadiseMotelMain;
