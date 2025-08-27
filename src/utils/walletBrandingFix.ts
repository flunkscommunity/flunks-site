// Wallet branding fix utilities with error handling
export const replaceLilicoBranding = (): MutationObserver | null => {
  try {
    if (typeof window === 'undefined' || !document) return null;

    console.log('🔧 Setting up aggressive Lilico → Flow Wallet text replacement...');
    
    const applyBrandingFix = () => {
      try {
        // Replace all instances of "Lilico" with "Flow Wallet" in text content
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_TEXT
        );

        const textNodes: Text[] = [];
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent && node.textContent.includes('Lilico')) {
            textNodes.push(node as Text);
          }
        }

        textNodes.forEach(textNode => {
          if (textNode.textContent) {
            textNode.textContent = textNode.textContent.replace(/Lilico/g, 'Flow Wallet');
          }
        });
        
        console.log(`🔧 Replaced Lilico branding in ${textNodes.length} text nodes`);
      } catch (error) {
        console.warn('Error in applyBrandingFix:', error);
      }
    };

    const replaceTextInElement = (element: Element) => {
      try {
        if (element.textContent?.includes('Lilico')) {
          // Replace text content
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT
          );

          let node;
          while (node = walker.nextNode()) {
            if (node.textContent && node.textContent.includes('Lilico')) {
              node.textContent = node.textContent.replace(/Lilico/g, 'Flow Wallet');
            }
          }

          // Replace attributes
          element.querySelectorAll('*').forEach(el => {
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
      } catch (error) {
        console.warn('Error replacing text in element:', error);
      }
    };

    // Target Dynamic Labs modal content
    const observer = new MutationObserver((mutations) => {
      try {
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
      } catch (error) {
        console.warn('Error in mutation observer:', error);
      }
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
  } catch (error) {
    console.error('Error setting up wallet branding fix:', error);
    return null;
  }
};

// Auto-start the branding fix
let observer: MutationObserver | null = null;

export const startWalletBrandingFix = () => {
  try {
    if (observer) {
      observer.disconnect();
    }
    console.log('🔧 Starting aggressive wallet branding fix...');
    observer = replaceLilicoBranding();
    
    // Also do periodic checks to catch any missed instances
    const periodicCheck = setInterval(() => {
      try {
        if (document.querySelector('[data-testid*="lilico"], [class*="lilico"], [id*="lilico"]')) {
          console.log('🔧 Found Lilico branding - applying fix...');
          if (observer) observer.disconnect();
          observer = replaceLilicoBranding();
        }
      } catch (error) {
        console.warn('Error in periodic branding check:', error);
      }
    }, 1000);

    // Clean up after 30 seconds to avoid running forever
    setTimeout(() => {
      clearInterval(periodicCheck);
    }, 30000);
  } catch (error) {
    console.error('Error starting wallet branding fix:', error);
  }
};

export const stopWalletBrandingFix = () => {
  try {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
  } catch (error) {
    console.error('Error stopping wallet branding fix:', error);
  }
};
