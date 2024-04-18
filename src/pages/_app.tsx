import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";
import "config/fcl";

import "../styles/globals.css";
import WindowsProvider from "contexts/WindowsContext";
import ClaimBackpackProvider from "contexts/BackpackClaimContext";
import { DynamicContextProvider, DynamicUserProfile } from "@dynamic-labs/sdk-react-core";
// @ts-ignore
import { FlowWalletConnectors } from "@dynamic-labs/flow";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <GlobalStyles />

      <ThemeProvider theme={original}>
        <WindowsProvider>
          <ClaimBackpackProvider>
            <DynamicContextProvider
              settings={{
                environmentId: "f14ca865-c434-4bb6-92dd-7e260a491773",
                walletConnectors: [FlowWalletConnectors],
              }}
            >
              <Component {...pageProps} />

              <DynamicUserProfile />
            </DynamicContextProvider>
          </ClaimBackpackProvider>
        </WindowsProvider>
      </ThemeProvider>
    </>
  );
};

export default MyApp;
