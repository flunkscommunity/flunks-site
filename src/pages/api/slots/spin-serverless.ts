import { NextApiRequest, NextApiResponse } from 'next';
import { getTotalWin } from '../../../lib/slots/flunksPaytable';

// Symbol keys matching our paytable
const SYMBOL_KEYS = [
  'pencil', 'notebook', 'backpack', 'flunk_basic', 'diploma', 
  'trophy', 'flunk_evolved', 'gum_pile', 'golden_ticket', 
  'wild_flunk', 'flunks_logo', 'scatter_keyhole'
];

// Weighted symbol distribution (lower tier symbols appear more often)
const SYMBOL_WEIGHTS = {
  pencil: 20,           // Most common
  notebook: 18,
  backpack: 16,
  flunk_basic: 14,
  diploma: 12,
  trophy: 10,
  flunk_evolved: 8,
  gum_pile: 6,
  golden_ticket: 5,
  wild_flunk: 3,
  flunks_logo: 2,      // Rarest (80x payout!)
  scatter_keyhole: 4
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

// Generate a 3x5 grid of symbols
function generateGrid(): string[][] {
  const grid: string[][] = [];
  
  // Generate 3 rows
  for (let row = 0; row < 3; row++) {
    const rowSymbols: string[] = [];
    for (let col = 0; col < 5; col++) {
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
