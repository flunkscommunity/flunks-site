/**
 * Blackjack Transaction API
 * Handles GUM transactions for blackjack games
 * Same pattern as slots and video poker APIs
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Blackjack API: Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

interface TransactionRequest {
  wallet_address: string;
  type: 'bet' | 'win' | 'refund';
  amount: number;
  metadata?: any;
}

interface TransactionResponse {
  success: boolean;
  new_balance?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TransactionResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { wallet_address, type, amount, metadata } = req.body as TransactionRequest;

  if (!wallet_address || !type || amount === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (!['bet', 'win', 'refund'].includes(type)) {
    return res.status(400).json({ success: false, error: 'Invalid transaction type' });
  }

  try {
    if (!supabase) {
      console.error('❌ Blackjack API: Supabase client not initialized');
      return res.status(500).json({ success: false, error: 'Database not configured' });
    }

    // Get current balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_gum_balances')
      .select('total_gum')
      .eq('wallet_address', wallet_address)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Error fetching balance:', balanceError);
      return res.status(500).json({ success: false, error: 'Failed to fetch balance' });
    }

    let currentBalance = balanceData?.total_gum || 0;

    // Calculate new balance based on transaction type
    let newBalance: number;
    let transactionAmount: number;

    switch (type) {
      case 'bet':
        if (currentBalance < amount) {
          return res.status(400).json({ success: false, error: 'Insufficient GUM balance' });
        }
        newBalance = currentBalance - amount;
        transactionAmount = -amount;
        break;

      case 'win':
        newBalance = currentBalance + amount;
        transactionAmount = amount;
        break;

      case 'refund':
        newBalance = currentBalance + amount;
        transactionAmount = amount;
        break;

      default:
        return res.status(400).json({ success: false, error: 'Invalid transaction type' });
    }

    // Update balance in database
    const { error: updateError } = await supabase
      .from('user_gum_balances')
      .upsert(
        { wallet_address, total_gum: newBalance, updated_at: new Date().toISOString() },
        { onConflict: 'wallet_address' }
      );

    if (updateError) {
      console.error('Error updating balance:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update balance' });
    }

    // Log the transaction
    const { error: logError } = await supabase
      .from('user_gum_transactions')
      .insert({
        wallet_address,
        amount: transactionAmount,
        transaction_type: `blackjack_${type}`,
        metadata: {
          game: 'blackjack',
          type,
          ...metadata,
        },
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Error logging transaction:', logError);
      // Don't fail the request, balance was already updated
    }

    console.log(`🃏 Blackjack ${type}: ${wallet_address} | Amount: ${transactionAmount} | New balance: ${newBalance}`);

    return res.status(200).json({
      success: true,
      new_balance: newBalance,
    });

  } catch (error) {
    console.error('Transaction error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
