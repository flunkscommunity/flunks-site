// Quick script to reset access state - run this in browser console
console.log('Resetting access state...');
sessionStorage.removeItem('flunks-access-granted');
localStorage.removeItem('flunks-access-granted');
console.log('Access state reset - refresh the page');
// Also clear any wallet connection state that might auto-bypass
localStorage.removeItem('dynamic_authentication_token');
sessionStorage.removeItem('dynamic_authentication_token');
window.location.reload();
