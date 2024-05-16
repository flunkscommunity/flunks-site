import React from "react";
import { useState } from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { Button, Frame, Checkbox } from "react95";
import styled from "styled-components";
import GumballMachine from "./GumballMachine";
import WelcomePopup from "./WelcomePopup";

const Welcome: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();
  const [tipIndex, setTipIndex] = useState(0);

  const handleNextTip = () => {
    setTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const tips = [
    <p>
      [1/5] Flunks are cute but mischievous high-schoolers wreaking havoc on
      Flow
    </p>,
    <p>
      [2/5] Flunks95 is where you'll be able to interact with anything Flunks
    </p>,
    <p>
      [3/5] You'll need to create an account and login with a non-custodial
      wallet like{" "}
      <a
        href="https://lilico.app/"
        target="_blank"
        className="underline text-blue-500"
      >
        Lilico
      </a>{" "}
      and{" "}
      <a
        href="https://blocto.io/"
        target="_blank"
        className="underline text-blue-500"
      >
        Blocto
      </a>{" "}
      to have full access to Flunks95
    </p>,
    <p>
      [4/5] You can get Flunks items on marketplaces like{" "}
      <a
        target="_blank"
        href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks"
        className="underline text-blue-500"
      >
        Flowty
      </a>
    </p>,
    <p>
      [5/5] You can stake your Flunks items at the{" "}
      <span
        onClick={() =>
          openWindow({
            key: WINDOW_IDS.GUMBALL_MACHINE,
            window: <GumballMachine />,
          })
        }
        className="underline text-blue-500 cursor-pointer"
      >
        Gumball Machine
      </span>{" "}
      to earn $GUM
    </p>,
  ];

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Getting Started"
      initialHeight="60%"
      initialWidth="55%"
      authGuard={false}
      windowsId={WINDOW_IDS.WELCOME}
      onClose={() => {
        closeWindow(WINDOW_IDS.WELCOME);
      }}
    >
      <div className="p-4">
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
              {tips[tipIndex]}
            </Frame>
            <Checkbox
              label="Show this Welcome Screen the next time you start Flunks95"
              className="pt-2"
            />
          </section>
          <section className="basis-1/3 flex flex-col mt-8 gap-2">
            <Button
              onClick={() =>
                openWindow({
                  key: WINDOW_IDS.WELCOME_POPUP,
                  window: <WelcomePopup />,
                })
              }
            >
              What's New
            </Button>
            <Button onClick={handleNextTip}>Next Tip</Button>
            <Button
              onClick={() => closeWindow(WINDOW_IDS.WELCOME)}
              className=""
            >
              Close
            </Button>
          </section>
        </div>
      </div>
    </DraggableResizeableWindow>
  );
};

export default Welcome;
