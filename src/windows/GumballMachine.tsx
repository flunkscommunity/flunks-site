import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { Button, Frame } from "react95";
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
        style={{
          backgroundImage: `url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='25' height='25' patternTransform='scale(2) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='hsla(0, 0%, 100%, 0)'/><path d='M25 30a5 5 0 110-10 5 5 0 010 10zm0-25a5 5 0 110-10 5 5 0 010 10zM0 30a5 5 0 110-10 5 5 0 010 10zM0 5A5 5 0 110-5 5 5 0 010 5zm12.5 12.5a5 5 0 110-10 5 5 0 010 10z'  stroke-width='1' stroke='hsla(259, 0%, 100%, 0.51)' fill='none'/><path d='M0 15a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm25 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5zM12.5 2.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5zm0 25a2.5 2.5 0 110-5 2.5 2.5 0 010 5z'  stroke-width='1' stroke='hsla(340, 0%, 100%, 0.26)' fill='none'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,0)' fill='url(%23a)'/></svg>")`,
        }}
        onHelp={() => {
          openWindow({
            key: WINDOW_IDS.GUMBALL_MACHINE_HELP,
            window: <GumballMachineHelp />,
          });
        }}
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
