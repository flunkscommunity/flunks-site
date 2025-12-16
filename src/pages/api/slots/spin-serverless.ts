import { NextApiRequest, NextApiResponse } from 'next';
import { getTotalWin } from '../../../lib/slots/flunksPaytable';

// Symbol keys matching our paytable (9 symbols, Vegas-style 38 stops)
const SYMBOL_KEYS = [
  'pencil', 'eraser', 'notebook', 'backpack', 'calculator',
  'trophy', 'diploma', 'gum_pile', 'flunks_logo'
];

// Vegas-style 38 stops per reel distribution
// Total = 38 stops, ~90% RTP (very player-friendly)
// Jackpot odds: (1/38)^3 = 1 in 54,872 per line
const SYMBOL_WEIGHTS = {
  pencil: 8,        // Common - 21% - 2x payout (CD)
  eraser: 7,        // Common - 18% - 3x payout (VHS)
  notebook: 6,      // Common - 16% - 5x payout (Walkman)
  backpack: 5,      // Uncommon - 13% - 12x payout (Pogs)
  calculator: 4,    // Uncommon - 11% - 20x payout (Talkboy)
  trophy: 3,        // Rare - 8% - 50x payout (Sun)
  diploma: 2,       // Rare - 5% - 80x payout (Hoverboard)
  gum_pile: 2,      // Epic - 5% - 200x payout (Powerglove)
  flunks_logo: 1    // Jackpot - 2.6% - 800x (1 in 54,872!)
};

// Create weighted array for random selection
const WEIGHTED_SYMBOLS: string[] = [];
Object.entries(SYMBOL_WEIGHTS).forEach(([symbol, weight]) => {
  for (let i = 0; i < weight; i++) {
    WEIGHTED_SYMBOLS.push(symbol);
  }
});

// Generate random symbol from weighted distribution
function getRandomSymbol(): string {
  return WEIGHTED_SYMBOLS[Math.floor(Math.random() * WEIGHTED_SYMBOLS.length)];
}

// Generate a 3x3 grid of symbols (3 reels, 3 rows)
function generateGrid(): string[][] {
  const grid: string[][] = [];
  
  // Generate 3 rows
  for (let row = 0; row < 3; row++) {
    const rowSymbols: string[] = [];
    for (let col = 0; col < 3; col++) {
      rowSymbols.push(getRandomSymbol());
    }
    grid.push(rowSymbols);
  }
  
  return grid;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { bet } = req.body;

    if (!bet || bet < 1 || bet > 100) {
      return res.status(400).json({ error: 'Invalid bet amount' });
    }

    // Generate random 3x5 grid
    const grid = generateGrid();
    
    // Calculate wins using our paytable
    const winResult = getTotalWin(grid, bet);
    
    // Format response to match what frontend expects
    const response = {
      screen: grid, // 3 rows x 5 columns
      gain: winResult.totalWin,
      lines: winResult.paylineWins.map(w => ({
        payline: w.payline,
        symbol: w.symbol,
        count: w.count,
        win: w.win
      })),
      scatter: winResult.scatterWin,
      bet,
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Spin error:', error);
    return res.status(500).json({ error: 'Failed to spin' });
  }
}
