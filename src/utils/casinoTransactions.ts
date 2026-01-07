/**
 * Casino Transaction Utilities
 * Direct Supabase calls for mobile compatibility (bypasses CORS issues with API routes)
 */

import { supabase } from '../lib/supabase';
import { getApiUrl } from './apiBaseUrl';

/**
 * Normalize a Flow address to standard format (0x + 16 hex chars lowercase)
 */
function normalizeFlowAddress(address: string): string {
  if (!address) return '';
  
  let normalized = address.trim().toLowerCase();
  
  // Handle CAIP-10 format (e.g., "flow:mainnet:0x123...")
  if (normalized.includes(':')) {
    const parts = normalized.split(':');
    normalized = parts[parts.length - 1];
  }
  
  // Ensure 0x prefix
  if (!normalized.startsWith('0x')) {
    normalized = '0x' + normalized;
  }
  
  return normalized;
}

export interface CasinoTransactionResult {
  success: boolean;
  new_balance?: number;
  amount_changed?: number;
  error?: string;
}

type TransactionType = 'bet' | 'win' | 'refund';
type GameType = 'slots' | 'blackjack' | 'videopoker';

/**
 * Process a casino transaction (bet, win, or refund)
 * Uses direct Supabase for mobile compatibility, falls back to API
 */
export async function processCasinoTransaction(
  walletAddress: string,
  type: TransactionType,
  amount: number,
  game: GameType,
  metadata?: any
): Promise<CasinoTransactionResult> {
  const normalizedAddress = normalizeFlowAddress(walletAddress);
  
  console.log(`🎰 [CASINO] Processing ${game} ${type}: ${amount} GUM for ${normalizedAddress}`);
  
  // Try direct Supabase first (works on mobile)
  try {
    const result = await processViaSupabase(normalizedAddress, type, amount, game, metadata);
    if (result.success) {
      console.log(`🎰 [CASINO] ✅ Direct Supabase success: balance = ${result.new_balance}`);
      return result;
    }
    console.log(`🎰 [CASINO] ⚠️ Direct Supabase failed:`, result.error);
  } catch (err) {
    console.log(`🎰 [CASINO] ⚠️ Direct Supabase error:`, err);
  }
  
  // Fallback to API (works on web)
  try {
    const result = await processViaAPI(normalizedAddress, type, amount, game, metadata);
    if (result.success) {
      console.log(`🎰 [CASINO] ✅ API success: balance = ${result.new_balance}`);
    }
    return result;
  } catch (err) {
    console.error(`🎰 [CASINO] ❌ API error:`, err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Transaction failed'
    };
  }
}

/**
 * Process transaction via direct Supabase
 */
async function processViaSupabase(
  walletAddress: string,
  type: TransactionType,
  amount: number,
  game: GameType,
  metadata?: any
): Promise<CasinoTransactionResult> {
  if (!supabase) {
    return { success: false, error: 'Supabase not available' };
  }
  
  if (amount < 0) {
    return { success: false, error: 'Amount must be positive' };
  }
  
  // Get current balance
  const { data: balanceData, error: balanceError } = await supabase
    .from('user_gum_balances')
    .select('total_gum')
    .eq('wallet_address', walletAddress)
    .single();
  
  if (balanceError && balanceError.code !== 'PGRST116') {
    console.error('🎰 [CASINO] Error fetching balance:', balanceError);
    return { success: false, error: 'Failed to fetch balance' };
  }
  
  const currentBalance = balanceData?.total_gum || 0;
  let newBalance = currentBalance;
  let amountChanged = 0;
  
  if (type === 'bet') {
    // Deduct bet amount
    if (currentBalance < amount) {
      return { success: false, error: 'Insufficient GUM balance' };
    }
    newBalance = currentBalance - amount;
    amountChanged = -amount;
  } else if (type === 'win' || type === 'refund') {
    // Add win/refund amount
    newBalance = currentBalance + amount;
    amountChanged = amount;
  }
  
  // Update balance
  const { error: updateError } = await supabase
    .from('user_gum_balances')
    .upsert({ 
      wallet_address: walletAddress, 
      total_gum: newBalance,
      updated_at: new Date().toISOString()
    }, { 
      onConflict: 'wallet_address' 
    });
  
  if (updateError) {
    console.error('🎰 [CASINO] Error updating balance:', updateError);
    return { success: false, error: 'Failed to update balance' };
  }
  
  // Record transaction
  const transactionData = {
    wallet_address: walletAddress,
    transaction_type: type === 'bet' ? 'spend' : 'earn',
    amount: amountChanged,
    source: `${game}_${type}`,
    description: type === 'bet' 
      ? `${capitalizeFirst(game)} bet`
      : type === 'win'
        ? `${capitalizeFirst(game)} win`
        : `${capitalizeFirst(game)} refund`,
    metadata: metadata || null,
    created_at: new Date().toISOString()
  };
  
  const { error: transactionError } = await supabase
    .from('user_gum_transactions')
    .insert(transactionData);
  
  if (transactionError) {
    console.warn('🎰 [CASINO] Warning: Failed to record transaction:', transactionError);
    // Don't fail the whole operation if just the logging fails
  }
  
  return {
    success: true,
    new_balance: newBalance,
    amount_changed: amountChanged
  };
}

/**
 * Process transaction via API (fallback)
 */
async function processViaAPI(
  walletAddress: string,
  type: TransactionType,
  amount: number,
  game: GameType,
  metadata?: any
): Promise<CasinoTransactionResult> {
  const endpoint = game === 'slots' 
    ? '/api/slots/transaction' 
    : game === 'blackjack'
      ? '/api/blackjack/transaction'
      : '/api/videopoker/transaction';
  
  const url = getApiUrl(endpoint);
  console.log(`🎰 [CASINO] API call to: ${url}`);
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wallet_address: walletAddress,
      type,
      amount,
      metadata
    })
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API error ${response.status}: ${text}`);
  }
  
  return await response.json();
}

/**
 * Get current GUM balance directly from Supabase
 */
export async function getCasinoBalance(walletAddress: string): Promise<number> {
  const normalizedAddress = normalizeFlowAddress(walletAddress);
  
  if (!supabase) {
    console.warn('🎰 [CASINO] Supabase not available for balance check');
    return 0;
  }
  
  const { data, error } = await supabase
    .from('user_gum_balances')
    .select('total_gum')
    .eq('wallet_address', normalizedAddress)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('🎰 [CASINO] Error fetching balance:', error);
    return 0;
  }
  
  return data?.total_gum || 0;
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
