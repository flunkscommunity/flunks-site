import React, { useState, useEffect } from "react";
import { differenceInSeconds, format } from "date-fns";
import { useStakingContext } from "contexts/StakingContext";

const targetDate = new Date("2024-06-03T22:00:00.00Z");

const GumCountdown = () => {
  const { setCanStake } = useStakingContext();
  const [timeRemaining, setTimeRemaining] = useState(
    differenceInSeconds(new Date(targetDate), new Date())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeRemaining = differenceInSeconds(
        new Date(targetDate),
        new Date()
      );
      setTimeRemaining(newTimeRemaining);

      if (newTimeRemaining <= 0) {
        setCanStake(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
  };

  return (
    <div className="flex w-full h-full items-center justify-center">
      {timeRemaining > 0 ? (
        <div className="text-center flex flex-col gap-2 w-full">
          <p className="text-3xl tracking-widest w-full">
            {formatTime(timeRemaining)}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default GumCountdown;
