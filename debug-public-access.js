// Debug script for public access issues
// Run this in the browser console on flunks.net to diagnose the problem

console.log('🔍 Flunks Public Access Debug');
console.log('================================');

// Check environment variables
console.log('Environment Variables:');
console.log('BUILD_MODE:', process.env.NEXT_PUBLIC_BUILD_MODE || 'undefined');
console.log('ACCESS_REQUIRED:', process.env.NEXT_PUBLIC_ACCESS_REQUIRED || 'undefined');
console.log('ORIGIN:', process.env.NEXT_PUBLIC_ORIGIN || 'undefined');

// Check session storage
console.log('\nSession Storage:');
console.log('access-granted:', sessionStorage.getItem('flunks-access-granted'));
console.log('access-level:', sessionStorage.getItem('flunks-access-level'));
console.log('access-code:', sessionStorage.getItem('flunks-access-code'));

// Check build mode functions
if (window.buildModeUtils) {
    const { getCurrentBuildMode, shouldShowAccessGate, getDefaultAccessLevel } = window.buildModeUtils;
    console.log('\nBuild Mode Utils:');
    console.log('Current Mode:', getCurrentBuildMode());
    console.log('Should Show Access Gate:', shouldShowAccessGate());
    console.log('Default Access Level:', getDefaultAccessLevel());
} else {
    console.log('\nBuild Mode Utils: Not loaded yet');
}

// Check access permissions for key apps
console.log('\nApp Permissions Check:');
const testApps = ['onlyflunks', 'my-locker', 'terminal', 'fhs-school'];
testApps.forEach(appId => {
    try {
        // This will require importing the permissions function
        console.log(`${appId}: Permission check would go here`);
    } catch (error) {
        console.log(`${appId}: Error checking permissions -`, error.message);
    }
});

// Suggest fix
console.log('\n🔧 Potential Fixes:');
console.log('1. Clear browser cache and refresh');
console.log('2. Clear session storage: sessionStorage.clear()');
console.log('3. Manually set access: sessionStorage.setItem("flunks-access-level", "COMMUNITY"); sessionStorage.setItem("flunks-access-granted", "true"); window.location.reload();');

// Auto-fix attempt
console.log('\n🚀 Attempting Auto-Fix...');
sessionStorage.setItem('flunks-access-level', 'COMMUNITY');
sessionStorage.setItem('flunks-access-granted', 'true');
sessionStorage.setItem('flunks-access-code', 'AUTO-GRANTED-PUBLIC');

// Dispatch the access update event
window.dispatchEvent(new CustomEvent('flunks-access-updated'));

console.log('✅ Auto-fix applied! Refresh the page if apps still don\'t appear.');
