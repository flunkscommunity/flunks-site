import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface FettyWapTrackingRequest {
  walletAddress: string
  username?: string
  command: string
}

interface FettyWapTrackingResponse {
  success: boolean
  message: string
  error?: string
  data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<FettyWapTrackingResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { walletAddress, username, command }: FettyWapTrackingRequest = req.body

    if (!walletAddress || !command) {
      return res.status(400).json({ 
        success: false,
        message: 'Wallet address and command are required'
      })
    }

    // Insert the Fetty Wap command usage record
    const { data, error } = await supabase
      .from('fetty_wap_usage')
      .insert([
        {
          wallet_address: walletAddress,
          username: username || null,
          command_used: command,
          executed_at: new Date().toISOString(),
        }
      ])
      .select()

    if (error) {
      console.error('Error inserting Fetty Wap command usage:', error)
      return res.status(500).json({ 
        success: false,
        message: 'Failed to track Fetty Wap command usage'
      })
    }

    console.log('✅ Fetty Wap command tracked:', {
      wallet: walletAddress,
      username: username || 'anonymous',
      command: command,
      timestamp: new Date().toISOString()
    })

    return res.status(200).json({ 
      success: true, 
      message: 'Fetty Wap command usage tracked successfully',
      data: data[0]
    })

  } catch (error) {
    console.error('Error tracking Fetty Wap command:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    })
  }
}
