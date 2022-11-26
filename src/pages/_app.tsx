import { type AppType } from "next/dist/shared/lib/utils";
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "styles/global";
import original from "react95/dist/themes/original";

import "../styles/globals.css";
import WindowsProvider from "contexts/WindowsContext";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <WindowsProvider>
          <Component {...pageProps} />
        </WindowsProvider>
      </ThemeProvider>
    </>
  );
};

export default MyApp;
