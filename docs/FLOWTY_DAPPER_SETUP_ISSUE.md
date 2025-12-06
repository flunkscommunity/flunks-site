# Flowty Marketplace - Dapper Wallet Collection Setup Issue

## 🚨 Issue Report - December 6, 2025

### User's Problem

A user is trying to access the SemesterZero collection on Flowty marketplace:
https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZeroV3

They are experiencing:
1. Unable to connect with their Dapper wallet properly
2. Being prompted to create a new account for a different wallet address
3. Account linking confusion between their Dapper wallet and linked Flow wallet

**User's Wallets:**
- Dapper Wallet: `0xdca7ac623136e447` (1280 NFTs)
- Butterfly (Flow Wallet): `0x2e0eac981ef5bd98` (0.48 FLOW)
- Has account linking enabled

---

## 🔍 Root Cause Analysis

### Issue #1: Wrong Collection Path in Codebase

The application code was using **incorrect contract references**:
- **Code was looking for:** `SemesterZeroV3` contract with `/storage/SemesterZeroV3Collection`
- **Actually deployed:** `SemesterZero` contract at `0xce9dd43888d99574` with `/storage/SemesterZeroChapter5Collection`

This means users who set up their collection through the app created it at the **wrong storage path**, making their collection invisible to Flowty marketplace.

### Issue #2: Flowty Collection URL Is Incorrect

The URL the user is trying to access has the wrong collection name:
- **User trying:** `https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZeroV3`
- **Should be:** `https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZero`

Flowty reads the collection name from the deployed contract. Since the contract is named `SemesterZero` (not `SemesterZeroV3`), the collection appears under that name on Flowty.

### Issue #3: Dapper Wallet Limitations

Dapper Wallet has known limitations with custom collection setup transactions:
- Dapper uses an older Cadence syntax (Cadence 0.42)
- Some auth entitlements are not supported
- Users need to use Dapper's "Account Linking" feature to connect a non-custodial wallet (Flow Wallet, Lilico)

---

## ✅ Solutions Implemented

### 1. Fixed Collection Path References (COMPLETED)

Updated `SetupCollectionButton.tsx` to use the correct contract paths:

```typescript
// BEFORE (WRONG):
import SemesterZeroV3 from 0xce9dd43888d99574
let hasStorage = account.storage.type(at: /storage/SemesterZeroV3Collection)
let collectionRef = account.capabilities.borrow<&SemesterZeroV3.Collection>(
  /public/SemesterZeroV3Collection
)

// AFTER (CORRECT):
import SemesterZero from 0xce9dd43888d99574
let hasStorage = account.storage.type(at: /storage/SemesterZeroChapter5Collection)
let collectionRef = account.capabilities.borrow<&SemesterZero.Chapter5Collection>(
  /public/SemesterZeroChapter5Collection
)
```

The setup transaction now correctly:
- Uses `SemesterZero` contract name
- Uses `Chapter5CollectionStoragePath` and `Chapter5CollectionPublicPath` from the contract
- Calls `createEmptyChapter5Collection()` function

### 2. Correct Flowty URL

The correct URL for the SemesterZero collection on Flowty is:
```
https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZero
```

---

## 📋 Instructions for the User

### Option A: Use Flow Wallet (Recommended)

1. **Install Flow Wallet Extension** (formerly Lilico)
   - Visit: https://wallet.flow.com
   - Install the browser extension

2. **Import/Create Wallet**
   - Create a new Flow wallet OR
   - Import your existing wallet using seed phrase

3. **Link to Dapper (Optional)**
   - Visit: https://support.meetdapper.com/hc/en-us/articles/20744347884819-Account-Linking-and-FAQ
   - Follow Dapper's account linking guide to link your Flow wallet to Dapper

4. **Set Up Collection**
   - Visit: https://flunks.net
   - Connect with Flow Wallet
   - Navigate to Paradise Motel → Lobby
   - Click "🎫 Set up Collection" button
   - Sign the transaction

5. **Access Flowty**
   - Visit: https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZero
   - Connect with your Flow Wallet
   - Click "Enable Collection" if prompted
   - You should now see your NFTs!

### Option B: Use Dapper with Account Linking

1. **Link Your Dapper to Flow Wallet**
   - Open Dapper Wallet app
   - Go to Settings → Account Linking
   - Follow instructions to link a Flow wallet
   - This allows you to use your Flow wallet to manage collections while keeping NFTs in Dapper

2. **Set Up Collection with Flow Wallet**
   - Connect to flunks.net with your **linked Flow wallet** (not Dapper directly)
   - Set up the collection using Flow Wallet
   - NFTs will be accessible through your linked accounts

3. **Access Flowty**
   - Connect to Flowty with your **Flow Wallet** (the linked one)
   - Your NFTs stored in Dapper should be visible through the linked account

### Option C: Wait for Flowty to Add Collection Setup

Flowty marketplace typically provides an "Enable Collection" button that creates the collection for you. If this feature is available:

1. Visit: https://www.flowty.io/collection/0xce9dd43888d99574/SemesterZero
2. Connect your wallet (Dapper or Flow Wallet)
3. Look for "Enable Collection" button
4. Click and sign the transaction
5. Collection will be set up automatically

---

## 🔧 Technical Details

### Contract Information

- **Contract Address:** `0xce9dd43888d99574`
- **Contract Name:** `SemesterZero` (NOT SemesterZeroV3)
- **Network:** Flow Mainnet
- **Storage Path:** `/storage/SemesterZeroChapter5Collection`
- **Public Path:** `/public/SemesterZeroChapter5Collection`
- **Collection Type:** `Chapter5Collection`

### Collection Setup Transaction

```cadence
import SemesterZero from 0xce9dd43888d99574
import NonFungibleToken from 0x1d7e57aa55817448

transaction {
  prepare(signer: auth(Storage, Capabilities) &Account) {
    // Check if collection already exists
    let existingCollection = signer.storage.borrow<&SemesterZero.Chapter5Collection>(
      from: SemesterZero.Chapter5CollectionStoragePath
    )
    
    if existingCollection == nil {
      // Create new collection
      let collection <- SemesterZero.createEmptyChapter5Collection()
      
      // Save to storage
      signer.storage.save(<-collection, to: SemesterZero.Chapter5CollectionStoragePath)
      
      // Create and publish public capability
      let collectionCap = signer.capabilities.storage.issue<&SemesterZero.Chapter5Collection>(
        SemesterZero.Chapter5CollectionStoragePath
      )
      signer.capabilities.publish(collectionCap, at: SemesterZero.Chapter5CollectionPublicPath)
      
      log("✅ SemesterZero Chapter 5 collection created!")
    } else {
      log("ℹ️ Collection already exists")
    }
  }
}
```

### Verifying Collection Setup

To check if a wallet has the collection properly set up:

```cadence
import SemesterZero from 0xce9dd43888d99574
import NonFungibleToken from 0x1d7e57aa55817448

access(all) fun main(address: Address): Bool {
  let account = getAccount(address)
  
  // Check storage
  let hasStorage = account.storage.type(at: /storage/SemesterZeroChapter5Collection) != nil
  
  if !hasStorage {
    return false
  }
  
  // Check public capability
  let collectionRef = account.capabilities
    .borrow<&SemesterZero.Chapter5Collection>(
      /public/SemesterZeroChapter5Collection
    )
  
  return collectionRef != nil
}
```

---

## 🚨 Known Issues & Workarounds

### Issue: "Transaction not supported" with Dapper

**Cause:** Dapper Wallet doesn't support some advanced Cadence features used in collection setup.

**Workaround:** Use Flow Wallet extension instead, or use Dapper's Account Linking feature.

### Issue: Collection appears empty on Flowty

**Cause:** Collection was set up at wrong path (`/storage/SemesterZeroV3Collection` instead of `/storage/SemesterZeroChapter5Collection`)

**Solution:** 
1. Destroy old collection (requires admin transaction)
2. Create new collection at correct path
3. Contact support if you need NFTs moved

### Issue: Multiple wallets showing in selector

**Cause:** Dapper's account linking feature creates multiple wallet entries.

**Solution:** 
- Use the **linked Flow wallet address** to set up collections
- Use your **Dapper wallet address** only for viewing/managing NFTs
- Linked accounts share NFT access

---

## 📞 Support

If the user continues to experience issues:

1. **Check Collection Setup:**
   ```bash
   # Run this script to verify their collection
   flow scripts execute check-chapter5-collection.js WALLET_ADDRESS
   ```

2. **Verify Correct URL:**
   - Make sure they're using `/SemesterZero` not `/SemesterZeroV3`

3. **Test with Flow Wallet:**
   - Have them try with Flow Wallet extension first
   - Dapper has known limitations

4. **Contact Flowty Support:**
   - If collection is set up correctly but still not showing
   - Flowty may need to refresh their indexer for this collection

---

## 🎯 Next Steps for Development

### TODO: Fix Other References

The following files still reference `SemesterZeroV3` and need to be updated:

1. `/src/pages/api/level-up.ts` - Lines 99, 106, 223, 226, 229, 230
2. `/src/components/admin/LevelUp.tsx` - Lines 678, 685, 818, 825
3. `/register-tokenlist.sh` - Lines 15, 19
4. `/test-level-up.mjs` - Lines 63, 66, 69, 70
5. `/cadence/transactions/register-semester-zero-tokenlist.cdc` - Lines 7, 10

### TODO: Update Documentation

- Update all user-facing docs to use correct Flowty URL
- Add warning about Dapper wallet limitations
- Create visual guide for account linking process

### TODO: Add Error Handling

- Detect when user has collection at wrong path
- Provide migration instructions
- Add better error messages for Dapper wallet users

---

**Last Updated:** December 6, 2025  
**Status:** Critical fixes applied, additional cleanup needed
