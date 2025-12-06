import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { gameId, token } = req.body;

    if (!gameId || !token) {
      return res.status(400).json({ error: 'Missing gameId or token' });
    }

    const response = await fetch(`http://localhost:8080/game/${gameId}/collect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Slot server collect error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error collecting winnings:', error);
    return res.status(500).json({ 
      error: 'Failed to collect winnings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
