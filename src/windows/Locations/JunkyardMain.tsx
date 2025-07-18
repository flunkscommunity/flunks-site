import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const JunkyardMain = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <div className="relative w-full h-full">
      <img
        src="/images/backdrops/BLANK.png"
        alt="Junkyard Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-80 text-white p-8 rounded-lg max-w-md text-center">
          <h1 className="text-2xl mb-4">🚗 Junkyard</h1>
          <p className="text-lg mb-4">
            Towers of rusted cars and scrap metal create a maze of abandoned dreams. 
            An old guard dog sleeps next to a weather-beaten trailer.
          </p>
          <p className="text-sm text-gray-300">
            Somewhere in this chaos, there might be treasure hidden among the trash.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JunkyardMain;
