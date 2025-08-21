// Utility to replace Lilico branding with Flow Wallet in Dynamic Labs modals
export const replaceLilicoBranding = () => {
  if (typeof window === 'undefined') return;

  const replaceTextInElement = (element: Element) => {
    // Handle text nodes
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const textNodes: Text[] = [];
    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    textNodes.forEach(textNode => {
      if (textNode.textContent?.includes('Lilico')) {
        textNode.textContent = textNode.textContent.replace(/Lilico/g, 'Flow Wallet');
      }
      if (textNode.textContent?.includes('lilico')) {
        textNode.textContent = textNode.textContent.replace(/lilico/g, 'Flow Wallet');
      }
    });

    // Also handle attribute replacements (alt text, aria-labels, etc.)
    if (element instanceof Element) {
      const allElements = element.querySelectorAll('*');
      allElements.forEach(el => {
        // Replace alt text
        if (el.getAttribute('alt')?.includes('Lilico')) {
          el.setAttribute('alt', el.getAttribute('alt')!.replace(/Lilico/g, 'Flow Wallet'));
        }
        // Replace aria-label
        if (el.getAttribute('aria-label')?.includes('Lilico')) {
          el.setAttribute('aria-label', el.getAttribute('aria-label')!.replace(/Lilico/g, 'Flow Wallet'));
        }
        // Replace title
        if (el.getAttribute('title')?.includes('Lilico')) {
          el.setAttribute('title', el.getAttribute('title')!.replace(/Lilico/g, 'Flow Wallet'));
        }
      });
    }
  };

  // Target Dynamic Labs modal content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if this is a Dynamic Labs modal or component
          if (element.querySelector?.('[data-testid*="lilico"]') ||
              element.querySelector?.('[data-testid*="flowwallet"]') ||
              element.textContent?.includes('Lilico') ||
              element.textContent?.includes('Install Lilico extension') ||
              element.className?.includes('lilico') ||
              element.id?.includes('lilico')) {
            replaceTextInElement(element);
          }

          // Also check the element itself
          if (element.textContent?.includes('Lilico') ||
              element.className?.includes('lilico') ||
              element.id?.includes('lilico')) {
            replaceTextInElement(element);
          }
        }
      });
    });
  });

  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  // Initial replacement for existing elements
  const existingElements = document.querySelectorAll('*');
  existingElements.forEach(element => {
    if (element.textContent?.includes('Lilico')) {
      replaceTextInElement(element);
    }
  });

  return observer;
};

// Auto-start the branding fix
let observer: MutationObserver | null = null;

export const startWalletBrandingFix = () => {
  if (observer) {
    observer.disconnect();
  }
  console.log('🔧 Starting aggressive wallet branding fix...');
  observer = replaceLilicoBranding();
  
  // Also do periodic checks to catch any missed instances
  const periodicCheck = setInterval(() => {
    if (document.querySelector('[data-testid*="lilico"], [class*="lilico"], [id*="lilico"]')) {
      console.log('🔧 Found Lilico branding - applying fix...');
      if (observer) observer.disconnect();
      observer = replaceLilicoBranding();
    }
  }, 1000);

  // Clean up after 30 seconds to avoid running forever
  setTimeout(() => {
    clearInterval(periodicCheck);
  }, 30000);
};

export const stopWalletBrandingFix = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};
