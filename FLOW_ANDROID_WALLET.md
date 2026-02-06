# Flow Wallet on Android — Clean Handoff Plan (Flunks)

This document summarizes the Flow Developer Portal guidance and how Flow connects to Android via FCL + WalletConnect, plus how the new **Flow Wallet** in-app window works.

## What Flow Uses on Mobile

From the Flow Developer Portal:
- **FCL (Flow Client Library)** provides the standard wallet connection flow for web/mobile apps. It handles wallet discovery, authentication, and signing via a wallet provider.
- **Discovery** is configured via `discovery.wallet` and `discovery.authn.endpoint`, and can open wallets in a **tab/popup/iframe** or via API.
- **WalletConnect** is enabled by setting `walletconnect.projectId`, and is the mobile-safe transport for opening wallet apps and getting signatures back.

References:
- FCL overview: https://developers.flow.com/build/tools/clients/fcl-js
- Discovery & WalletConnect config: https://developers.flow.com/build/tools/clients/fcl-js/discovery

## How Android Devices Connect to Flow

The mobile flow is:
1. **Flunks app** uses FCL configured with Flow **mainnet** access node and discovery endpoints.
2. When the user taps **Connect Flow Wallet**, FCL starts **WalletConnect (WC/RPC)**.
3. The app opens the **Flow Wallet app** via deep link (WalletConnect URI).
4. The wallet signs and approves.
5. The wallet returns to Flunks via deep link or app link.
6. FCL updates `currentUser`, and the app shows the wallet as active.

Key configuration points (already in `src/config/fcl.ts`):
- `flow.network = mainnet`
- `accessNode.api = https://rest-mainnet.onflow.org`
- `discovery.wallet = https://fcl-discovery.onflow.org/mainnet/authn`
- `discovery.authn.endpoint = https://fcl-discovery.onflow.org/api/mainnet/authn`
- `walletconnect.projectId = <your WC project id>`

## What We Added

A new **Flow Wallet** window (`FlowWalletApp`) that:
- Opens Flow Wallet (via FCL/WC deep link)
- Shows live connection status and address
- Signs a user message to prove the wallet is active in Flunks

Files:
- `src/flow/useFlowWalletBridge.ts` — clean, minimal FCL + WalletConnect flow
- `src/windows/FlowWalletApp.tsx` — in-app UI for connect/sign/status

## Android Deep Link Notes

The Android app is already configured with:
- `flunks://` scheme
- `https://flunks.net` and `https://www.flunks.net` app links
- Queries for `frw://` and `lilico://` so the app can open Flow Wallet

This matches the Flow Wallet deep-link approach used by WalletConnect on mobile.

## How This Replaces the Messy Flow

The new Flow Wallet app **does not depend on Dynamic Labs** or custom wallet hacks. It uses:
- FCL config (single source of truth)
- WalletConnect (mobile-safe transport)
- Capacitor deep-link callback listeners

This keeps the connect → sign → return flow stable and easy to debug.
