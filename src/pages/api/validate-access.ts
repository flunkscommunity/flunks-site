import { NextApiRequest, NextApiResponse } from 'next';

// PRIVATE: Access codes stored only on backend
const ACCESS_CODES = {
  'flunks2025': 'ADMIN',
  'FLUNKS2025': 'ADMIN', // Keep uppercase version too
  'semester0': 'BETA',
  'SEMESTER0': 'BETA', 
  'HIGHSCHOOL95': 'BETA'
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: 'Access code required' 
    });
  }

  const accessLevel = ACCESS_CODES[code as keyof typeof ACCESS_CODES];

  if (accessLevel) {
    return res.status(200).json({
      success: true,
      accessLevel,
      code: code
    });
  } else {
    return res.status(401).json({
      success: false,
      error: 'Invalid access code'
    });
  }
}
