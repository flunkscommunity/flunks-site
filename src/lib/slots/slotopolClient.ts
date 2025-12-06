/**
 * Slotopol Slot Machine Server API Client
 * Connects Flunks to the slot game engine
 */

interface SlotopolConfig {
  baseURL: string;
  clubId: number;
}

interface GameInfo {
  gid: number;
  alias: string;
  bet: number;
  sel: number;
  screen: number[][];
  wallet: number;
}

interface SpinResult {
  sid: number; // spin ID
  screen: number[][]; // reel symbols after spin
  wins: Array<{
    line: number;
    sym: number;
    mul: number;
    pay: number;
  }>;
  fs: number; // free spins remaining
  gain: number; // total gain from spin
  wallet: number; // updated wallet balance
}

interface GameAlias {
  prov: string; // provider
  name: string; // game name
  year?: number;
}

interface AlgorithmInfo {
  aliases: GameAlias[];
  gt: number; // game type
  gp: number; // game properties
  sx: number; // screen x (reels)
  sy: number; // screen y (rows)
  sn: number; // symbol count
  ln: number; // line count
  rtp: number[]; // available RTPs
}

class SlotopolClient {
  private config: SlotopolConfig;
  private tokenCache: Map<string, string> = new Map();

  constructor(config: Partial<SlotopolConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || process.env.NEXT_PUBLIC_SLOTS_API_URL || 'http://localhost:8080',
      clubId: config.clubId || 1,
    };
  }

  /**
   * Sign in and get JWT token for user
   */
  async signIn(walletAddress: string, secret?: string): Promise<string> {
    // Check cache first
    if (this.tokenCache.has(walletAddress)) {
      return this.tokenCache.get(walletAddress)!;
    }

    // Auto-generate secret from wallet address if not provided
    const userSecret = secret || this.generateSecret(walletAddress);

    try {
      const response = await fetch(`${this.config.baseURL}/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `${walletAddress}@flunks.net`,
          secret: userSecret,
        }),
      });

      if (!response.ok) {
        // User doesn't exist, sign them up
        if (response.status === 401 || response.status === 404) {
          await this.signUp(walletAddress, userSecret);
          return this.signIn(walletAddress, secret);
        }
        throw new Error(`Sign in failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.tokenCache.set(walletAddress, data.access);
      return data.access;
    } catch (error) {
      console.error('Slotopol sign in error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  private async signUp(walletAddress: string, secret: string): Promise<void> {
    const response = await fetch(`${this.config.baseURL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `${walletAddress}@flunks.net`,
        secret,
        name: walletAddress.slice(0, 8),
      }),
    });

    if (!response.ok) {
      throw new Error(`Sign up failed: ${response.statusText}`);
    }
  }

  /**
   * Generate deterministic secret from wallet address
   */
  private generateSecret(walletAddress: string): string {
    // Simple hash - in production use proper crypto
    return walletAddress.slice(2, 8).toUpperCase();
  }

  /**
   * Get list of all available games
   */
  async getGameList(filters?: string): Promise<AlgorithmInfo[]> {
    const url = filters
      ? `${this.config.baseURL}/game/list?inc=${encodeURIComponent(filters)}`
      : `${this.config.baseURL}/game/algs`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch games: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a new game instance
   */
  async createGame(
    walletAddress: string,
    gameAlias: string,
    initialBet: number = 1
  ): Promise<GameInfo> {
    const token = await this.signIn(walletAddress);

    const response = await fetch(`${this.config.baseURL}/game/new`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cid: this.config.clubId,
        uid: walletAddress,
        alias: gameAlias,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create game: ${response.statusText}`);
    }

    const gameInfo = await response.json();

    // Set initial bet if specified
    if (initialBet !== 1) {
      await this.setBet(walletAddress, gameInfo.gid, initialBet);
    }

    return gameInfo;
  }

  /**
   * Get game info
   */
  async getGameInfo(walletAddress: string, gid: number): Promise<GameInfo> {
    const token = await this.signIn(walletAddress);

    const response = await fetch(`${this.config.baseURL}/game/info`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gid }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get game info: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Set bet amount
   */
  async setBet(walletAddress: string, gid: number, bet: number): Promise<void> {
    const token = await this.signIn(walletAddress);

    const response = await fetch(`${this.config.baseURL}/slot/bet/set`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gid, bet }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set bet: ${response.statusText}`);
    }
  }

  /**
   * Set selected paylines
   */
  async setLines(walletAddress: string, gid: number, sel: number): Promise<void> {
    const token = await this.signIn(walletAddress);

    const response = await fetch(`${this.config.baseURL}/slot/sel/set`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gid, sel }),
    });

    if (!response.ok) {
      throw new Error(`Failed to set lines: ${response.statusText}`);
    }
  }

  /**
   * Spin the reels!
   */
  async spin(
    walletAddress: string,
    gid: number,
    bet?: number,
    sel?: number
  ): Promise<SpinResult> {
    const token = await this.signIn(walletAddress);

    const body: any = { gid };
    if (bet !== undefined) body.bet = bet;
    if (sel !== undefined) body.sel = sel;

    const response = await fetch(`${this.config.baseURL}/slot/spin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.what || `Spin failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Double up gamble on last win
   */
  async doubleUp(walletAddress: string, gid: number, mult: number = 2): Promise<SpinResult> {
    const token = await this.signIn(walletAddress);

    const response = await fetch(`${this.config.baseURL}/slot/doubleup`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gid, mult }),
    });

    if (!response.ok) {
      throw new Error(`Double up failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Collect winnings
   */
  async collect(walletAddress: string, gid: number): Promise<void> {
    const token = await this.signIn(walletAddress);

    const response = await fetch(`${this.config.baseURL}/slot/collect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gid }),
    });

    if (!response.ok) {
      throw new Error(`Collect failed: ${response.statusText}`);
    }
  }

  /**
   * Clear token cache (for logout)
   */
  clearCache(walletAddress?: string): void {
    if (walletAddress) {
      this.tokenCache.delete(walletAddress);
    } else {
      this.tokenCache.clear();
    }
  }
}

// Export singleton instance
export const slotopolClient = new SlotopolClient();
export default SlotopolClient;
