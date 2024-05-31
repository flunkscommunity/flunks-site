import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Frame, Toolbar } from "react95";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import AppLoader from "components/AppLoader";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import ErrorWindow from "./ErrorWindow";
import GumDashboard from "components/Staking/GumDashboard";
import StakingProvider from "contexts/StakingContext";
import { FclTransactionProvider } from "contexts/FclTransactionContext";
import StakeableItemsTable from "components/Staking/Table";
import GumballMachineHelp from "./GumballMachineHelp";

const GumballMachine: React.FC = () => {
  const { closeWindow, openWindow } = useWindowsContext();
  const { user } = useDynamicContext();

  if (!user) {
    return (
      <ErrorWindow
        title="Error Starting Program"
        message="You're not signed in. Please sign in to continue.."
        actions={
          <>
            <Button onClick={() => closeWindow(WINDOW_IDS.GUMBALL_MACHINE)}>
              Close
            </Button>
            <DynamicConnectButton>
              <Button className="ml-auto">Sign In</Button>
            </DynamicConnectButton>
          </>
        }
        windowId={WINDOW_IDS.GUMBALL_MACHINE}
      />
    );
  }

  return (
    <AppLoader bgImage="/images/loading/gum-app-bg.webp">
      <DraggableResizeableWindow
        offSetHeight={44}
        headerTitle="Gumball Machine v1"
        onClose={() => {
          closeWindow(WINDOW_IDS.GUMBALL_MACHINE);
        }}
        windowsId={WINDOW_IDS.GUMBALL_MACHINE}
        onHelp={() => {
          openWindow({
            key: WINDOW_IDS.GUMBALL_MACHINE_HELP,
            window: <GumballMachineHelp />,
          });
        }}
        initialWidth="500px"
        initialHeight="70%"
        toolbar={
          <Toolbar>
            <Button variant="menu" size="sm" active>
              Main
            </Button>
            <Button variant="menu" size="sm" disabled>
              Leaderboard
            </Button>
          </Toolbar>
        }
      >
        <FclTransactionProvider>
          <StakingProvider>
            <GumDashboard />
            <Frame
              variant="inside"
              className="!flex !h-full !w-full overflow-hidden"
            >
              <StakeableItemsTable />
            </Frame>
          </StakingProvider>
        </FclTransactionProvider>
      </DraggableResizeableWindow>
    </AppLoader>
  );
};

export default GumballMachine;
