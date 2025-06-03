import { useWindowsContext } from "contexts/WindowsContext";

const TreehouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <div className="p-4 text-sm leading-relaxed">
          <h1 className="text-xl mb-2">{title}</h1>
          <p>{content}</p>
        </div>
      ),
    });
  };

  return (
    <div
      className="relative w-full h-full bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/locations/treehouse/daybg.png')", // make sure this exists
      }}
    >
      {/* Top Left - Loft */}
      <button
        onClick={() =>
          openRoom("treehouse_loft", "Loft", "A creaky ladder leads to a dusty loft with old comic books.")
        }
        className="absolute top-4 left-4 bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700"
      >
        🪜 Loft
      </button>

      {/* Top Right - Work Desk */}
      <button
        onClick={() =>
          openRoom("treehouse_desk", "Work Desk", "The desk has a map with tacks, red yarn, and a walkie talkie.")
        }
        className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700"
      >
        📻 Work Desk
      </button>

      {/* Bottom Left - Trunk */}
      <button
        onClick={() =>
          openRoom("treehouse_trunk", "Old Trunk", "Inside is a flashlight, half a diary, and something locked...")
        }
        className="absolute bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700"
      >
        🧳 Trunk
      </button>

      {/* Bottom Right - Window View */}
      <button
        onClick={() =>
          openRoom("treehouse_window", "Secret Window", "You can peek out over the lake from here. Something glimmers.")
        }
        className="absolute bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded hover:bg-gray-700"
      >
        🪟 Window View
      </button>
    </div>
  );
};

export default TreehouseMain;
