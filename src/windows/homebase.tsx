// windows/LockerRoom.tsx
import { Frame } from "react95";
import { WINDOW_IDS } from "fixed";
import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";

const LockerRoom = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      onClose={() => closeWindow(WINDOW_IDS.LOCKER_ROOM)}
      headerTitle="Locker Room"
      windowsId={WINDOW_IDS.LOCKER_ROOM}
      headerIcon="/images/icons/lockerroom.png"
    >
      <Frame variant="well" className="p-4">
        <p>Welcome to the locker room. Look around for clues!</p>
      </Frame>
    </DraggableResizeableWindow>
  );
};

export default LockerRoom;
