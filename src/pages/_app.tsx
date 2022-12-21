import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";
import "config/fcl";

import "../styles/globals.css";
import WindowsProvider from "contexts/WindowsContext";
import { UserProvider } from "contexts/WalletContext";
import ClaimBackpackProvider from "contexts/BackpackClaimContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <UserProvider>
          <WindowsProvider>
            <ClaimBackpackProvider>
              <Component {...pageProps} />
            </ClaimBackpackProvider>
          </WindowsProvider>
        </UserProvider>
      </ThemeProvider>
    </>
  );
};

export default MyApp;
