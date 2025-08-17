import React from "react";
import { useState, useEffect } from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { Button, Frame, Checkbox, Separator, Anchor } from "react95";
// TODO: GUM functionality temporarily disabled - keep import for future re-implementation
// import GumballMachine from "./GumballMachine";
import WelcomePopup from "./WelcomePopup";
import useGettingStarted from "store/useGettingStarted";

const Welcome: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();
  const [tipIndex, setTipIndex] = useState(0);
  const {
    showGettingStartedOnStartup: showWelcome,
    setShowGettingStartedOnStartup: setShowWelcome,
  } = useGettingStarted();

  const handleNextTip = () => {
    setTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setShowWelcome(isChecked);
  };

  const icon = "/images/icons/bulletin-board-icon.png";
  const tips = [
    <p>
      [1/6] Semester Zero is starting soon! Check the school calendar for
      important dates and events. 
    </p>,
    <p>
      [2/6] Play around in the terminal. That's where you can enter codes you may... find. Think of it as a way to unlock things and win prizes
    </p>,
    <p>
      [3/6] You'll need to create an account and login with a non-custodial
      wallet like{" "}
      <Anchor href="https://wallet.flow.com/download" target="_blank">
        Flow

      </Anchor>{" "}
      to have full access to Flunks2.0
    </p>,
    <p>
      [4/6] You can get Flunks items on marketplaces like{" "}
      <Anchor
        target="_blank"
        href="https://www.flowty.io/collection/0x807c3d470888cc48/Flunks"
      >
        Flowty
      </Anchor> AND ....... 
    </p>,
    <p>
      [5/6] Don't forget to create your profile! Click on the "My Locker" desktop icon to set up your username, link your Discord, and connect with the community.
    </p>,
    <p>
      [6/6] Thanks for making it this far... enter the code <strong>WTF</strong> in the terminal for a surprise!
    </p>
  ];

  return (
    <>
      {setShowWelcome && (
        <DraggableResizeableWindow
          offSetHeight={44}
          headerTitle="Getting Started"
          headerIcon="/images/icons/getting_started.png"
          initialHeight="480px"
          initialWidth="auto"
          resizable={false}
          showMaximizeButton={false}
          windowsId={WINDOW_IDS.WELCOME}
          onClose={() => {
            closeWindow(WINDOW_IDS.WELCOME);
          }}
          windowClassName="lg:!absolute lg:!top-1/2 lg:!left-1/2 lg:!transform lg:!-translate-x-1/2 lg:!-translate-y-1/2 lg:!min-w-[700px] !z-0"
        >
          <div className="p-4">
            <h1 className="lg:text-4xl text-3xl font-bold">
              Welcome to Flunks2.0
            </h1>
            <div className="lg:flex-row flex flex-col gap-6">
              <section className="basis-2/3 flex flex-col">
                <Frame
                  className="!gap-4 lg:mt-8 mt-4 p-8 min-h-[12rem] lg:min-h-[10rem] max-w-[32rem]"
                  variant="field"
                >
                  <div className="flex gap-2 mb-2 items-center">
                    <img src={icon} className="pr-2"></img>
                    <h2 className="text-xl font-bold pt-2">Did you know...</h2>
                  </div>
                  {tips[tipIndex]}
                </Frame>
              </section>
              <section className="basis-1/3 flex flex-col lg:mt-8 gap-2">
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
                <div className="mt-auto">
                  <Separator />
                </div>
              </section>
            </div>
            <div className="flex flex-col lg:flex-row justify-between w-full pt-2 gap-4">
              <Checkbox
                onChange={handleCheckboxChange}
                checked={showWelcome}
                label="Show this Welcome Screen the next time you start Flunks2.0"
                className="pt-2 lg:basis-2/3 order-last lg:order-none"
              />
              <Button
                onClick={() => closeWindow(WINDOW_IDS.WELCOME)}
                className="lg:basis-1/3 w-full lg:w-auto"
              >
                Close
              </Button>
            </div>
          </div>
        </DraggableResizeableWindow>
      )}
    </>
  );
};

export default Welcome;
