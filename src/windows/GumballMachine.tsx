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

const GumballMachine: React.FC = () => {
  const { closeWindow } = useWindowsContext();
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
              <Button as={"a"} primary={"true"} className="ml-auto">
                Sign In
              </Button>
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
        headerTitle="Gumball Machine v96"
        onClose={() => {
          closeWindow(WINDOW_IDS.GUMBALL_MACHINE);
        }}
        windowsId={WINDOW_IDS.GUMBALL_MACHINE}
        style={{
          backgroundImage: "url('/images/gum-pattern.png')",
          backgroundPosition: "center top",
          backgroundBlendMode: "color-burn",
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
