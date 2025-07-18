import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const PoliceStationMain = () => {
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
        alt="Police Station Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Front Desk */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.POLICE_STATION_FRONT_DESK,
            "Front Desk",
            "A tired officer sits behind bulletproof glass. Incident reports and wanted posters cover the bulletin board."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        👮 Front Desk
      </button>

      {/* Holding Cells */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.POLICE_STATION_CELLS,
            "Holding Cells",
            "Cold metal bars and concrete walls. Someone's carved initials into the bench."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🔒 Cells
      </button>

      {/* Evidence Room */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.POLICE_STATION_EVIDENCE_ROOM,
            "Evidence Room",
            "Shelves of bagged evidence and case files. A mysterious box marked 'CONFIDENTIAL' sits on the top shelf."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        📦 Evidence Room
      </button>
    </div>
  );
};

export default PoliceStationMain;
