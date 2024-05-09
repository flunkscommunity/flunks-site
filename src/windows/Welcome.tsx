import React from "react";
import { useState } from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { Button, Frame, Checkbox } from "react95";
import styled from "styled-components";

const Welcome: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const [tipIndex, setTipIndex] = useState(0);

  const handleNextTip = () => {
    setTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const tips = [
    "[1/5] Flunks are cute but mischievous high-schoolers wreaking havoc on Flow",
    "[2/5] Flunks95 is where you'll be able to interact with anything Flunks",
    "[3/5] You'll need to create an account and login with a non-custodial wallet like Lilico and Blocto to have full access to Flunks95",
    "[4/5] You can get Flunks items on marketplaces like Flowty",
    "[5/5] You can stake you Flunks items at the Gumball Machine to earn $GUM",
  ];

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Welcome"
      authGuard={false}
      windowsId={WINDOW_IDS.WELCOME}
      onClose={() => {
        closeWindow(WINDOW_IDS.WELCOME);
      }}
    >
      <h1 className="text-4xl">Welcome to Flunks95</h1>
      <div className="flex">
        <section className="basis-2/3 flex flex-col">
          <Frame
            className="!gap-4"
            variant="field"
            style={{
              marginTop: "2rem",
              padding: "2rem",
              height: 200,
              width: 500,
            }}
          >
            <h2 className="text-xl font-bold">Did you know...</h2>
            <p>{tips[tipIndex]}</p>
          </Frame>
          <Checkbox label="Show this Welcome Screen the next time you start Flunks95" />
        </section>
        <section className="basis-1/3 flex flex-col mt-8 gap-2">
          <Button>What's New</Button>
          <Button onClick={handleNextTip}>Next Tip</Button>
          <Button onClick={() => closeWindow(WINDOW_IDS.WELCOME)}>Close</Button>
        </section>
      </div>
    </DraggableResizeableWindow>
  );
};

export default Welcome;
