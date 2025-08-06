import React from "react";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { ScrollView } from "react95";
import { Frame } from "react95";
import { format, formatRelative } from "date-fns";

const WelcomePopup: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const isMobile = window.innerWidth < 768;

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="What's New"
      headerIcon="/images/icons/whats_new.png"
      initialHeight="70%"
      initialWidth="auto"
      resizable={false}
      showMaximizeButton={false}
      windowsId={WINDOW_IDS.WELCOME_POPUP}
      onClose={() => {
        closeWindow(WINDOW_IDS.WELCOME_POPUP);
      }}
    >
      <ScrollView className="w-full h-full" shadow={false}>
        <Frame
          className="lg:gap-4 p-8 h-auto w-auto lg:w-[32rem]"
          variant="field"
        >
          <div className="flex flex-col mb-10">
            <h1 className="text-2xl font-bold mb-1">Flunks.net Changelog</h1>
            <h2 className="text-lg">
              Posted{" "}
              {formatRelative(new Date("2025-07-04T08:00:00.00Z"), new Date())}{" "}
            </h2>
          </div>

          <h2 className="text-xl font-bold mb-1">Non-Custodial Wallets</h2>
          <p className="text-lg mb-6">
            Moving forward, you will need to log in with a non-custodial wallet
            to use newer features like the Season Zero on the Flunks2.0
            website. Recommended non-custodial wallets include{" "}
            <a
              href="https://www.flow.com/flow-wallet"
              target="_blank"
              className="text-[#0000EE] hover:underline"
            >
              Flow Wallet
            </a>
            
            . Remember to transfer all your Flunks items on your Dapper Wallet
            to your non-custodial wallet before logging in. You can also link
            your{" "}
            <a
              href="https://meetdapper.com/"
              target="_blank"
              className="underline text-blue-500"
            >
              Dapper Wallet
            </a>{" "}
            to a non-custodial wallet. View more about account linking on
            Dapper’s website{" "}
            <a
              href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
              target="_blank"
              className="underline text-blue-500"
            >
              here
            </a>
            .
          </p>
          <h2 className="text-xl font-bold mb-1">OnlyFlunks v1</h2>
          <p className="text-lg mb-6">
            OnlyFlunks streamlines and enhances the functionality of the
            previous Your Students and Lost and Found apps. While the Your
            Students app managed your entire inventory of Flunks and the Lost
            and Found app handled your backpacks, OnlyFlunks now integrates both
            into a single, efficient platform. This new version allows you to
            view your Flunks in either their original or portrait format, track
            your total inventory count, and access detailed information about
            your items and their traits. Additionally, you can choose between a 
            gridded or table view of your items.
            <br />
            <br />
            OnlyFlunks also displays linked items from Dapper as it now reads
            on-chain data directly, making it easier to manage all your assets
            in one place. Furthermore, backpack claiming and graduation are both
            accessible within OnlyFlunks, providing a comprehensive and
            streamlined experience.
          </p>
          <h2 className="text-xl font-bold mb-1">Website Overhaul</h2>
          <p className="text-lg mb-6">
            The website overhaul brings a host of significant updates designed
            to enhance your experience. Previously, access to the entire website
            was gated, requiring users to log in using Dapper Wallet. Now, the
            website is open to everyone, though certain features such as the
            Season Zero and OnlyFlunks require logging in with a
            non-custodial wallet.
            <br />
            <br />
            A new settings tab has been introduced, allowing you to customize
            your Flunks2.0 experience. This includes setting your desired theme
            and desktop background, as well as managing your user account. To
            help new users get acquainted, we've added a getting started window
            that displays key facts about Flunks. Additionally, the "What's New"
            tab, which you are currently reading, will provide updates on
            changes with every release.
            <br />
            <br />
            To showcase the Flunks company and brand, an about us page has been
            added. We've also implemented numerous visual updates, featuring
            custom icons recreated in the Windows 95 aesthetic and color
            palette. Lastly, we've included a teaser for Pocket Juniors, giving
            you a sneak peek of what's to come.
          </p>
        </Frame>
      </ScrollView>
    </DraggableResizeableWindow>
  );
};

export default WelcomePopup;
