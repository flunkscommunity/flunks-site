# 📱 Mobile Flow Wallet Icons Implementation Guide

## 🎯 What We've Implemented

Based on Dynamic Labs documentation, we've implemented two key features to show Flow wallet icons prominently on mobile:

### 1. **Recommended Wallets Configuration**
```typescript
recommendedWallets: [
  { walletKey: "flowwallet", label: "Popular" },
  { walletKey: "lilico", label: "Popular" },
  { walletKey: "blocto", label: "Popular" },
  { walletKey: "dapper" }
]
```
This will show Flow ecosystem wallets at the **top** of the wallet list with "Popular" badges.

### 2. **New to Web3 Configuration**
```typescript
newToWeb3WalletChainMap: {
  primary_chain: 'flow',
  wallets: {
    flow: 'flowwallet' // Primary recommendation for new users
  }
}
```
This shows Flow Wallet as the primary recommendation in the "New to Web3" help section.

### 3. **Wallet Sorting**
```typescript
walletsFilter: SortWallets(['flowwallet', 'lilico', 'blocto', 'dapper'])
```
This ensures Flow ecosystem wallets appear first in the list, even if they don't have the "Popular" badge.

## 🎨 Visual Customization

Added CSS styling in `/src/styles/dynamic-fixes.css`:

### Mobile-Specific Flow Wallet Styling:
- **Gradient backgrounds** for Flow ecosystem wallets
- **Prominent "Popular" badges** in orange (#FF6B35)
- **Larger touch targets** (60px min-height) for mobile
- **Flow brand colors** (#00D4AA primary, #4A90E2 secondary)

### CSS Variables for Badge Customization:
```css
:root {
  --dynamic-badge-primary-background: #00D4AA !important;
  --dynamic-badge-primary-color: #ffffff !important;
}
```

## 🔑 Key Wallet Identifiers

Based on your current setup and Dynamic's Flow connector:
- **Flow Wallet (Lilico)**: `flowwallet` or `lilico`
- **Blocto**: `blocto`  
- **Dapper**: `dapper`

## 📋 How It Works on Mobile

### For Users With Wallets:
1. **Flow ecosystem wallets appear at the top** with "Popular" badges
2. **Enhanced visual styling** makes them stand out
3. **Larger touch targets** for easier mobile interaction

### For New Users:
1. **"New to Web3" section shows Flow Wallet** as primary recommendation
2. **Clear guidance** for first-time wallet setup
3. **Flow-focused onboarding** experience

## 🔍 Finding Additional Wallet Keys

If you need to find other wallet keys available in Dynamic, you can:

### Method 1: Browser Console
```javascript
// Run this in the browser console after Dynamic loads
const { walletOptions } = useDynamicContext();
console.log(walletOptions.map(wallet => wallet.key));
```

### Method 2: Dashboard Check
Visit your [Dynamic Dashboard Chains Section](https://app.dynamic.xyz/dashboard/chains-and-networks#flow) to see all available Flow wallets and their keys.

### Method 3: Runtime Debug
The current config logs all available wallets:
```javascript
console.log('📋 Available wallets:', wallets.map(w => ({ 
  key: w.key, 
  name: w.name,
  mobile: w.mobile 
})));
```

## 🚀 Next Steps

1. **Test on mobile devices** - verify Flow wallets appear with icons at the top
2. **Check wallet key accuracy** - ensure `flowwallet`, `lilico`, etc. are correct
3. **Customize badge colors** - adjust CSS variables if needed
4. **Monitor user engagement** - see if Flow wallet adoption improves

## 🛠️ Troubleshooting

### If Flow Wallets Don't Appear at Top:
- Check the wallet keys in Dynamic dashboard
- Verify FlowWalletConnectors is properly imported
- Ensure Flow chain is enabled in dashboard

### If Icons/Styling Don't Show:
- Clear browser cache
- Check that `dynamic-fixes.css` is being loaded
- Verify CSS variables are being applied

### Alternative CLI Approach:
You can also use Dynamic's CLI to check available wallets:
```bash
# If you have Dynamic CLI installed
npx @dynamic-labs/cli wallet-list --environment-id=your-env-id
```

## 📖 Documentation References

- [Dynamic: Recommend Wallets](https://docs.dynamic.xyz/wallets/advanced-wallets/recommend-wallets)
- [Dynamic: Sort and Filter Wallets](https://docs.dynamic.xyz/wallets/advanced-wallets/sort-and-filter-wallets)
- [Dynamic: CSS Variables](https://docs.dynamic.xyz/design-customizations/css/css-variables)
- [Flow Wallet Connectors](https://docs.dynamic.xyz/react-sdk/wallet-connectors/flow)

---

**✅ Implementation Complete!** 

Your mobile users should now see Flow wallet icons prominently at the top of the wallet selection with "Popular" badges and enhanced styling.
