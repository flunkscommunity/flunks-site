import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const ShedMain = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <div className="relative w-full h-full">
      <img
        src="/images/backdrops/BLANK.png"
        alt="Shed Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-80 text-white p-8 rounded-lg max-w-md text-center">
          <h1 className="text-2xl mb-4">🏚️ Old Shed</h1>
          <p className="text-lg mb-4">
            A weathered wooden shed with tools hanging on rusty hooks. Cobwebs span the corners, 
            and dust motes dance in the shafts of light filtering through the cracks.
          </p>
          <p className="text-sm text-gray-300">
            Old paint cans and forgotten projects sit on makeshift shelves.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShedMain;
