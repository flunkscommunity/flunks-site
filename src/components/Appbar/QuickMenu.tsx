import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Frame, Button } from "react95";
import { useAudio } from "contexts/AudioContext";

const QuickMenu = () => {
  const [time, setTime] = useState(new Date());
  const { isMuted, toggleMute } = useAudio();

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Frame variant="well" className="!h-9 px-4 !flex items-center gap-2">
      <span className="leading-[1] text-xl min-w-[68px] text-center text-nowrap font-bold">{format(time, "p")}</span>
      <Button
        onClick={toggleMute}
        style={{
          padding: '2px 4px',
          fontSize: '12px',
          minWidth: 'auto',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={isMuted ? "Unmute audio" : "Mute audio"}
      >
        {isMuted ? "🔇" : "🔊"}
      </Button>
    </Frame>
  );
};

export default QuickMenu;
