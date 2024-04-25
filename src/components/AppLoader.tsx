import { useEffect, useState } from "react";
import { Frame, ProgressBar } from "react95";
import styled from "styled-components";
import { H3, P } from "./Typography";
import Image from "next/image";

interface Props {
  children: React.ReactNode;
  bgImage: string;
}

const WelcomeContainer = styled.div`
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr;
  grid-template-rows: 11fr 1fr;
`;

const AppLoader: React.FC<Props> = (props) => {
  const { children, bgImage } = props;
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
    <div className="shadow-2xl flex flex-col absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[800px] h-auto object-contain">
      <Frame>
        <img
          src={bgImage}
          alt="bgImage"
          className="w-full h-auto object-contain"
        />
        <ProgressBar
          variant="default"
          value={Math.floor(percent)}
          className="[&>*:first-child]:before:!border-none"
        />
      </Frame>
    </div>
  );
};

export default AppLoader;
