import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";
import "config/fcl";

import "../styles/globals.css";
import WindowsProvider from "contexts/WindowsContext";
import ClaimBackpackProvider from "contexts/BackpackClaimContext";
import {
  DynamicContextProvider,
  DynamicMultiWalletPromptsWidget,
  DynamicUserProfile,
  RemoveWallets,
} from "@dynamic-labs/sdk-react-core";
// @ts-ignore
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import useThemeSettings from "store/useThemeSettings";
import React from "react";
import { Analytics } from "@vercel/analytics/react";

const ThemeWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme } = useThemeSettings();
  return <ThemeProvider theme={theme.theme}>{children}</ThemeProvider>;
};

const MyApp: AppType = ({ Component, pageProps }) => {
  const memodGlobalStyles = React.useMemo(() => <GlobalStyles />, []);

  return (
    <>
      {memodGlobalStyles}
      <ThemeWrapper>
        <WindowsProvider>
          <ClaimBackpackProvider>
            <DynamicContextProvider
              settings={{
                environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID,
                walletConnectors: [FlowWalletConnectors],
                walletsFilter: RemoveWallets(["dapper"]),
              }}
            >
              <Component {...pageProps} />
              <Analytics />
              <DynamicUserProfile />
            </DynamicContextProvider>
          </ClaimBackpackProvider>
        </WindowsProvider>
      </ThemeWrapper>
    </>
  );
};

export default MyApp;
