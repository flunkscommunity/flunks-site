import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const FootballFieldMain = () => {
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
        alt="Football Field Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* Bleachers/Stands */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FOOTBALL_FIELD_STANDS,
            "Bleachers",
            "Metal bleachers echo with the cheers of past games. Old programs and popcorn containers litter the ground."
          )
        }
        className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        🏟️ Stands
      </button>

      {/* Locker Room */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FOOTBALL_FIELD_LOCKER_ROOM,
            "Locker Room",
            "The smell of sweat and determination lingers. Motivational speeches still echo off the tiled walls."
          )
        }
        className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        👕 Locker Room
      </button>

      {/* Equipment Shed */}
      <button
        onClick={() =>
          openRoom(
            WINDOW_IDS.FOOTBALL_FIELD_EQUIPMENT_SHED,
            "Equipment Shed",
            "Helmets, shoulder pads, and practice equipment stored in organized chaos."
          )
        }
        className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
      >
        ⚡ Equipment
      </button>
    </div>
  );
};

export default FootballFieldMain;
