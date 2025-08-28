import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface WTFTrackingRequest {
  walletAddress: string
  username?: string
  command: string
}

interface WTFTrackingResponse {
  success: boolean
  message: string
  error?: string
  data?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<WTFTrackingResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false,
      message: 'Method not allowed'
    })
  }

  try {
    const { walletAddress, username, command }: WTFTrackingRequest = req.body

    if (!walletAddress || !command) {
      return res.status(400).json({ 
        success: false,
        message: 'Wallet address and command are required'
      })
    }

    // Validate command is wtf/WTF
    if (!['wtf', 'WTF'].includes(command)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid command. Must be "wtf" or "WTF"'
      })
    }

    // Insert the WTF command usage record
    const { data, error } = await supabase
      .from('wtf_command_usage')
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
      console.error('Error inserting WTF command usage:', error)
      return res.status(500).json({ 
        success: false,
        message: 'Failed to track WTF command usage'
      })
    }

    console.log('✅ WTF command tracked:', {
      wallet: walletAddress,
      username: username || 'anonymous',
      command: command,
      timestamp: new Date().toISOString()
    })

    return res.status(200).json({ 
      success: true, 
      message: 'WTF command usage tracked successfully',
      data: data[0]
    })

  } catch (error) {
    console.error('Error tracking WTF command:', error)
    return res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    })
  }
}
