// Yearbook API utilities for fetching NFT data from Google Cloud
import { FlunkNFT, YearbookFilters, YearbookStats } from '../types/Yearbook';

const BACKEND_BASE_URL = 'https://flunks-backend-prod-dot-bionic-hallway-338400.uc.r.appspot.com';

// API client for fetching Flunks collection data
export class YearbookAPI {
  
  /**
   * Fetch all Flunks NFTs with optional filtering
   */
  static async fetchFlunks(filters?: YearbookFilters): Promise<FlunkNFT[]> {
    try {
      const params = new URLSearchParams();
      
      if (filters?.clique && filters.clique !== 'ALL') {
        params.append('clique', filters.clique);
      }
      
      if (filters?.trait && filters.trait !== 'ALL') {
        params.append('trait', filters.trait);
      }
      
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      if (filters?.limit) {
        params.append('limit', filters.limit.toString());
      }
      
      if (filters?.offset) {
        params.append('offset', filters.offset.toString());
      }

      const url = `${BACKEND_BASE_URL}/api/nfts/flunks${params.toString() ? '?' + params.toString() : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch Flunks: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformAPIResponse(data);
      
    } catch (error) {
      console.error('Error fetching Flunks:', error);
      throw error;
    }
  }

  /**
   * Fetch collection statistics
   */
  static async fetchStats(): Promise<YearbookStats> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/nfts/flunks/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status} ${response.statusText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return fallback stats
      return {
        total: 10000,
        geeks: 2500,
        jocks: 2500,
        preps: 2500,
        freaks: 2500,
        uniqueTraits: 150
      };
    }
  }

  /**
   * Fetch individual Flunk by token ID
   */
  static async fetchFlunkById(tokenId: number): Promise<FlunkNFT | null> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/nfts/flunks/${tokenId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to fetch Flunk #${tokenId}: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformSingleNFT(data);
      
    } catch (error) {
      console.error(`Error fetching Flunk #${tokenId}:`, error);
      throw error;
    }
  }

  /**
   * Search Flunks by trait combinations
   */
  static async searchByTraits(traits: Record<string, string>): Promise<FlunkNFT[]> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/nfts/flunks/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traits }),
      });

      if (!response.ok) {
        throw new Error(`Failed to search Flunks: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformAPIResponse(data);
      
    } catch (error) {
      console.error('Error searching Flunks by traits:', error);
      throw error;
    }
  }

  /**
   * Get available trait options for filters
   */
  static async getTraitOptions(): Promise<Record<string, string[]>> {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/api/nfts/flunks/traits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch trait options: ${response.status} ${response.statusText}`);
      }

      return await response.json();
      
    } catch (error) {
      console.error('Error fetching trait options:', error);
      // Return fallback trait options
      return {
        'Background': ['Blue', 'Red', 'Green', 'Purple', 'Yellow'],
        'Hair': ['Curly', 'Straight', 'Afro', 'Buzz', 'Long'],
        'Eyes': ['Big', 'Small', 'Squinty', 'Closed'],
        'Clothing': ['Hoodie', 'T-Shirt', 'Jacket', 'Tank Top'],
        'Expression': ['Happy', 'Sad', 'Angry', 'Neutral', 'Surprised']
      };
    }
  }

  /**
   * Transform API response to our FlunkNFT interface
   */
  private static transformAPIResponse(data: any[]): FlunkNFT[] {
    return data.map(item => this.transformSingleNFT(item));
  }

  /**
   * Transform single NFT data to our FlunkNFT interface
   */
  private static transformSingleNFT(item: any): FlunkNFT {
    // Extract clique from metadata attributes
    const cliqueAttribute = item.metadata?.attributes?.find(
      (attr: any) => attr.trait_type?.toLowerCase() === 'clique'
    );

    return {
      tokenId: item.tokenId || item.id,
      metadata: {
        name: item.metadata?.name || `Flunk #${item.tokenId || item.id}`,
        description: item.metadata?.description || '',
        image: this.getImageUrl(item),
        attributes: item.metadata?.attributes || []
      },
      rank: item.rank || item.rarity_rank,
      clique: cliqueAttribute?.value?.toUpperCase() || 'UNKNOWN',
      owner: item.ownerAddress,
      lastSale: item.lastSalePrice ? {
        price: item.lastSalePrice,
        currency: item.lastSaleCurrency || 'FLOW',
        date: item.lastSaleDate
      } : undefined
    };
  }

  /**
   * Get the best available image URL for an NFT
   */
  private static getImageUrl(item: any): string {
    // Try different possible image fields
    const possibleImageFields = [
      'metadata.image',
      'metadata.uri', 
      'metadata.thumbnail.url',
      'image',
      'uri',
      'thumbnail'
    ];

    for (const field of possibleImageFields) {
      const value = this.getNestedProperty(item, field);
      if (value && typeof value === 'string') {
        // Handle IPFS URLs
        if (value.startsWith('ipfs://')) {
          return `https://ipfs.io/ipfs/${value.slice(7)}`;
        }
        return value;
      }
    }

    // Fallback to placeholder
    return '/images/icons/user.png';
  }

  /**
   * Get nested property from object using dot notation
   */
  private static getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}

/**
 * Mock data generator for development/testing
 */
export class YearbookMockData {
  
  static generateMockFlunks(count: number = 50): FlunkNFT[] {
    const cliques = ['GEEK', 'JOCK', 'PREP', 'FREAK'];
    const backgrounds = ['School Hallway', 'Library', 'Gym', 'Cafeteria', 'Classroom', 'Locker Room', 'Principal\'s Office', 'Science Lab'];
    const faces = ['Happy', 'Serious', 'Smiling', 'Focused', 'Confident', 'Shy', 'Excited', 'Cool'];
    const heads = ['Baseball Cap', 'Beanie', 'Headband', 'Hair Bow', 'No Hat', 'Bandana', 'Crown', 'Glasses'];
    const pigments = ['Light', 'Medium', 'Dark', 'Pale', 'Tan', 'Olive', 'Fair', 'Deep'];
    const superlatives = ['Most Likely to Succeed', 'Class Clown', 'Most Athletic', 'Best Dressed', 'Most Creative', 'Teacher\'s Pet', 'Most Popular', 'Biggest Rebel'];
    const torsos = ['T-Shirt', 'Hoodie', 'Jersey', 'Polo', 'Tank Top', 'Sweater', 'Blazer', 'Jacket'];
    const types = ['Student', 'Athlete', 'Scholar', 'Artist', 'Leader', 'Musician', 'Rebel', 'Socialite'];

    // Available image sets with their counts
    const imageSets = [
      { prefix: 'fp-', count: 10, extension: 'avif' },  // fp-1.avif to fp-10.avif
      { prefix: 'f2d-', count: 10, extension: 'avif' }, // f2d-1.avif to f2d-10.avif
      { prefix: 'bp-', count: 10, extension: 'avif' },  // bp-1.avif to bp-10.avif
      { prefix: 'f3d-', count: 10, extension: 'webp' }, // f3d-1.webp to f3d-10.webp
      { prefix: 'jnr-', count: 10, extension: 'webp' }, // jnr-1.webp to jnr-10.webp
    ];

    return Array.from({ length: count }, (_, index) => {
      const tokenId = 1000 + index;
      const clique = cliques[index % cliques.length];
      
      // Select image set and number within that set
      const imageSetIndex = Math.floor(index / 10) % imageSets.length;
      const imageSet = imageSets[imageSetIndex];
      const imageNumber = (index % imageSet.count) + 1;
      const imagePath = `/images/about-us/${imageSet.prefix}${imageNumber}.${imageSet.extension}`;
      
      return {
        tokenId,
        metadata: {
          name: `Flunk #${tokenId}`,
          description: `A ${clique.toLowerCase()} from Flunks High School, Class of 2024`,
          image: imagePath,
          attributes: [
            { trait_type: 'Clique', value: clique },
            { trait_type: 'Background', value: backgrounds[index % backgrounds.length] },
            { trait_type: 'Face', value: faces[index % faces.length] },
            { trait_type: 'Head', value: heads[index % heads.length] },
            { trait_type: 'Pigment', value: pigments[index % pigments.length] },
            { trait_type: 'Superlative', value: superlatives[index % superlatives.length] },
            { trait_type: 'Torso', value: torsos[index % torsos.length] },
            { trait_type: 'Type', value: types[index % types.length] }
          ]
        },
        rank: Math.floor(Math.random() * 10000) + 1,
        clique: clique
      };
    });
  }

  static getMockStats(): YearbookStats {
    return {
      total: 10000,
      geeks: 2456,
      jocks: 2511,
      preps: 2398,
      freaks: 2635,
      uniqueTraits: 147
    };
  }
}
