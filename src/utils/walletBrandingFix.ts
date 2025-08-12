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
  };

  // Target Dynamic Labs modal content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if this is a Dynamic Labs modal or component
          if (element.querySelector?.('[data-testid*="lilico"]') ||
              element.textContent?.includes('Lilico') ||
              element.textContent?.includes('Install Lilico extension')) {
            replaceTextInElement(element);
          }

          // Also check the element itself
          if (element.textContent?.includes('Lilico')) {
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
  observer = replaceLilicoBranding();
};

export const stopWalletBrandingFix = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};
