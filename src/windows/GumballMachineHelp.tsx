import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Anchor, Frame, ScrollView } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";

const GumballMachineHelp: React.FC = () => {
  const { closeWindow } = useWindowsContext();

  return (
    <DraggableResizeableWindow
      offSetHeight={44}
      headerTitle="Gumball Machine User Manual"
      onClose={() => {
        closeWindow(WINDOW_IDS.GUMBALL_MACHINE_HELP);
      }}
      windowsId={WINDOW_IDS.GUMBALL_MACHINE_HELP}
      initialHeight="60%"
      initialWidth="auto"
      showMaximizeButton={false}
      resizable={false}
      headerIcon="/images/icons/whats_new.png"
    >
      <ScrollView className="!flex !h-full !w-full">
        <Frame variant="field" className="!w-full !h-auto">
          <article className="p-4 flex flex-col items-start gap-6 max-w-[400px]">
            <div>
              <h1 className="text-2xl">Gumball Machine Version 01</h1>
              <h2>User Manual</h2>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">Stake & Earn $GUM</h2>
              <p className="text-lg">
                Stake your Flunks items in the Gumball Machine to earn $GUM. You
                will start accruing $GUM for each item that you have staked. You
                can claim the accrued $GUM anytime, and the claimed $GUM will be
                added to your $GUM balance. Each staked item will be directly
                linked with the $GUM it has accrued.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">Unstaking</h2>
              <p className="text-lg">
                Unstaking your Flunks items will stop the accrual of $GUM for
                that item. You can unstake an item anytime, and the accrued $GUM
                will be added to your $GUM balance.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">
                Selling Or Transferring Staked Items
              </h2>
              <p className="text-lg">
                When a staked item is sold on a marketplace or transferred to
                another wallet, any accrued $GUM that is unclaimed will also be
                transferred to the new wallet. A staked item will continue to be
                staked when it is listed on a marketplace.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">Non-Custodial Wallets</h2>
              <p className="text-lg">
                You will need to access Flunks95 with a non-custodial wallet
                like Flow Wallet and Blocto to use the Gumball Machine. The
                transactions and contracts required to use the Gumball Machine
                are not supported by Dapper Wallet. We recommend transferring
                your Flunks items to a non-custodial wallet or to link your
                non-custodial wallet(s) to your Dapper Wallet.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">Transferring Your Items</h2>
              <p className="text-lg">
                Dapper Wallet provides a secure and easy way to transfer Flunks
                items to a different wallet. After creating your non-custodial
                wallet, navigate to your{" "}
                <Anchor
                  href="https://accounts.meetdapper.com/inventory?page=1&sort=DESC&collection=553b5004-99fb-4c18-944b-6b292dba5bc4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dapper Wallet
                </Anchor>{" "}
                to transfer your Flunks items from your Dapper Wallet to your
                non-custodial wallet.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold">Account Linking</h2>
              <p className="text-lg">
                You can also consider account linking If you already have a
                Dapper Wallet with Flunks items. Account linking allows you to
                connect your Dapper Wallet with external wallets to do more with
                your NFTs. It also allows you to exercise self-custody of your
                Dapper Wallet NFTs using a non-custodial wallet. View more about
                account linking on{" "}
                <Anchor
                  href="https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Dapper's website here
                </Anchor>
                .
              </p>
            </div>
          </article>
        </Frame>
      </ScrollView>
    </DraggableResizeableWindow>
  );
};

export default GumballMachineHelp;
