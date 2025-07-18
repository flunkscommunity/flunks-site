import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const RugDoctorMain = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <div className="relative w-full h-full">
      <img
        src="/images/backdrops/BLANK.png"
        alt="Rug Doctor Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-80 text-white p-8 rounded-lg max-w-md text-center">
          <h1 className="text-2xl mb-4">🧽 Rug Doctor</h1>
          <p className="text-lg mb-4">
            A small carpet cleaning business with industrial machines humming in the background. 
            The owner takes pride in making the dirtiest carpets look brand new.
          </p>
          <p className="text-sm text-gray-300">
            Steam rises from the cleaning equipment, and the smell of industrial detergent fills the air.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RugDoctorMain;
