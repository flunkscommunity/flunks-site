// Next.js API route for XYZ wallet integration
import type { NextApiRequest, NextApiResponse } from 'next';

interface XYZWalletConnectRequest {
  dynamicUserId: string;
  dynamicWalletAddress?: string;
  xyzWalletParams?: Record<string, any>;
}

interface XYZWalletResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<XYZWalletResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { dynamicUserId, dynamicWalletAddress, xyzWalletParams }: XYZWalletConnectRequest = req.body;

    if (!dynamicUserId) {
      return res.status(400).json({ success: false, error: 'Dynamic user ID is required' });
    }

    // Get Dynamic API token from environment
    const dynamicApiToken = process.env.DYNAMIC_API_TOKEN;
    const dynamicEnvironmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENV_ID;
    const xyzWalletApiEndpoint = process.env.XYZ_WALLET_API_ENDPOINT;
    const xyzWalletApiKey = process.env.XYZ_WALLET_API_KEY;

    if (!dynamicApiToken || !dynamicEnvironmentId) {
      return res.status(500).json({ success: false, error: 'Dynamic API credentials not configured' });
    }

    // 1. Get user's existing wallets from Dynamic
    const dynamicWalletsResponse = await fetch(
      `https://app.dynamicauth.com/api/v0/environments/${dynamicEnvironmentId}/users/${dynamicUserId}/wallets`,
      {
        headers: {
          'Authorization': `Bearer ${dynamicApiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const dynamicWallets = await dynamicWalletsResponse.json();

    // 2. Connect to your XYZ wallet API
    const xyzWalletResponse = await fetch(`${xyzWalletApiEndpoint}/connect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${xyzWalletApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: dynamicUserId,
        existingWallets: dynamicWallets,
        dynamicWalletAddress,
        ...xyzWalletParams,
      }),
    });

    const xyzWalletData = await xyzWalletResponse.json();

    if (!xyzWalletData.success) {
      return res.status(400).json({ 
        success: false, 
        error: xyzWalletData.error || 'XYZ wallet connection failed' 
      });
    }

    // 3. Optionally store the connection in your database
    // Example: await db.xyzWalletConnections.create({ dynamicUserId, xyzWalletData: xyzWalletData.data });

    // 4. Return success with combined data
    return res.status(200).json({
      success: true,
      data: {
        dynamicUserId,
        dynamicWallets: dynamicWallets,
        xyzWalletConnection: xyzWalletData.data,
        connectedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('XYZ wallet connection error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
