// Flunks Slot Machine Paytable
// 9 symbols, 38 stops per reel, 5 paylines, ~90% RTP (player-friendly)

export const FLUNKS_SYMBOLS = {
  // Common symbols (frequent but low payout)
  pencil: { name: 'CD', tier: 'common', payouts: { 3: 4.0 } },
  eraser: { name: 'VHS', tier: 'common', payouts: { 3: 6.0 } },
  notebook: { name: 'Walkman', tier: 'common', payouts: { 3: 10.0 } },
  
  // Uncommon symbols (less frequent, better payout)
  backpack: { name: 'Pogs', tier: 'uncommon', payouts: { 3: 25.0 } },
  calculator: { name: 'Talkboy', tier: 'uncommon', payouts: { 3: 40.0 } },
  
  // Rare symbols (hard to hit, good payout)
  trophy: { name: 'Sun', tier: 'rare', payouts: { 3: 100.0 } },
  diploma: { name: 'Hoverboard', tier: 'rare', payouts: { 3: 150.0 } },
  
  // Epic symbol (very rare)
  gum_pile: { name: 'Powerglove', tier: 'epic', payouts: { 3: 350.0 } },
  
  // Jackpot symbol (ultra rare - 1 in ~55,000 per line)
  flunks_logo: { name: 'Jackpot', tier: 'jackpot', payouts: { 3: 1000.0 } }
};

// 5 classic paylines for 3-reel slot
// Each array shows the row index [0=top, 1=middle, 2=bottom] for each of 3 reels
export const PAYLINES = [
  [1, 1, 1],  // Line 1: Middle row (straight)
  [0, 0, 0],  // Line 2: Top row (straight)
  [2, 2, 2],  // Line 3: Bottom row (straight)
  [0, 1, 2],  // Line 4: Diagonal down
  [2, 1, 0],  // Line 5: Diagonal up
];

// Calculate win for a specific payline
export function calculatePaylineWin(
  symbols: string[], // 3 symbols along the payline
  bet: number,
  symbolKey: string
): { win: number; count: number } | null {
  const symbol = FLUNKS_SYMBOLS[symbolKey as keyof typeof FLUNKS_SYMBOLS];
  if (!symbol || symbol.tier === 'scatter') return null;

  // All 3 must match for 3-reel slot
  const firstSymbol = symbols[0];
  const allMatch = symbols.every(s => s === firstSymbol);
  
  if (!allMatch) return null;

  // Use the 3-of-a-kind payout
  const multiplier = symbol.payouts[3];
  if (!multiplier) return null;

  return {
    win: bet * multiplier,
    count: 3
  };
}

// Evaluate all 10 paylines
export function evaluateAllPaylines(
  grid: string[][], // 3x5 grid of symbol keys
  bet: number
): Array<{
  payline: number;
  symbol: string;
  count: number;
  win: number;
  path: Array<[number, number]>; // [row, col] coordinates
}> {
  const wins = [];

  for (let i = 0; i < PAYLINES.length; i++) {
    const payline = PAYLINES[i];
    
    // Extract symbols along this payline
    const symbols = payline.map((row, col) => grid[row][col]);
    const firstSymbol = symbols[0];
    
    const result = calculatePaylineWin(symbols, bet, firstSymbol);
    
    if (result) {
      // Build path coordinates
      const path: Array<[number, number]> = [];
      for (let j = 0; j < result.count; j++) {
        path.push([payline[j], j]);
      }
      
      wins.push({
        payline: i + 1,
        symbol: firstSymbol,
        count: result.count,
        win: result.win,
        path
      });
    }
  }

  return wins;
}

// Check for scatter wins (3+ anywhere awards free spins)
export function checkScatters(grid: string[][]): {
  count: number;
  positions: Array<[number, number]>;
  freeSpins: number;
} | null {
  const positions: Array<[number, number]> = [];
  
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 5; col++) {
      if (grid[row][col] === 'scatter_keyhole') {
        positions.push([row, col]);
      }
    }
  }

  const count = positions.length;
  
  if (count >= 3) {
    // Award free spins based on count
    let freeSpins = 10;
    if (count === 4) freeSpins = 12;
    if (count === 5) freeSpins = 15;
    
    return { count, positions, freeSpins };
  }

  return null;
}

// Get total win from all paylines
export function getTotalWin(
  grid: string[][],
  bet: number
): {
  totalWin: number;
  paylineWins: ReturnType<typeof evaluateAllPaylines>;
  scatterWin: ReturnType<typeof checkScatters>;
} {
  const paylineWins = evaluateAllPaylines(grid, bet);
  const scatterWin = checkScatters(grid);
  
  const totalWin = paylineWins.reduce((sum, win) => sum + win.win, 0);
  
  return {
    totalWin,
    paylineWins,
    scatterWin
  };
}
