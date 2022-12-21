import { useEffect, useState } from "react";
import { Frame, ProgressBar } from "react95";
import styled from "styled-components";
import { H3, P } from "./Typography";

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

const SlowProgressBar: React.FC<Props> = (props) => {
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
    <WelcomeContainer>
      <Frame variant="well">
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.6,
          }}
        />
      </Frame>
      <ProgressBar
        style={{
          gridRow: "2",
        }}
        variant="tile"
        hideValue
        value={Math.floor(percent)}
      />
    </WelcomeContainer>
  );
};

export default SlowProgressBar;
