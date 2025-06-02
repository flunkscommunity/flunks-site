import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";

const TreehouseMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <DraggableResizeableWindow
          windowsId={roomKey}
          headerTitle={title}
          initialWidth="420px"
          initialHeight="300px"
          onClose={() => closeWindow(roomKey)}
        >
          <div className="p-4 text-sm leading-relaxed">{content}</div>
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="w-full h-full bg-[#2f2f2f] text-white p-6">
      <h1 className="text-3xl mb-4">🌲 The Treehouse</h1>
      <div className="grid grid-cols-2 gap-4">
        <button
          className="bg-gray-800 p-3 rounded hover:bg-gray-700"
          onClick={() => openRoom("treehouse_loft", "Loft", "A creaky ladder leads to a dusty loft with old comic books.")}
        >
          🪜 Loft
        </button>
        <button
          className="bg-gray-800 p-3 rounded hover:bg-gray-700"
          onClick={() => openRoom("treehouse_desk", "Work Desk", "The desk has a map with tacks, red yarn, and a walkie talkie.")}
        >
          📻 Work Desk
        </button>
        <button
          className="bg-gray-800 p-3 rounded hover:bg-gray-700"
          onClick={() => openRoom("treehouse_trunk", "Old Trunk", "Inside is a flashlight, half a diary, and something locked...")}
        >
          🧳 Trunk
        </button>
        <button
          className="bg-gray-800 p-3 rounded hover:bg-gray-700"
          onClick={() => openRoom("treehouse_window", "Secret Window", "You can peek out over the lake from here. Something glimmers.")}
        >
          🪟 Window View
        </button>
      </div>
    </div>
  );
};

export default TreehouseMain;
