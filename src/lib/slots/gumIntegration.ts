/**
 * GUM Currency Integration with Slot Machines
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface GumSlotBalance {
  walletAddress: string;
  gumBalance: number;
  slotBalance: number;
  lastSync: Date;
}

/**
 * Get user's GUM balance from Supabase
 */
export async function getGumBalance(walletAddress: string): Promise<number> {
  const { data, error } = await supabase
    .from('user_gum_balances')
    .select('total_gum')
    .eq('wallet_address', walletAddress)
    .single();

  if (error) {
    console.error('Error fetching GUM balance:', error);
    return 0;
  }

  return data?.total_gum || 0;
}

/**
 * Deduct GUM for slot gambling
 */
export async function deductGumForSlots(
  walletAddress: string,
  amount: number,
  reason: string = 'Slot machine gambling'
): Promise<boolean> {
  try {
    // Check current balance
    const currentBalance = await getGumBalance(walletAddress);
    if (currentBalance < amount) {
      throw new Error('Insufficient GUM balance');
    }

    // Record transaction
    const { error: transactionError } = await supabase
      .from('gum_transactions')
      .insert({
        wallet_address: walletAddress,
        amount: -amount,
        transaction_type: 'slot_bet',
        description: reason,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      throw transactionError;
    }

    // Update balance
    const { error: balanceError } = await supabase
      .from('user_gum_balances')
      .update({
        total_gum: currentBalance - amount,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress);

    if (balanceError) {
      throw balanceError;
    }

    return true;
  } catch (error) {
    console.error('Error deducting GUM:', error);
    return false;
  }
}

/**
 * Award GUM from slot winnings
 */
export async function awardGumFromSlots(
  walletAddress: string,
  amount: number,
  reason: string = 'Slot machine win'
): Promise<boolean> {
  try {
    const currentBalance = await getGumBalance(walletAddress);

    // Record transaction
    const { error: transactionError } = await supabase
      .from('gum_transactions')
      .insert({
        wallet_address: walletAddress,
        amount: amount,
        transaction_type: 'slot_win',
        description: reason,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      throw transactionError;
    }

    // Update balance
    const { error: balanceError } = await supabase
      .from('user_gum_balances')
      .update({
        total_gum: currentBalance + amount,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress);

    if (balanceError) {
      throw balanceError;
    }

    return true;
  } catch (error) {
    console.error('Error awarding GUM:', error);
    return false;
  }
}

/**
 * Convert GUM to slot credits (1:1 ratio)
 */
export async function convertGumToSlotCredits(
  walletAddress: string,
  gumAmount: number
): Promise<boolean> {
  try {
    // Deduct GUM from user balance
    const success = await deductGumForSlots(
      walletAddress,
      gumAmount,
      `Converted ${gumAmount} GUM to slot credits`
    );

    if (!success) {
      return false;
    }

    console.log(`Converted ${gumAmount} GUM to slot credits for ${walletAddress}`);

    return true;
  } catch (error) {
    console.error('Error converting GUM to slot credits:', error);
    return false;
  }
}

/**
 * Cash out slot credits back to GUM (1:1 ratio)
 */
export async function convertSlotCreditsToGum(
  walletAddress: string,
  creditAmount: number
): Promise<boolean> {
  try {
    // Award GUM to user balance
    const success = await awardGumFromSlots(
      walletAddress,
      creditAmount,
      `Cashed out ${creditAmount} slot credits to GUM`
    );

    if (!success) {
      return false;
    }

    console.log(`Cashed out ${creditAmount} slot credits to GUM for ${walletAddress}`);

    return true;
  } catch (error) {
    console.error('Error converting slot credits to GUM:', error);
    return false;
  }
}

/**
 * Get combined balance view
 */
export async function getSlotBalanceStatus(walletAddress: string): Promise<GumSlotBalance> {
  const gumBalance = await getGumBalance(walletAddress);
  const slotBalance = 0;

  return {
    walletAddress,
    gumBalance,
    slotBalance,
    lastSync: new Date(),
  };
}

/**
 * Process a slot spin with GUM
 */
export async function processSlotSpin(
  walletAddress: string,
  betAmount: number,
  gameId: number
): Promise<{ success: boolean; winAmount?: number; error?: string }> {
  try {
    // 1. Check GUM balance
    const gumBalance = await getGumBalance(walletAddress);
    if (gumBalance < betAmount) {
      return { success: false, error: 'Insufficient GUM balance' };
    }

    // 2. Deduct bet amount from GUM
    await deductGumForSlots(walletAddress, betAmount, `Slot spin bet: ${betAmount} GUM`);

    // 3. Spin is handled by serverless spin API
    // This function is for reference - actual spins use /api/slots/spin-serverless
    
    return {
      success: true,
      winAmount: 0,
    };
  } catch (error) {
    console.error('Error processing slot spin:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
