import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* black-translucent makes status bar overlay content with light text */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* viewport-fit=cover extends content into safe areas (notch, Dynamic Island) */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        {/* Theme color for browser chrome */}
        <meta name="theme-color" content="#c0c0c0" />
        
        {/* Classic Retro Gaming Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Orbitron:wght@400;700;900&family=Silkscreen:wght@400;700&family=Fira+Code:wght@300;400;500&family=JetBrains+Mono:wght@300;400;500&family=Oswald:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        
        {/* Classic MS system fonts fallback */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'MS Sans Serif';
              src: local('MS Sans Serif'), local('Tahoma'), local('Arial');
            }
            @font-face {
              font-family: 'Perfect DOS VGA 437';
              src: local('Courier New'), local('Monaco'), local('Menlo');
              font-weight: normal;
            }
            @font-face {
              font-family: 'w95fa';
              src: local('MS Sans Serif'), local('Tahoma');
            }
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
