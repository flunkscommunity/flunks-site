import React from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { Frame } from "react95";

const WelcomePopup: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="What's New"
      initialHeight="85%"
      initialWidth="35%"
      authGuard={false}
      windowsId={WINDOW_IDS.WELCOME_POPUP}
      onClose={() => {
        closeWindow(WINDOW_IDS.WELCOME_POPUP);
      }}
    >
      <Frame
        className="!gap-4"
        variant="field"
        style={{
          marginTop: "2rem",
          padding: "2rem",
          height: 450,
          width: 500,
        }}
      >
        <h2 className="text-xl font-bold">Non-Custodial Wallets</h2>
        <p className="text-lg">
          Moving forward, you will need to log in with a non-custodial wallet to
          use newer features like the Gumball Machine on the Flunks95 website.
          Recommended non-custodial wallets include{" "}
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
          </a>
          . Remember to transfer all your Flunks items on your Dapper Wallet to
          your non-custodial wallet before logging in. You can also link your{" "}
          <a
            href="https://meetdapper.com/"
            target="_blank"
            className="underline text-blue-500"
          >
            Dapper Wallet
          </a>{" "}
          to a non-custodial wallet. View more about account linking on Dapper’s
          website{" "}
          <a
            href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
            target="_blank"
            className="underline text-blue-500"
          >
            here
          </a>
          .
        </p>
        <h2 className="text-xl font-bold">Gumball Machine</h2>
        <p className="text-lg">
          Check out the newly launched Gumball Machine. Stake your Flunks items
          in the Gumball Machine to earn $GUM. Items can only be staked if
          they’re in a non-custodial wallet such as{" "}
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
          </a>
          .
        </p>
      </Frame>
    </DraggableResizeableWindow>
  );
};

export default WelcomePopup;
