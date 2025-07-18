import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const FourThievesBarMain = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <div className="relative w-full h-full">
      <img
        src="/images/backdrops/BLANK.png"
        alt="4 Thieves Bar Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-80 text-white p-8 rounded-lg max-w-md text-center">
          <h1 className="text-2xl mb-4">🍺 4 Thieves Bar</h1>
          <p className="text-lg mb-4">
            A dimly lit bar with neon signs flickering in the windows. The jukebox plays old rock songs 
            while locals nurse their drinks and share stories.
          </p>
          <p className="text-sm text-gray-300">
            The bartender polishes glasses with a worn towel, occasionally glancing at the TV showing the game.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FourThievesBarMain;
