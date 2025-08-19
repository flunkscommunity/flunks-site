import { NextApiRequest, NextApiResponse } from 'next';
import { ACCESS_CODES } from '../../utils/easterEggs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { secret } = req.query;

  // Require a secret parameter to prevent casual discovery
  // But make it discoverable through source code inspection
  if (secret !== 'show_me_the_codes') {
    return res.status(200).json({
      message: '🕵️ Looking for access codes?',
      hint: 'Try adding ?secret=show_me_the_codes to this URL',
      tip: 'Or use console commands: flunks.help()',
      codes_available: ACCESS_CODES.length
    });
  }

  // Return the access codes with hints
  return res.status(200).json({
    message: '🎓 Flunks High School Access Codes',
    note: 'Use these codes in the access gate to unlock features',
    codes: ACCESS_CODES.map(code => ({
      code: code.code,
      level: code.level,
      description: code.description,
      hint: code.hint
    })),
    instructions: 'Enter any of these codes when prompted for access'
  });
}
