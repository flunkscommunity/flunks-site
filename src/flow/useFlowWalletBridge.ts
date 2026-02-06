import { useCallback, useEffect, useMemo, useState } from "react";
import * as fcl from "@onflow/fcl";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { isWcReady, waitForWcReady } from "../config/fcl";

const isMobileApp = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

const normalizeFlowAddress = (address: string | null | undefined): string | null => {
  if (!address) return null;
  let normalized = address.trim().toLowerCase();
  if (normalized.includes(":")) {
    const parts = normalized.split(":");
    normalized = parts[parts.length - 1] ?? "";
  }
  if (!normalized.startsWith("0x")) {
    normalized = `0x${normalized}`;
  }
  return /^0x[a-f0-9]{16}$/.test(normalized) ? normalized : null;
};

const encodeMessageToHex = (message: string): string => {
  const bytes = new TextEncoder().encode(message);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

interface FlowWalletBridgeState {
  isMobile: boolean;
  isConnecting: boolean;
  user: any | null;
  address: string | null;
  lastCallbackUrl: string | null;
  lastError: string | null;
  lastSignature: any | null;
  lastSignedMessage: string | null;
}

interface FlowWalletBridgeApi extends FlowWalletBridgeState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signMessage: (message: string) => Promise<any>;
}

export const useFlowWalletBridge = (): FlowWalletBridgeApi => {
  const [state, setState] = useState<FlowWalletBridgeState>({
    isMobile: false,
    isConnecting: false,
    user: null,
    address: null,
    lastCallbackUrl: null,
    lastError: null,
    lastSignature: null,
    lastSignedMessage: null,
  });

  useEffect(() => {
    const mobile = isMobileApp();
    setState((prev) => ({ ...prev, isMobile: mobile }));

    if (mobile) {
      const setupDeepLinkListener = async () => {
        await App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
          setState((prev) => ({ ...prev, lastCallbackUrl: event.url }));
          void fcl.currentUser.snapshot().then((user) => {
            if (user?.loggedIn && user?.addr) {
              setState((prev) => ({
                ...prev,
                user,
                address: normalizeFlowAddress(user.addr),
                isConnecting: false,
              }));
            } else {
              setState((prev) => ({ ...prev, isConnecting: false }));
            }
          });
        });

        const launch = await App.getLaunchUrl();
        if (launch?.url) {
          setState((prev) => ({ ...prev, lastCallbackUrl: launch.url }));
        }
      };

      setupDeepLinkListener().catch(() => {
        setState((prev) => ({ ...prev, lastError: "Failed to initialize deep link listener" }));
      });
    }

    const unsubscribe = fcl.currentUser.subscribe((user: any) => {
      if (user?.loggedIn && user?.addr) {
        setState((prev) => ({
          ...prev,
          user,
          address: normalizeFlowAddress(user.addr),
          isConnecting: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          user: null,
          address: null,
          isConnecting: false,
        }));
      }
    });

    return () => {
      unsubscribe();
      if (mobile) {
        App.removeAllListeners();
      }
    };
  }, []);

  const connect = useCallback(async () => {
    if (state.isConnecting) return;

    setState((prev) => ({ ...prev, isConnecting: true, lastError: null }));

    try {
      if (state.isMobile && !isWcReady()) {
        await waitForWcReady(3000);
      }

      const authPromise = fcl.authenticate();

      if (!state.isMobile) {
        await authPromise;
      } else {
        void authPromise.catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          setState((prev) => ({ ...prev, lastError: message, isConnecting: false }));
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setState((prev) => ({ ...prev, lastError: message, isConnecting: false }));
      throw error;
    }
  }, [state.isConnecting, state.isMobile]);

  const disconnect = useCallback(async () => {
    setState((prev) => ({ ...prev, lastError: null }));
    await fcl.unauthenticate();
  }, []);

  const signMessage = useCallback(async (message: string) => {
    if (!state.address) {
      throw new Error("Connect a wallet before signing a message.");
    }

    const hex = encodeMessageToHex(message);
    const signature = await fcl.currentUser.signUserMessage(hex);

    setState((prev) => ({
      ...prev,
      lastSignature: signature,
      lastSignedMessage: message,
    }));

    return signature;
  }, [state.address]);

  return useMemo(
    () => ({
      ...state,
      connect,
      disconnect,
      signMessage,
    }),
    [state, connect, disconnect, signMessage]
  );
};

export default useFlowWalletBridge;
