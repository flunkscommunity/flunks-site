import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const FlunkFmMain = () => {
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
        alt="Flunk FM Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Studio */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FLUNK_FM_STUDIO,
            "Recording Studio",
            "Soundproof walls and professional recording equipment. The ON AIR light glows red."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🎙️ Studio
      </button>

      {/* DJ Booth */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FLUNK_FM_BOOTH,
            "DJ Booth",
            "Turntables and mixing boards. Stacks of vinyl records and a wall of CDs."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🎧 DJ Booth
      </button>

      {/* Office */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FLUNK_FM_OFFICE,
            "Station Office",
            "Cluttered desk with programming schedules and sponsor contracts. Coffee-stained papers everywhere."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        📻 Office
      </button>
    </div>
  );
};

export default FlunkFmMain;
