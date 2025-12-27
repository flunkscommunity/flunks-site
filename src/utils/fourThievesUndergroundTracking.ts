/**
 * Four Thieves Underground Access Tracking
 * Check if user has discovered the snicklefritz password
 */
export async function checkFourThievesUndergroundAccess(walletAddress: string): Promise<boolean> {
  try {
    console.log('🎰 [UNDERGROUND] Checking access via API for wallet:', walletAddress?.slice(0, 10) + '...');
    
    // Call the API endpoint to check
    const response = await fetch(`/api/check-four-thieves-underground?walletAddress=${walletAddress}`);
    
    if (!response.ok) {
      console.error('❌ [UNDERGROUND] API response not ok:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('📋 [UNDERGROUND] API response:', data);
    
    const hasAccess = data.success && data.hasAccess;
    console.log('✅ [UNDERGROUND] Final result:', hasAccess);
    
    return hasAccess;
  } catch (err) {
    console.error('💥 [UNDERGROUND] API call failed:', err);
    return false;
  }
}
