import { useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

// AGGRESSIVE desktop Flow Wallet branding fix
export const AggressiveDesktopFlowWalletFix = () => {
  const { user } = useDynamicContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(
      navigator.userAgent
    ) || 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile) return; // Only run on desktop

    console.log('🖥️ AGGRESSIVE Desktop Flow Wallet Fix - Starting...');

    // Strategy 1: Aggressive DOM manipulation
    const aggressiveTextReplace = () => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node as Text);
      }

      let replacements = 0;
      textNodes.forEach(textNode => {
        if (textNode.textContent?.includes('Lilico')) {
          textNode.textContent = textNode.textContent.replace(/Lilico/g, 'Flow Wallet');
          replacements++;
        }
        if (textNode.textContent?.includes('lilico')) {
          textNode.textContent = textNode.textContent.replace(/lilico/g, 'Flow Wallet');
          replacements++;
        }
      });

      if (replacements > 0) {
        console.log(`🔧 Replaced ${replacements} instances of Lilico with Flow Wallet`);
      }

      // Also handle attributes
      document.querySelectorAll('*').forEach(el => {
        ['alt', 'title', 'aria-label', 'data-testid'].forEach(attr => {
          const value = el.getAttribute(attr);
          if (value?.includes('Lilico') || value?.includes('lilico')) {
            el.setAttribute(attr, value.replace(/Lilico/gi, 'Flow Wallet'));
            replacements++;
          }
        });
      });
    };

    // Strategy 2: Intercept Dynamic Labs widget updates
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check for Dynamic Labs components
            if (element.querySelector?.('[data-testid*="dynamic"]') ||
                element.className?.includes('dynamic') ||
                element.textContent?.includes('Lilico') ||
                element.querySelector?.('img[alt*="lilico"]') ||
                element.querySelector?.('img[alt*="Lilico"]')) {
              
              setTimeout(() => aggressiveTextReplace(), 100);
            }
          }
        });
      });
    });

    // Strategy 3: Direct CSS injection to hide Lilico icons and replace with Flow
    const injectFlowWalletCSS = () => {
      const style = document.createElement('style');
      style.id = 'aggressive-flow-wallet-fix';
      style.textContent = `
        /* Hide Lilico branding and replace with Flow Wallet */
        [data-testid*="lilico"] img,
        img[alt*="lilico" i],
        img[alt*="Lilico"],
        img[src*="lilico" i] {
          content: url('https://wallet.flow.com/favicon.ico') !important;
        }
        
        /* Text replacement via CSS */
        [data-testid*="lilico"]:after,
        *:contains("Lilico"):after {
          content: "Flow Wallet" !important;
        }
        
        /* Force Flow Wallet visibility */
        [data-testid*="flowwallet"],
        [data-testid*="flow-wallet"] {
          display: block !important;
          visibility: visible !important;
        }
      `;
      
      if (!document.getElementById('aggressive-flow-wallet-fix')) {
        document.head.appendChild(style);
        console.log('🎨 Injected aggressive Flow Wallet CSS');
      }
    };

    // Apply all strategies immediately
    aggressiveTextReplace();
    injectFlowWalletCSS();
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeOldValue: true
    });

    // Repeat every 500ms for the first 10 seconds
    const aggressiveInterval = setInterval(() => {
      aggressiveTextReplace();
      injectFlowWalletCSS();
    }, 500);

    setTimeout(() => {
      clearInterval(aggressiveInterval);
    }, 10000);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(aggressiveInterval);
      const style = document.getElementById('aggressive-flow-wallet-fix');
      if (style) style.remove();
    };
  }, [user]);

  return null;
};

export default AggressiveDesktopFlowWalletFix;
