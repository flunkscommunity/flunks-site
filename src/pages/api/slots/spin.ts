import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gameId, bet = 1.0, token } = req.body;

    if (!gameId || !token) {
      return res.status(400).json({ error: 'Missing gameId or token' });
    }

    const response = await fetch(`http://localhost:8080/game/${gameId}/spin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bet }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slot server spin error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error spinning slot:', error);
    return res.status(500).json({ 
      error: 'Failed to spin slot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
