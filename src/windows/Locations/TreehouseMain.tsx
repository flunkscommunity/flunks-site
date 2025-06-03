import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, WindowHeader } from "react95";

const TreehouseMain = () => {
  const { openWindow, closeWindow, minimizeWindow } = useWindowsContext();
  const windowId = "treehouse_main";

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <div className="p-4 text-sm leading-relaxed bg-[#1a1a1a] text-white w-full h-full">
          <h1 className="text-xl mb-2">{title}</h1>
          <p>{content}</p>
        </div>
      ),
    });
  };

  return (
    <DraggableResizeableWindow
      windowsId={windowId}
      initialWidth="100%"
      initialHeight="100%"
      resizable={false}
      headerRender={
        <WindowHeader className="!flex !items-center !justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/images/icons/tree.png"
              alt="Tree icon"
              className="h-5 w-5"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <span className="text-base">Treehouse</span>
          </div>
          <div className="flex gap-1">
            <Button
              id="action"
              onClick={() => minimizeWindow(windowId)}
              style={{ width: 22, height: 22 }}
            >
              <span style={{ fontSize: "16px", lineHeight: "12px" }}>_</span>
            </Button>
            <Button
              id="action"
              onClick={() => {
                console.log("✖ Close button clicked for:", windowId);
                closeWindow(windowId);
              }}
              style={{ width: 22, height: 22 }}
            >
              <span className="close-icon" />
            </Button>
          </div>
        </WindowHeader>
      }
    >
      <div className="relative w-full h-full">
        <img
          src="/images/locations/treehouse/daybg.png"
          alt="Treehouse Background"
          className="absolute inset-0 w-full h-full object-contain z-0"
        />

        {/* Top Left - Loft */}
        <button
          onClick={() =>
            openRoom("treehouse_loft", "Loft", "A creaky ladder leads to a dusty loft with old comic books.")
          }
          className="absolute top-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
        >
          🪜 Loft
        </button>

        {/* Top Right - Work Desk */}
        <button
          onClick={() =>
            openRoom("treehouse_desk", "Work Desk", "The desk has a map with tacks, red yarn, and a walkie talkie.")
          }
          className="absolute top-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
        >
          📻 Work Desk
        </button>

        {/* Bottom Left - Trunk */}
        <button
          onClick={() =>
            openRoom("treehouse_trunk", "Old Trunk", "Inside is a flashlight, half a diary, and something locked...")
          }
          className="absolute bottom-4 left-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
        >
          🧳 Trunk
        </button>

        {/* Bottom Right - Window View */}
        <button
          onClick={() =>
            openRoom("treehouse_window", "Secret Window", "You can peek out over the lake from here. Something glimmers.")
          }
          className="absolute bottom-4 right-4 bg-gray-900 text-white px-3 py-2 rounded z-10 hover:bg-gray-700 transition-transform duration-200 hover:scale-105"
        >
          🪟 Window View
        </button>
      </div>
    </DraggableResizeableWindow>
  );
};

export default TreehouseMain;
