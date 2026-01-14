/**
 * Level Up API - Evolve Pin NFTs (Paradise Motel, Flunky Uppy, etc.)
 * 
 * This endpoint handles the complete NFT evolution flow:
 * 1. Verify user owns the NFT and it's unrevealed
 * 2. Verify user has enough GUM for selected tier
 * 3. Deduct GUM from user's balance
 * 4. Execute admin reveal transaction on-chain
 * 5. If blockchain fails, refund the GUM
 * 
 * POST /api/level-up
 * Body: { walletAddress, nftId, tier }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import * as fcl from '@onflow/fcl';
import { supabase } from '../../lib/supabase';
import { executeAdminTransaction, queryFlow, isAdminConfigured } from '../../lib/flowServerAuth';
import { handleCors } from '../../utils/corsHeaders';

// Pin configuration by location
const PIN_CONFIGS: Record<string, {
  name: string;
  tiers: Record<string, {
    cost: number;
    contractTier: string;
    image: string;
    name: string;
    description: string;
  }>;
}> = {
  'Paradise Motel': {
    name: 'Paradise Motel Pin',
    tiers: {
      Silver: {
        cost: 250,
        contractTier: 'Silver',
        image: 'https://storage.googleapis.com/flunks_public/images/paradise-motel-pin-silver.png',
        name: 'Paradise Motel Pin - Silver',
        description: 'A Silver tier Paradise Motel pin from Flunks: Semester Zero. Awarded for completing Chapter 5.',
      },
      Gold: {
        cost: 500,
        contractTier: 'Gold',
        image: 'https://storage.googleapis.com/flunks_public/images/paradise-motel-pin-gold.png',
        name: 'Paradise Motel Pin - Gold',
        description: 'A Gold tier Paradise Motel pin from Flunks: Semester Zero. Awarded for completing Chapter 5.',
      },
      Special: {
        cost: 1000,
        contractTier: 'Special',
        image: 'https://storage.googleapis.com/flunks_public/images/paradise-motel-pin-special.png',
        name: 'Paradise Motel Pin - Special',
        description: 'A Special tier Paradise Motel pin from Flunks: Semester Zero. Awarded for completing Chapter 5.',
      },
    },
  },
  'Arcade': {
    name: 'Flunky Uppy Pin',
    tiers: {
      Silver: {
        cost: 250,
        contractTier: 'Silver',
        image: 'https://storage.googleapis.com/flunks_public/images/flunky-uppy-pin-silver.png',
        name: 'Flunky Uppy Pin - Silver',
        description: 'A Silver tier Flunky Uppy pin from the 2nd volume of the Arcade Challenge in Flunks: Semester Zero.',
      },
      Gold: {
        cost: 500,
        contractTier: 'Gold',
        image: 'https://storage.googleapis.com/flunks_public/images/flunky-uppy-pin-gold.png',
        name: 'Flunky Uppy Pin - Gold',
        description: 'A Gold tier Flunky Uppy pin from the 2nd volume of the Arcade Challenge in Flunks: Semester Zero.',
      },
      Special: {
        cost: 1000,
        contractTier: 'Special',
        image: 'https://storage.googleapis.com/flunks_public/images/flunky-uppy-pin-special.png',
        name: 'Flunky Uppy Pin - Special',
        description: 'A Special tier Flunky Uppy pin from the 2nd volume of the Arcade Challenge in Flunks: Semester Zero.',
      },
    },
  },
};

// Legacy TIERS for backward compatibility
// Note: Contract accepts: Silver, Gold, Special, Retro, Punk, or Nerdy
const TIERS = PIN_CONFIGS['Paradise Motel'].tiers;

type TierName = keyof typeof TIERS;

// Configure FCL
fcl.config()
  .put('accessNode.api', 'https://rest-mainnet.onflow.org')
  .put('flow.network', 'mainnet');

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Handle CORS for mobile app
  if (handleCors(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { walletAddress, nftId, tier } = req.body;

  // Validate inputs
  if (!walletAddress || nftId === undefined || !tier) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: walletAddress, nftId, tier',
    });
  }

  // Validate tier
  if (!TIERS[tier as TierName]) {
    return res.status(400).json({
      success: false,
      error: `Invalid tier. Must be one of: ${Object.keys(TIERS).join(', ')}`,
    });
  }

  // Check if admin is configured
  if (!isAdminConfigured()) {
    console.error('❌ Flow admin not configured');
    return res.status(500).json({
      success: false,
      error: 'Server configuration error - admin not configured',
    });
  }

  // We'll determine the actual tierConfig after fetching NFT data (need location)
  // For now, just validate the tier name exists
  if (!TIERS[tier as TierName]) {
    return res.status(400).json({
      success: false,
      error: `Invalid tier. Must be one of: ${Object.keys(TIERS).join(', ')}`,
    });
  }

  console.log('🎮 Level Up request:', { walletAddress, nftId, tier });

  try {
    // Step 1: Verify NFT ownership and get current metadata
    console.log('📋 Step 1: Verifying NFT ownership...');
    
    const nftData = await queryFlow(
      `
        import SemesterZeroV3 from 0xce9dd43888d99574
        import MetadataViews from 0x1d7e57aa55817448
        
        access(all) fun main(address: Address, nftId: UInt64): {String: String}? {
          let account = getAccount(address)
          
          let collectionRef = account.capabilities
            .borrow<&SemesterZeroV3.Collection>(/public/SemesterZeroV3Collection)
          
          if collectionRef == nil {
            return nil
          }
          
          let nft = collectionRef!.borrowSemesterZeroNFT(id: nftId)
          if nft == nil {
            return nil
          }
          
          var result: {String: String} = {}
          for key in nft!.metadata.keys {
            result[key] = nft!.metadata[key]!
          }
          result["serialNumber"] = nft!.serialNumber.toString()
          result["evolutionTier"] = nft!.evolutionTier
          result["location"] = nft!.location
          return result
        }
      `,
      [fcl.arg(walletAddress, fcl.t.Address), fcl.arg(nftId.toString(), fcl.t.UInt64)]
    );

    if (!nftData) {
      return res.status(404).json({
        success: false,
        error: 'NFT not found in wallet. Make sure you own this NFT.',
      });
    }

    console.log('📄 Current NFT metadata:', nftData);

    // Get the pin config based on NFT location
    const nftLocation = nftData.location || 'Paradise Motel'; // Default for legacy
    const pinConfig = PIN_CONFIGS[nftLocation];
    
    if (!pinConfig) {
      return res.status(400).json({
        success: false,
        error: `Unknown pin location: ${nftLocation}. Cannot evolve this NFT.`,
      });
    }

    const tierConfig = pinConfig.tiers[tier as TierName];
    if (!tierConfig) {
      return res.status(400).json({
        success: false,
        error: `Invalid tier for ${pinConfig.name}. Must be one of: ${Object.keys(pinConfig.tiers).join(', ')}`,
      });
    }

    const gumCost = tierConfig.cost;
    console.log('📍 Pin location:', nftLocation, '| Tier:', tier, '| Cost:', gumCost);

    // Check if already revealed/evolved
    if (nftData.evolutionTier && nftData.evolutionTier !== 'Base') {
      return res.status(400).json({
        success: false,
        error: `This NFT has already been evolved to ${nftData.evolutionTier} tier.`,
      });
    }

    // Step 2: Check GUM balance
    console.log('💰 Step 2: Checking GUM balance...');
    
    const { data: balanceData, error: balanceError } = await supabase
      .from('user_gum_balances')
      .select('total_gum')
      .eq('wallet_address', walletAddress)
      .single();

    if (balanceError && balanceError.code !== 'PGRST116') {
      console.error('Error checking balance:', balanceError);
      return res.status(500).json({
        success: false,
        error: 'Error checking GUM balance',
      });
    }

    const currentBalance = balanceData?.total_gum || 0;
    console.log('💰 Current GUM balance:', currentBalance, 'Required:', gumCost);

    if (currentBalance < gumCost) {
      return res.status(400).json({
        success: false,
        error: `Insufficient GUM. You have ${currentBalance} but need ${gumCost} for ${tier} tier.`,
        currentBalance,
        required: gumCost,
      });
    }

    // Step 3: Deduct GUM
    console.log('💸 Step 3: Deducting GUM...');
    
    const newBalance = currentBalance - gumCost;
    
    const { error: updateError } = await supabase
      .from('user_gum_balances')
      .update({
        total_gum: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('wallet_address', walletAddress);

    if (updateError) {
      console.error('Error deducting GUM:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Error deducting GUM',
      });
    }

    // Record the transaction
    await supabase.from('gum_transactions').insert({
      wallet_address: walletAddress,
      transaction_type: 'spend',
      amount: -gumCost,
      source: 'level_up_evolution',
      description: `Evolved NFT #${nftId} to ${tier} tier`,
      metadata: {
        nftId,
        tier,
        cost: gumCost,
        timestamp: new Date().toISOString(),
      },
    });

    console.log('✅ GUM deducted:', gumCost, 'New balance:', newBalance);

    // Step 4: Execute on-chain reveal transaction
    console.log('⛓️ Step 4: Executing on-chain reveal...');

    try {
      // Build new metadata
      // Note: We exclude 'tier', 'achievement', and 'evolvedAt' from metadata
      // to prevent them from showing as traits on marketplaces like Flowty
      const serialNumber = nftData.serialNumber || '0';

      const revealTransaction = `
        import SemesterZeroV3 from 0xce9dd43888d99574
        
        transaction(userAddress: Address, nftId: UInt64) {
          let admin: &SemesterZeroV3.Admin
          
          prepare(signer: auth(BorrowValue) &Account) {
            self.admin = signer.storage.borrow<&SemesterZeroV3.Admin>(
              from: /storage/SemesterZeroV3Admin
            ) ?? panic("Could not borrow admin reference")
          }
          
          execute {
            let newMetadata: {String: String} = {
              "name": "${tierConfig.name}",
              "description": "${tierConfig.description}",
              "image": "${tierConfig.image}",
              "location": "${nftLocation}",
              "chapter": "5",
              "collection": "Flunks: Semester Zero",
              "serialNumber": "${serialNumber}"
            }
            
            self.admin.evolveNFT(
              userAddress: userAddress,
              nftID: nftId,
              newTier: "${tierConfig.contractTier}",
              newMetadata: newMetadata
            )
            
            log("✨ NFT evolved to ${tierConfig.contractTier} tier!")
          }
        }
      `;

      const { transactionId, status } = await executeAdminTransaction(
        revealTransaction,
        [fcl.arg(walletAddress, fcl.t.Address), fcl.arg(nftId.toString(), fcl.t.UInt64)],
        { limit: 1000 }
      );

      console.log('✅ On-chain evolution complete:', transactionId);

      return res.status(200).json({
        success: true,
        message: `Successfully evolved NFT to ${tier} tier!`,
        transactionId,
        tier,
        gumSpent: gumCost,
        newBalance,
        newImage: tierConfig.image,
        explorerUrl: `https://flowscan.io/transaction/${transactionId}`,
      });

    } catch (blockchainError: any) {
      // Step 5: REFUND if blockchain fails
      console.error('❌ Blockchain transaction failed:', blockchainError);
      console.error('❌ Error message:', blockchainError?.message);
      console.error('❌ Error stack:', blockchainError?.stack);
      console.error('❌ Full error:', JSON.stringify(blockchainError, Object.getOwnPropertyNames(blockchainError), 2));
      console.log('💰 Refunding GUM...');

      // Refund the GUM
      const { error: refundError } = await supabase
        .from('user_gum_balances')
        .update({
          total_gum: currentBalance, // Restore original balance
          updated_at: new Date().toISOString(),
        })
        .eq('wallet_address', walletAddress);

      if (refundError) {
        console.error('❌ CRITICAL: Failed to refund GUM:', refundError);
        // Log this for manual intervention
        await supabase.from('gum_transactions').insert({
          wallet_address: walletAddress,
          transaction_type: 'refund_failed',
          amount: gumCost,
          source: 'level_up_evolution_refund_failed',
          description: `MANUAL INTERVENTION NEEDED: Failed to refund ${gumCost} GUM for failed evolution of NFT #${nftId}`,
          metadata: {
            nftId,
            tier,
            cost: gumCost,
            error: blockchainError.message,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        // Record the refund
        await supabase.from('gum_transactions').insert({
          wallet_address: walletAddress,
          transaction_type: 'refund',
          amount: gumCost,
          source: 'level_up_evolution_refund',
          description: `Refunded ${gumCost} GUM - evolution of NFT #${nftId} failed`,
          metadata: {
            nftId,
            tier,
            cost: gumCost,
            error: blockchainError.message,
            timestamp: new Date().toISOString(),
          },
        });
        console.log('✅ GUM refunded successfully');
      }

      return res.status(500).json({
        success: false,
        error: 'Blockchain transaction failed. Your GUM has been refunded.',
        refunded: !refundError,
        details: blockchainError.message,
        fullError: JSON.stringify(blockchainError, Object.getOwnPropertyNames(blockchainError)),
      });
    }

  } catch (error: any) {
    console.error('❌ Level up error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
