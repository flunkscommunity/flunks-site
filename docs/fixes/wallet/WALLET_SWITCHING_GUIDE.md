# How to Switch Between Flow Wallet and Dapper

## The Situation
- If you have Flow Wallet extension installed, FCL auto-reconnects when you visit the site
- You might want to use Dapper instead

## Solution Added: "Switch Wallet" Button

### Now When Connected:
The modal shows:
```
✅
Connected via Flow Wallet (FCL)
0x1234...5678

[Disconnect]  [Switch Wallet]
```

### To Switch from Flow Wallet to Dapper:

1. **Open any Connect Wallet button** (the modal will show you're connected)
2. **Click "Switch Wallet"** button
3. **Modal stays open** showing both options:
   - 🌊 Flow Wallets
   - 🔷 Dapper & More
4. **Click "Dapper & More"**
5. **Choose Dapper** from Dynamic widget

### To Switch from Dapper to Flow Wallet:
Same process - click "Switch Wallet" → Choose "Flow Wallets"

## Manual Method (Console)
If you need to force disconnect:

1. Open Console (F12)
2. Type: `fcl.unauthenticate()`
3. Press Enter
4. Refresh page
5. Connect with your preferred wallet

## Why Auto-Connect Happens

Flow Wallet extension saves your authorization. When you visit the site:
1. FCL checks for saved session
2. Finds Flow Wallet authorization
3. Auto-connects for convenience

This is **good UX** for most users, but the "Switch Wallet" button gives you choice when needed.

## Testing

### Test Flow Wallet → Dapper:
- [ ] Connect with Flow Wallet (or let it auto-connect)
- [ ] Click any "Connect Wallet" button
- [ ] See connected state with "Switch Wallet" button
- [ ] Click "Switch Wallet"
- [ ] See both wallet options
- [ ] Click "Dapper & More"
- [ ] Connect with Dapper successfully

### Test Dapper → Flow Wallet:
- [ ] Connect with Dapper
- [ ] Click any "Connect Wallet" button  
- [ ] See connected state with "Switch Wallet" button
- [ ] Click "Switch Wallet"
- [ ] See both wallet options
- [ ] Click "Flow Wallets"
- [ ] Connect with Flow Wallet successfully

## UI Updates

**Before:**
```
Connected State:
✅
Connected via Flow Wallet
0x1234...5678
[Disconnect Wallet]
```

**After:**
```
Connected State:
✅
Connected via Flow Wallet
0x1234...5678
[Disconnect]  [Switch Wallet]
```

The "Switch Wallet" button disconnects current wallet but keeps modal open so you can choose a different one.

---

**You can now easily switch between Flow Wallet and Dapper!** 🔄✨
