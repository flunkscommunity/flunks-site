import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";

const LakeTreeMain = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <div className="relative w-full h-full">
      <img
        src="/images/backdrops/BLANK.png"
        alt="Lake Tree Background"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-80 text-white p-8 rounded-lg max-w-md text-center">
          <h1 className="text-2xl mb-4">🌳 Lake Tree</h1>
          <p className="text-lg mb-4">
            An ancient oak tree stands alone by the lake's edge. Its thick trunk bears the carved initials 
            of countless couples and friends from years past.
          </p>
          <p className="text-sm text-gray-300">
            The water laps gently at the shore, and a rope swing hangs from one of the lower branches.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LakeTreeMain;
