// Mobile Locker Jersey Debug Script
// Run this in the browser console while on the locker page on mobile

function debugMobileJerseys() {
  console.log('🏈 Mobile Jersey Debug - Starting Analysis...');
  
  // Check viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  console.log('📱 Viewport:', { width: viewportWidth, height: viewportHeight });
  
  // Check if we're in mobile mode
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || viewportWidth < 768;
  console.log('📱 Mobile detected:', isMobile);
  
  // Find the locker system
  const lockerSystem = document.querySelector('[data-window-id="locker-system"]') || 
                      document.querySelector('.locker-section') ||
                      document.querySelector('*[style*="140vh"]');
  
  if (lockerSystem) {
    console.log('✅ Locker system element found');
  } else {
    console.log('❌ Locker system element not found');
  }
  
  // Check for jersey display elements
  const jerseyElements = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = el.getAttribute('style') || '';
    return style.includes('jersey') || 
           style.includes('700px') || 
           style.includes('840px') ||
           style.includes('backgroundImage');
  });
  
  console.log('👕 Jersey-related elements found:', jerseyElements.length);
  jerseyElements.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    const style = el.getAttribute('style') || '';
    console.log(`Jersey element ${index}:`, {
      dimensions: `${rect.width}x${rect.height}`,
      position: `${rect.left}, ${rect.top}`,
      visible: rect.width > 0 && rect.height > 0 && rect.top < viewportHeight && rect.bottom > 0,
      hasBackgroundImage: style.includes('backgroundImage'),
      backgroundImage: style.match(/backgroundImage: url\('([^']+)'\)/)?.[1] || 'none'
    });
  });
  
  // Check for image loading issues
  const jerseyImages = ['/images/jerseys/jersey-1.png', '/images/jerseys/jersey-2.png'];
  jerseyImages.forEach(imgPath => {
    const img = new Image();
    img.onload = () => console.log(`✅ Jersey image loaded: ${imgPath}`);
    img.onerror = () => console.log(`❌ Jersey image failed: ${imgPath}`);
    img.src = imgPath;
  });
  
  // Check for section navigation
  const sectionButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent || '';
    return /[123]/.test(text) && btn.style.borderRadius === '50%';
  });
  console.log('🎯 Section navigation buttons found:', sectionButtons.length);
  
  // Check current section
  const currentSectionIndicator = document.querySelector('*[style*="background: rgba(66, 153, 225, 0.8)"]');
  if (currentSectionIndicator) {
    console.log('📍 Current section indicator found');
  }
  
  // Check for jersey switching arrows
  const arrowButtons = Array.from(document.querySelectorAll('button')).filter(btn => {
    const text = btn.textContent || '';
    return text.includes('←') || text.includes('→');
  });
  console.log('⬅️➡️ Jersey switching arrows found:', arrowButtons.length);
  
  return {
    viewport: { width: viewportWidth, height: viewportHeight },
    isMobile,
    jerseyElements: jerseyElements.length,
    sectionButtons: sectionButtons.length,
    arrowButtons: arrowButtons.length
  };
}

function fixMobileJerseyDisplay() {
  console.log('🔧 Attempting to fix mobile jersey display...');
  
  // Find jersey display elements and make them mobile-responsive
  const jerseyContainers = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = el.getAttribute('style') || '';
    return style.includes('700px') && style.includes('840px');
  });
  
  jerseyContainers.forEach((container, index) => {
    console.log(`🔧 Fixing jersey container ${index}...`);
    
    // Get current style
    const currentStyle = container.getAttribute('style') || '';
    
    // Make it mobile responsive
    const mobileStyle = currentStyle
      .replace(/width:\s*'?700px'?/g, 'width: 90vw; max-width: 400px')
      .replace(/height:\s*'?840px'?/g, 'height: 60vh; max-height: 500px');
    
    container.setAttribute('style', mobileStyle);
    console.log(`✅ Updated container ${index} with mobile-responsive styles`);
  });
  
  // Force a re-render
  window.dispatchEvent(new Event('resize'));
}

function testJerseyNavigation() {
  console.log('🧪 Testing jersey navigation...');
  
  const leftArrow = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('←')
  );
  const rightArrow = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent?.includes('→')
  );
  
  if (leftArrow && rightArrow) {
    console.log('✅ Jersey navigation arrows found');
    
    // Test clicking
    console.log('🧪 Testing left arrow click...');
    leftArrow.click();
    
    setTimeout(() => {
      console.log('🧪 Testing right arrow click...');
      rightArrow.click();
    }, 1000);
    
  } else {
    console.log('❌ Jersey navigation arrows not found');
  }
}

// Run the debug
const results = debugMobileJerseys();

console.log(`
🏈 Mobile Jersey Debug Results:
- Viewport: ${results.viewport.width}x${results.viewport.height}
- Mobile: ${results.isMobile}
- Jersey Elements: ${results.jerseyElements}
- Section Buttons: ${results.sectionButtons}
- Arrow Buttons: ${results.arrowButtons}

🔧 To fix jersey display issues, run: fixMobileJerseyDisplay()
🧪 To test jersey navigation, run: testJerseyNavigation()
`);

// Export functions for manual use
window.fixMobileJerseyDisplay = fixMobileJerseyDisplay;
window.testJerseyNavigation = testJerseyNavigation;
