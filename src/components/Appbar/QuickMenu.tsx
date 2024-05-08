import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Frame } from "react95";

const QuickMenu = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Frame variant="well" className="!h-9 px-4 !flex items-center">
      <span className="leading-[1] text-xl min-w-[68px] text-center text-nowrap font-bold">{format(time, "p")}</span>
    </Frame>
  );
};

export default QuickMenu;
