import {
  DynamicBridgeWidget,
  DynamicConnectButton,
  DynamicContextProvider,
  DynamicNav,
  DynamicUserProfile,
  DynamicWidget,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { FlowWalletConnectors } from "@dynamic-labs/flow";

const Stuff = () => {
  const { user, setShowDynamicUserProfile } = useDynamicContext();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <DynamicWidget />
      {!user && <DynamicConnectButton>CONNECT NOW</DynamicConnectButton>}
      {user && (
        <button onClick={() => setShowDynamicUserProfile(true)}>
          VIEW PROFILE
        </button>
      )}
      <DynamicUserProfile />
    </div>
  );
};

const Test = () => {
  return (
    <DynamicContextProvider
      settings={{
        // Find your environment id at https://app.dynamic.xyz/dashboard/developer
        environmentId: "f14ca865-c434-4bb6-92dd-7e260a491773",
        walletConnectors: [FlowWalletConnectors],
      }}
    >
      <Stuff />
    </DynamicContextProvider>
  );
};

export default Test;
