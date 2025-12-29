/**
 * pokersolver - TypeScript port of the battle-tested poker hand evaluator
 * Original: https://github.com/goldfire/pokersolver (MIT License)
 * Adapted from: https://github.com/keyeh/videopoker
 * 
 * This is a comprehensive poker hand evaluation library that handles:
 * - All standard poker hands (Royal Flush through High Card)
 * - Proper card ranking and comparison
 * - Jacks or Better video poker rules
 */

const VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

export class Card {
  value: string;
  suit: string;
  rank: number;
  wildValue: string;

  constructor(str: string) {
    this.value = str.substr(0, 1);
    this.suit = str.substr(1, 1).toLowerCase();
    this.rank = VALUES.indexOf(this.value);
    this.wildValue = str.substr(0, 1);
  }

  toString(): string {
    return this.wildValue.replace('T', '10') + this.suit;
  }

  static sort(a: Card, b: Card): number {
    if (a.rank > b.rank) return -1;
    if (a.rank < b.rank) return 1;
    return 0;
  }
}

export interface HandResult {
  name: string;
  descr: string;
  rank: number;
  cards: Card[];
  isPossible: boolean;
}

export class Hand {
  cardPool: Card[];
  cards: Card[];
  suits: { [key: string]: Card[] };
  values: (Card[] | undefined)[];
  wilds: Card[];
  name: string;
  descr: string;
  rank: number;
  isPossible: boolean;

  constructor(cards: (string | Card)[], name: string = '') {
    this.cardPool = [];
    this.cards = [];
    this.suits = {};
    this.values = [];
    this.wilds = [];
    this.name = name;
    this.descr = '';
    this.rank = 0;
    this.isPossible = false;

    // Set up the pool of cards
    this.cardPool = cards.map(c => typeof c === 'string' ? new Card(c) : c);
    this.cardPool = this.cardPool.sort(Card.sort);

    // Create the arrays of suits and values
    for (const card of this.cardPool) {
      if (!this.suits[card.suit]) {
        this.suits[card.suit] = [];
      }
      if (!this.values[card.rank]) {
        this.values[card.rank] = [];
      }
      this.suits[card.suit].push(card);
      this.values[card.rank]!.push(card);
    }

    this.values.reverse();
  }

  /**
   * Solve and return the best hand
   */
  static solve(cards: string[]): HandResult {
    const hand = new Hand(cards);
    
    // Check hands from highest to lowest
    const checks: [() => boolean, string, number][] = [
      [() => hand.hasRoyalFlush(), 'Royal Flush', 10],
      [() => hand.hasStraightFlush(), 'Straight Flush', 9],
      [() => hand.hasFourOfAKind(), 'Four of a Kind', 8],
      [() => hand.hasFullHouse(), 'Full House', 7],
      [() => hand.hasFlush(), 'Flush', 6],
      [() => hand.hasStraight(), 'Straight', 5],
      [() => hand.hasThreeOfAKind(), 'Three of a Kind', 4],
      [() => hand.hasTwoPair(), 'Two Pair', 3],
      [() => hand.hasPair(), 'Pair', 2],
      [() => true, 'High Card', 1],
    ];

    for (const [check, name, rank] of checks) {
      if (check()) {
        hand.name = name;
        hand.rank = rank;
        hand.isPossible = true;
        
        // Build description
        if (name === 'Royal Flush') {
          hand.descr = 'Royal Flush';
        } else if (name === 'Pair') {
          const pairRank = hand.getPairRank();
          hand.descr = `Pair, ${hand.getRankName(pairRank)}'s`;
        } else {
          hand.descr = name;
        }
        
        break;
      }
    }

    return {
      name: hand.name,
      descr: hand.descr,
      rank: hand.rank,
      cards: hand.cards.length ? hand.cards : hand.cardPool.slice(0, 5),
      isPossible: hand.isPossible,
    };
  }

  getRankName(rank: number): string {
    // Map index from VALUES array to display name
    // VALUES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A']
    // Index:     0    1    2    3    4    5    6    7    8    9   10   11   12   13
    const names: { [key: number]: string } = {
      13: 'A', 12: 'K', 11: 'Q', 10: 'J', 9: 'T',
      8: '9', 7: '8', 6: '7', 5: '6', 4: '5',
      3: '4', 2: '3', 1: '2', 0: '1'
    };
    return names[rank] || String(rank);
  }

  getNumCardsByRank(rankIndex: number): number {
    const cards = this.values[rankIndex];
    return cards ? cards.length : 0;
  }

  getPairRank(): number {
    for (let i = 0; i < this.values.length; i++) {
      if (this.getNumCardsByRank(i) === 2) {
        const cards = this.values[i];
        if (cards && cards.length > 0) {
          return cards[0].rank;
        }
      }
    }
    return 0;
  }

  hasRoyalFlush(): boolean {
    if (!this.hasStraightFlush()) return false;
    // Check if it's 10-J-Q-K-A
    const sorted = [...this.cardPool].sort((a, b) => a.rank - b.rank);
    return sorted[0].rank === VALUES.indexOf('T') && sorted[4].rank === VALUES.indexOf('A');
  }

  hasStraightFlush(): boolean {
    if (!this.hasFlush()) return false;
    
    // Get the flush suit
    let flushSuit = '';
    for (const suit in this.suits) {
      if (this.suits[suit].length >= 5) {
        flushSuit = suit;
        break;
      }
    }
    
    if (!flushSuit) return false;
    
    // Check if the flush cards form a straight
    const flushCards = this.suits[flushSuit].sort((a, b) => b.rank - a.rank);
    return this.checkStraight(flushCards);
  }

  hasFourOfAKind(): boolean {
    for (let i = 0; i < this.values.length; i++) {
      if (this.getNumCardsByRank(i) === 4) {
        this.cards = this.values[i] || [];
        return true;
      }
    }
    return false;
  }

  hasFullHouse(): boolean {
    let hasThree = false;
    let hasTwo = false;
    
    for (let i = 0; i < this.values.length; i++) {
      const count = this.getNumCardsByRank(i);
      if (count === 3) hasThree = true;
      else if (count === 2) hasTwo = true;
    }
    
    return hasThree && hasTwo;
  }

  hasFlush(): boolean {
    for (const suit in this.suits) {
      if (this.suits[suit].length >= 5) {
        this.cards = this.suits[suit].slice(0, 5);
        return true;
      }
    }
    return false;
  }

  hasStraight(): boolean {
    return this.checkStraight(this.cardPool);
  }

  checkStraight(cards: Card[]): boolean {
    if (cards.length < 5) return false;
    
    const sorted = [...cards].sort((a, b) => b.rank - a.rank);
    const uniqueRanks = [...new Set(sorted.map(c => c.rank))].sort((a, b) => b - a);
    
    // Check for regular straight
    for (let i = 0; i <= uniqueRanks.length - 5; i++) {
      let isSequential = true;
      for (let j = 0; j < 4; j++) {
        if (uniqueRanks[i + j] - uniqueRanks[i + j + 1] !== 1) {
          isSequential = false;
          break;
        }
      }
      if (isSequential) {
        this.cards = sorted.filter(c => 
          c.rank >= uniqueRanks[i + 4] && c.rank <= uniqueRanks[i]
        ).slice(0, 5);
        return true;
      }
    }
    
    // Check for wheel (A-2-3-4-5)
    const hasAce = uniqueRanks.includes(VALUES.indexOf('A'));
    const hasTwo = uniqueRanks.includes(VALUES.indexOf('2'));
    const hasThree = uniqueRanks.includes(VALUES.indexOf('3'));
    const hasFour = uniqueRanks.includes(VALUES.indexOf('4'));
    const hasFive = uniqueRanks.includes(VALUES.indexOf('5'));
    
    if (hasAce && hasTwo && hasThree && hasFour && hasFive) {
      return true;
    }
    
    return false;
  }

  hasThreeOfAKind(): boolean {
    for (let i = 0; i < this.values.length; i++) {
      if (this.getNumCardsByRank(i) === 3) {
        this.cards = this.values[i] || [];
        return true;
      }
    }
    return false;
  }

  hasTwoPair(): boolean {
    let pairs = 0;
    for (let i = 0; i < this.values.length; i++) {
      if (this.getNumCardsByRank(i) === 2) {
        pairs++;
      }
    }
    return pairs >= 2;
  }

  hasPair(): boolean {
    for (let i = 0; i < this.values.length; i++) {
      if (this.getNumCardsByRank(i) === 2) {
        this.cards = this.values[i] || [];
        return true;
      }
    }
    return false;
  }
}

// Card list for a standard 52-card deck
export const CARD_LIST: string[] = [
  'Ad', '2d', '3d', '4d', '5d', '6d', '7d', '8d', '9d', 'Td', 'Jd', 'Qd', 'Kd',
  'Ah', '2h', '3h', '4h', '5h', '6h', '7h', '8h', '9h', 'Th', 'Jh', 'Qh', 'Kh',
  'Ac', '2c', '3c', '4c', '5c', '6c', '7c', '8c', '9c', 'Tc', 'Jc', 'Qc', 'Kc',
  'As', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', 'Ts', 'Js', 'Qs', 'Ks',
];

// Pay table data for 9-6 Jacks or Better
export const PAY_TABLE_DATA = [
  { display: 'ROYAL FLUSH', pokersolver: 'Royal Flush', payouts: [250, 500, 750, 1000, 4000] },
  { display: 'STRAIGHT FLUSH', pokersolver: 'Straight Flush', payouts: [50, 100, 150, 200, 250] },
  { display: '4 OF A KIND', pokersolver: 'Four of a Kind', payouts: [25, 50, 75, 100, 125] },
  { display: 'FULL HOUSE', pokersolver: 'Full House', payouts: [9, 18, 27, 36, 45] },
  { display: 'FLUSH', pokersolver: 'Flush', payouts: [6, 12, 18, 24, 30] },
  { display: 'STRAIGHT', pokersolver: 'Straight', payouts: [4, 8, 12, 16, 20] },
  { display: '3 OF A KIND', pokersolver: 'Three of a Kind', payouts: [3, 6, 9, 12, 15] },
  { display: '2 PAIR', pokersolver: 'Two Pair', payouts: [2, 4, 6, 8, 10] },
  { display: 'JACKS OR BETTER', pokersolver: 'Jacks or Better', payouts: [1, 2, 3, 4, 5] },
];

/**
 * Evaluate a video poker hand and return the payout
 */
export function evaluateVideoPokerHand(hand: string[]): { name: string; win: number; betMultiplier: number } {
  const solved = Hand.solve(hand);
  
  // Check each payout level
  for (const row of PAY_TABLE_DATA) {
    if (row.pokersolver === solved.name) {
      return { 
        name: solved.name, 
        win: row.payouts[4], // Return max bet payout as base multiplier
        betMultiplier: row.payouts[0] // Base multiplier
      };
    }
  }
  
  // Special case: Check for Jacks or Better (pair of J, Q, K, or A)
  if (solved.name === 'Pair') {
    // Get the pair rank directly from the hand
    const handObj = new Hand(hand);
    const pairRank = handObj.getPairRank();
    
    // J=10, Q=11, K=12, A=13 in VALUES array
    const isJacksOrBetter = pairRank >= 10; // J, Q, K, or A
    
    console.log('🃏 Pair check - pairRank:', pairRank, 'isJacksOrBetter:', isJacksOrBetter);
    
    if (isJacksOrBetter) {
      const jacksBetter = PAY_TABLE_DATA.find(r => r.pokersolver === 'Jacks or Better');
      if (jacksBetter) {
        return { 
          name: 'Jacks or Better', 
          win: jacksBetter.payouts[4],
          betMultiplier: jacksBetter.payouts[0]
        };
      }
    }
  }
  
  return { name: '', win: 0, betMultiplier: 0 };
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleDeck<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get card display info (value and suit symbol)
 */
export function getCardDisplay(cardCode: string): { value: string; suit: string; color: string } {
  const value = cardCode.charAt(0);
  const suitCode = cardCode.charAt(1).toLowerCase();
  
  const valueDisplay = value === 'T' ? '10' : value;
  
  const suitMap: { [key: string]: { symbol: string; color: string } } = {
    's': { symbol: '♠', color: '#000000' },
    'h': { symbol: '♥', color: '#ff0000' },
    'd': { symbol: '♦', color: '#ff0000' },
    'c': { symbol: '♣', color: '#000000' },
  };
  
  const suitInfo = suitMap[suitCode] || { symbol: '?', color: '#000' };
  
  return {
    value: valueDisplay,
    suit: suitInfo.symbol,
    color: suitInfo.color,
  };
}
