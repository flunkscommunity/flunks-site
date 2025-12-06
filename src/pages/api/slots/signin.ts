import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username = 'player1', password = 'test123' } = req.body;

    const response = await fetch('http://localhost:8080/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Slot server signin error: ${response.status}`);
    }

    const data = await response.json();
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error signing in to slot server:', error);
    return res.status(500).json({ 
      error: 'Failed to sign in to slot server',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
