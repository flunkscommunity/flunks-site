import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const SnackShackMain = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <div className="relative w-full h-full">
      <img
        src="/images/backdrops/BLANK.png"
        alt="Snack Shack Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-80 text-white p-8 rounded-lg max-w-md text-center">
          <h1 className="text-2xl mb-4">🍟 Snack Shack</h1>
          <p className="text-lg mb-4">
            A small wooden shack with a serving window. The menu board lists burgers, fries, and sodas in chalk. 
            The smell of grease and the sound of sizzling fills the air.
          </p>
          <p className="text-sm text-gray-300">
            The owner wipes sweat from his brow as he flips patties on the small grill inside.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SnackShackMain;
