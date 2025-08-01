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
  DynamicUserProfile,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { SdkViewSectionType, SdkViewType } from "@dynamic-labs/sdk-api";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import useThemeSettings from "store/useThemeSettings";

// Create custom Flow connectors excluding Blocto
const customFlowConnectors = (props: any) => {
  const allConnectors = FlowWalletConnectors(props);
  return allConnectors.filter((connector: any) => connector.name !== 'Blocto');
};
import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { PaginatedItemsProvider } from "contexts/UserPaginatedItems";
import { UserProfileProvider } from "contexts/UserProfileContext";
import { AudioProvider } from "contexts/AudioContext";

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
        <AudioProvider>
          <WindowsProvider>
            <ClaimBackpackProvider>
              <DynamicContextProvider
                settings={{
                  environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID || "53a9e7ed-47cf-468c-b43e-44e8fcec1b13",
                  walletConnectors: [customFlowConnectors],
                  overrides: {
                    views: [
                      {
                        type: SdkViewType.Login,
                        sections: [
                          {
                            type: SdkViewSectionType.Wallet,
                            defaultItem: "flowwallet", // Lilico wallet
                          },
                        ],
                      },
                    ],
                  },
                }}
              >
                <UserProfileProvider>
                  <PaginatedItemsProvider>
                    <Component {...pageProps} />
                    <Analytics />
                    <DynamicUserProfile />
                  </PaginatedItemsProvider>
                </UserProfileProvider>
              </DynamicContextProvider>
            </ClaimBackpackProvider>
          </WindowsProvider>
        </AudioProvider>
      </ThemeWrapper>
    </>
  );
};

export default MyApp;
