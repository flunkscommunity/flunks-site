import React, { useEffect, useMemo, useState } from "react";
import { Button, Frame, TextInput } from "react95";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useUnifiedWallet } from "contexts/UnifiedWalletContext";
import * as fcl from "@onflow/fcl";

const TestFlowWalletWindow: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const {
    isConnected,
    address,
    walletType,
    connectFCL,
    disconnect,
    isMobile,
    isConnecting,
    lastCallbackUrl,
    lastError: contextLastError,
    lastAuthStartedAt,
  } = useUnifiedWallet();
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string>("idle");
  const [wcDebug, setWcDebug] = useState<{ method?: string; url?: string; timestamp?: string } | null>(null);
  const [fclConfig, setFclConfig] = useState<{
    network?: string;
    accessNode?: string;
    discoveryWallet?: string;
    discoveryMethod?: string;
    walletConnectProjectId?: string;
  }>({});

  // Prefer context error if present; keep local state for per-action errors.
  const effectiveError = contextLastError ?? actionError;

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [network, accessNode, discoveryWallet, discoveryMethod, walletConnectProjectId] = await Promise.all([
          fcl.config().get("flow.network"),
          fcl.config().get("accessNode.api"),
          fcl.config().get("discovery.wallet"),
          fcl.config().get("discovery.wallet.method"),
          fcl.config().get("walletconnect.projectId"),
        ]);

        if (cancelled) return;
        setFclConfig({
          network: typeof network === "string" ? network : String(network ?? ""),
          accessNode: typeof accessNode === "string" ? accessNode : String(accessNode ?? ""),
          discoveryWallet: typeof discoveryWallet === "string" ? discoveryWallet : String(discoveryWallet ?? ""),
          discoveryMethod: typeof discoveryMethod === "string" ? discoveryMethod : String(discoveryMethod ?? ""),
          walletConnectProjectId: typeof walletConnectProjectId === "string" ? walletConnectProjectId : String(walletConnectProjectId ?? ""),
        });
      } catch {
        // ignore
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusText = useMemo(() => {
    if (isConnected) return `connected (${walletType ?? "unknown"})`;
    if (isConnecting) return "connecting… (waiting for wallet callback)";
    return lastAction;
  }, [isConnected, walletType, isConnecting, lastAction]);

  const refreshWcDebug = () => {
    if (typeof window === "undefined") return;
    const value = (window as any).__wcLastOpen ?? null;
    setWcDebug(value);
  };

  useEffect(() => {
    refreshWcDebug();
  }, []);

  const handleConnect = async () => {
    setActionError(null);
    setLastAction("starting connectFCL()");

    try {
      await connectFCL();
      setLastAction("connectFCL() requested");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setActionError(message);
      setLastAction("error");
    }
  };

  const handleDisconnect = async () => {
    setActionError(null);
    setLastAction("disconnecting");

    try {
      await disconnect();
      setLastAction("disconnected");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setActionError(message);
      setLastAction("error");
    }
  };

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.TEST_FLOW_WALLET}
      onClose={() => closeWindow(WINDOW_IDS.TEST_FLOW_WALLET)}
      headerTitle="Test Flow Wallet"
      headerIcon="/images/icons/flowty.png"
      initialWidth="520px"
      initialHeight="360px"
      resizable={false}
      showMaximizeButton={false}
    >
      <div className="p-4 flex flex-col gap-3">
        <Frame variant="field" className="p-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Platform</div>
              <div className="text-sm font-semibold">{isMobile ? "Capacitor (mobile app)" : "Web"}</div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Status</div>
              <div className="text-sm font-semibold">{statusText}</div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Last callback</div>
              <div className="min-w-0 flex-1">
                <TextInput readOnly value={lastCallbackUrl ?? "(none)"} fullWidth />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Address</div>
              <div className="min-w-0 flex-1">
                <TextInput
                  readOnly
                  value={address ?? "(not connected)"}
                  fullWidth
                />
              </div>
            </div>
          </div>
        </Frame>

        <Frame variant="field" className="p-3">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold">FCL config</div>
            <div className="text-sm">network: {fclConfig.network || "(unknown)"}</div>
            <div className="text-sm">accessNode: {fclConfig.accessNode || "(unknown)"}</div>
            <div className="text-sm">discovery: {fclConfig.discoveryWallet || "(unset)"}</div>
            <div className="text-sm">method: {fclConfig.discoveryMethod || "(unset)"}</div>
            <div className="text-sm">
              walletconnect.projectId: {fclConfig.walletConnectProjectId ? `${fclConfig.walletConnectProjectId.slice(0, 6)}…` : "(unset)"}
            </div>
            <div className="text-sm">auth started: {lastAuthStartedAt ? new Date(lastAuthStartedAt).toLocaleTimeString() : "(never)"}</div>
          </div>
        </Frame>

        <div className="flex gap-2">
          <Button onClick={handleConnect} disabled={isConnecting}>
            Connect Flow Wallet
          </Button>
          <Button onClick={handleDisconnect} disabled={!isConnected && !isConnecting}>
            Disconnect
          </Button>
          <Button onClick={refreshWcDebug}>
            Refresh Debug
          </Button>
        </div>

        <Frame variant="field" className="p-3">
          <div className="text-sm font-semibold">WalletConnect debug</div>
          <div className="text-sm">method: {wcDebug?.method ?? "(none)"}</div>
          <div className="text-sm">url: {wcDebug?.url ?? "(none)"}</div>
          <div className="text-sm">time: {wcDebug?.timestamp ?? "(none)"}</div>
        </Frame>

        {effectiveError && (
          <Frame variant="field" className="p-3">
            <div className="text-sm font-semibold">Last error</div>
            <div className="text-sm" style={{ whiteSpace: "pre-wrap" }}>
              {effectiveError}
            </div>
          </Frame>
        )}

        <div className="text-xs opacity-70">
          Tip: On iOS, this should bounce you into Flow Wallet (or a WalletConnect chooser), then return here.
        </div>
      </div>
    </DraggableResizeableWindow>
  );
};

export default TestFlowWalletWindow;
