import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PokerTransactionRequest {
  wallet_address: string;
  type: 'bet' | 'win' | 'refund';
  amount: number;
  metadata?: any;
}

interface PokerTransactionResponse {
  success: boolean;
  new_balance?: number;
  amount_changed?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PokerTransactionResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { wallet_address, type, amount, metadata } = req.body as PokerTransactionRequest;

  if (!wallet_address || !type || amount === undefined) {
    return res.status(400).json({ 
      success: false, 
      error: 'Missing required fields: wallet_address, type, amount' 
    });
  }

  if (amount < 0) {
    return res.status(400).json({ success: false, error: 'Amount must be positive' });
  }

  try {
    // Get current balance from user_gum_balances table
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_gum_balances')
      .select('total_gum')
      .eq('wallet_address', wallet_address)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Error fetching balance:', balanceError);
      return res.status(500).json({ success: false, error: 'Failed to fetch balance' });
    }

    const currentBalance = balanceData?.total_gum || 0;
    let newBalance = currentBalance;
    let amountChanged = 0;

    if (type === 'bet') {
      // Deduct bet amount
      if (currentBalance < amount) {
        return res.status(400).json({ 
          success: false, 
          error: 'Insufficient GUM balance' 
        });
      }
      newBalance = currentBalance - amount;
      amountChanged = -amount;
    } else if (type === 'win' || type === 'refund') {
      // Add win/refund amount
      newBalance = currentBalance + amount;
      amountChanged = amount;
    }

    // Update balance in user_gum_balances
    const { error: updateError } = await supabase
      .from('user_gum_balances')
      .upsert({ 
        wallet_address, 
        total_gum: newBalance,
        updated_at: new Date().toISOString()
      }, { 
        onConflict: 'wallet_address' 
      });

    if (updateError) {
      console.error('Error updating balance:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update balance' });
    }

    // Record transaction in user_gum_transactions table
    const transactionData = {
      wallet_address,
      transaction_type: type === 'bet' ? 'spend' : 'earn',
      amount: amountChanged,
      source: `videopoker_${type}`,
      description: type === 'bet' 
        ? `Bet ${amount} GUM on video poker` 
        : type === 'win' 
          ? `Won ${amount} GUM on video poker${metadata?.hand ? ` (${metadata.hand})` : ''}`
          : `Refund of ${amount} GUM from video poker`,
      metadata: {
        ...metadata,
        game: 'videopoker'
      }
    };

    const { error: txError } = await supabase
      .from('user_gum_transactions')
      .insert(transactionData);

    if (txError) {
      console.warn('Warning: Failed to record transaction (balance still updated):', txError);
    }

    console.log(`🃏 Video Poker ${type}: ${wallet_address} - ${amountChanged} GUM (new balance: ${newBalance})`);

    return res.status(200).json({
      success: true,
      new_balance: newBalance,
      amount_changed: amountChanged,
    });

  } catch (error) {
    console.error('Video poker transaction error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
