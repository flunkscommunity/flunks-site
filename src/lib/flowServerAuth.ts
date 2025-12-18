/**
 * Server-side Flow transaction signing utility
 * 
 * This module provides the ability to sign Flow transactions server-side
 * using the admin private key stored in environment variables.
 * 
 * Used for admin operations like:
 * - Revealing/evolving NFTs
 * - Minting NFTs
 * - Other admin-only contract calls
 */

import * as fcl from '@onflow/fcl';
import { ec as EC } from 'elliptic';
import { createHash } from 'crypto';

// Initialize elliptic curve for P-256 (Flow's curve)
const ec = new EC('p256');

// Environment variables (trim to remove any trailing newlines from env vars)
const ADMIN_ADDRESS = (process.env.FLOW_ADMIN_ADDRESS || '0xce9dd43888d99574').trim();
const ADMIN_PRIVATE_KEY = process.env.FLOW_ADMIN_PRIVATE_KEY?.trim();

// Configure FCL for server-side (mainnet)
fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

/**
 * Hash a message using SHA2-256 (matching the account's hash algorithm)
 * Note: The admin account uses SHA2_256, not SHA3_256
 */
function hashMessage(message: string): Buffer {
  return createHash('sha256').update(Buffer.from(message, 'hex')).digest();
}

/**
 * Sign a message with the admin private key
 */
function signWithKey(privateKey: string, message: string): string {
  const key = ec.keyFromPrivate(Buffer.from(privateKey, 'hex'));
  const sig = key.sign(hashMessage(message));
  const n = 32;
  const r = sig.r.toArrayLike(Buffer, 'be', n);
  const s = sig.s.toArrayLike(Buffer, 'be', n);
  return Buffer.concat([r, s]).toString('hex');
}

/**
 * Create an authorization function for FCL that signs with the admin key
 */
export function getAdminAuthorization() {
  if (!ADMIN_PRIVATE_KEY) {
    throw new Error('FLOW_ADMIN_PRIVATE_KEY not configured');
  }

  return async (account: any = {}) => {
    const addr = ADMIN_ADDRESS.replace('0x', '');
    const keyId = 0; // Assuming key index 0

    return {
      ...account,
      tempId: `${addr}-${keyId}`,
      addr: fcl.sansPrefix(addr),
      keyId: keyId,
      signingFunction: async (signable: any) => {
        const signature = signWithKey(ADMIN_PRIVATE_KEY, signable.message);
        return {
          addr: fcl.withPrefix(addr),
          keyId: keyId,
          signature: signature,
        };
      },
    };
  };
}

/**
 * Execute a transaction with admin signing
 */
export async function executeAdminTransaction(
  cadenceCode: string,
  args: any[] = [],
  options: { limit?: number } = {}
): Promise<{ transactionId: string; status: any }> {
  if (!ADMIN_PRIVATE_KEY) {
    throw new Error('FLOW_ADMIN_PRIVATE_KEY not configured');
  }

  const adminAuth = getAdminAuthorization();

  try {
    console.log('🔐 Executing admin transaction...');
    
    const transactionId = await fcl.mutate({
      cadence: cadenceCode,
      args: () => args,
      proposer: adminAuth as any,
      payer: adminAuth as any,
      authorizations: [adminAuth as any],
      limit: options.limit || 1000,
    });

    console.log('📝 Transaction submitted:', transactionId);

    // Wait for transaction to be sealed
    const status = await fcl.tx(transactionId).onceSealed();
    
    console.log('✅ Transaction sealed:', transactionId);

    return {
      transactionId,
      status,
    };
  } catch (error: any) {
    console.error('❌ Admin transaction failed:', error);
    throw error;
  }
}

/**
 * Query the Flow blockchain (read-only, no signing needed)
 */
export async function queryFlow(
  cadenceCode: string,
  args: any[] = []
): Promise<any> {
  return fcl.query({
    cadence: cadenceCode,
    args: () => args,
  });
}

/**
 * Check if admin credentials are configured
 */
export function isAdminConfigured(): boolean {
  return !!(ADMIN_ADDRESS && ADMIN_PRIVATE_KEY);
}

/**
 * Get the admin address (useful for verification)
 */
export function getAdminAddress(): string {
  return ADMIN_ADDRESS;
}
