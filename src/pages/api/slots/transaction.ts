import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SlotTransactionRequest {
  wallet_address: string;
  type: 'bet' | 'win' | 'refund';
  amount: number;
  metadata?: any;
}

interface SlotTransactionResponse {
  success: boolean;
  new_balance?: number;
  amount_changed?: number;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SlotTransactionResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { wallet_address, type, amount, metadata } = req.body as SlotTransactionRequest;

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
    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('gum_balance')
      .eq('wallet_address', wallet_address)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const currentBalance = profile?.gum_balance || 0;
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

    // Update balance
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ gum_balance: newBalance })
      .eq('wallet_address', wallet_address);

    if (updateError) {
      console.error('Error updating balance:', updateError);
      return res.status(500).json({ success: false, error: 'Failed to update balance' });
    }

    // Record transaction in gum_transactions table
    const transactionData = {
      wallet_address,
      source: `slots_${type}`,
      amount: amountChanged,
      balance_after: newBalance,
      metadata: {
        ...metadata,
        transaction_type: type,
        game: 'slots'
      },
      created_at: new Date().toISOString()
    };

    const { error: txError } = await supabase
      .from('gum_transactions')
      .insert(transactionData);

    if (txError) {
      console.warn('Warning: Failed to record transaction (balance still updated):', txError);
    }

    console.log(`🎰 Slots ${type}: ${wallet_address} - ${amountChanged} GUM (new balance: ${newBalance})`);

    return res.status(200).json({
      success: true,
      new_balance: newBalance,
      amount_changed: amountChanged
    });

  } catch (error) {
    console.error('Error in slots transaction:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}
