import { useEffect, useState } from "react";
import { ProgressBar } from "react95";

interface Props {
  children: React.ReactNode;
}

const SlowProgressBar: React.FC<Props> = (props) => {
  const { children } = props;
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((previousPercent) => {
        if (previousPercent === 100) {
          clearInterval(timer);
          setComplete(true);
          return 0;
        }
        const diff = Math.random() * 10;
        return Math.min(previousPercent + diff, 100);
      });
    }, 200);
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  return complete ? (
    <>{children}</>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
      }}
    >
      <ProgressBar variant="tile" hideValue value={Math.floor(percent)} />
    </div>
  );
};

export default SlowProgressBar;
