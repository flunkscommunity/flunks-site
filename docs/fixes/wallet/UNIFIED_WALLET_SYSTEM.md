# Unified Wallet System - Dynamic SDK + Flow FCL

## Problem Solved
- **Issue**: Updating Dynamic SDK breaks Dapper mobile login (existing users)
- **Solution**: Run both Dynamic SDK (for Dapper) AND Flow FCL (for Flow Wallet) simultaneously
- **Result**: Zero breaking changes, new wallet options added

## Architecture

### Two Login Paths
1. **Dynamic SDK (v3.9.13)** - Existing system
   - Dapper Wallet (mobile & desktop) ✅ WORKING
   - Blocto (mobile & desktop) ✅ WORKING
   - Other Dynamic-supported wallets

2. **Flow FCL (@onflow/fcl)** - New addition
   - Flow Wallet / Lilico (desktop) 🆕
   - Flow Reference Wallet (desktop) 🆕
   - Any FCL-compatible wallet 🆕

### Components Created

#### 1. `FlowWalletConnect.tsx`
Standalone Flow Wallet connection button using FCL directly.
- Uses FCL discovery service
- Supports all FCL-compatible wallets
- Independent of Dynamic SDK
- Styled with Flow branding (green gradient)

#### 2. `UnifiedWalletContext.tsx`
Context provider that merges both wallet systems into one interface.
- Monitors both Dynamic and FCL connections
- Priority: Dynamic first (for existing users), then FCL
- Single address/isConnected state
- Tracks which provider is active

#### 3. `CombinedWalletConnect.tsx`
UI component showing both login options.
- Dynamic Widget (Dapper, Blocto, etc.)
- OR divider
- Flow Wallet button (FCL)
- Mobile-friendly guidance text

## Usage

### In Your App
The `UnifiedWalletProvider` is already added to `_app.tsx`:

```tsx
<DynamicContextProvider settings={{...}}>
  <UnifiedWalletProvider>
    {/* Your app */}
  </UnifiedWalletProvider>
</DynamicContextProvider>
```

### In Any Component
Replace wallet detection with unified hook:

```tsx
// OLD WAY (Dynamic only)
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

function MyComponent() {
  const { primaryWallet, user } = useDynamicContext();
  const address = primaryWallet?.address;
  // ...
}

// NEW WAY (Both Dynamic + FCL)
import { useUnifiedWallet } from '@/contexts/UnifiedWalletContext';

function MyComponent() {
  const { address, isConnected, provider } = useUnifiedWallet();
  
  console.log('Connected with:', provider); // 'dynamic' or 'fcl'
  console.log('Address:', address);
  // ...
}
```

### Show Combined Login UI
Use the `CombinedWalletConnect` component anywhere you need login:

```tsx
import CombinedWalletConnect from '@/components/CombinedWalletConnect';

function LoginPage() {
  return (
    <div>
      <h1>Connect Your Wallet</h1>
      <CombinedWalletConnect />
    </div>
  );
}
```

## Mobile vs Desktop Behavior

### Mobile (detected via user agent or screen width)
- Dynamic Widget shows Dapper + Blocto (current working setup)
- Flow Wallet button available but optimized for mobile wallets
- Recommendation: Use Dapper (tested and working)

### Desktop
- Dynamic Widget shows all available wallets
- Flow Wallet button connects to FCL discovery
- User can choose any Flow-compatible wallet

## FCL Configuration
Already configured in `src/config/fcl.ts`:
- Access node: Flow mainnet
- Discovery: FCL discovery service
- Includes: Dapper, Blocto, Ledger, Lilico, NuFi, Finoa

## Migration Path

### Phase 1: Soft Launch (Current)
- Both systems run in parallel
- Existing Dapper users unaffected
- New Flow Wallet users can connect via FCL
- Monitor adoption rates

### Phase 2: Testing
- Test Flow Wallet connections on desktop
- Verify transactions work through FCL
- Ensure state management handles both wallet types

### Phase 3: Future (Optional)
- If FCL proves more stable, can deprecate Dynamic
- Or keep both indefinitely (zero cost to dual system)
- Update Dynamic SDK when mobile issues fixed

## Benefits
1. ✅ **Zero Breaking Changes** - Dapper mobile users unaffected
2. ✅ **New Wallet Support** - Flow Wallet/Lilico now available
3. ✅ **Future Flexibility** - Can switch priorities or remove either system
4. ✅ **Better Mobile** - Keeps working Dapper mobile experience
5. ✅ **Better Desktop** - Native Flow Wallet support via FCL

## Technical Notes

### Address Normalization
Both Dynamic and FCL return Flow addresses in same format:
```
0x1234567890abcdef
```
No conversion needed.

### Priority Logic
```typescript
const address = dynamicAddress || fclAddress;
```
- If user connects via Dynamic (Dapper): Use that
- If user connects via FCL (Flow Wallet): Use that
- If both connected (edge case): Dynamic takes priority

### Disconnect Handling
- Dynamic: Uses built-in DynamicWidget disconnect
- FCL: Calls `fcl.unauthenticate()`
- Unified: Detects provider and disconnects appropriately

## Testing Checklist

- [ ] Test Dapper login on mobile (should work same as before)
- [ ] Test Dapper login on desktop (should work same as before)
- [ ] Test Flow Wallet button on desktop
- [ ] Test FCL discovery wallet selection
- [ ] Test switching between wallets
- [ ] Test address appears correctly in both modes
- [ ] Test transactions work with FCL-connected wallets
- [ ] Test useUnifiedWallet hook in various components

## Dependencies
```json
{
  "@dynamic-labs/flow": "^3.9.13",
  "@dynamic-labs/sdk-react-core": "^3.9.13",
  "@onflow/fcl": "^1.20.2"
}
```

All installed, no updates needed.
