import React, { useMemo, useState, useEffect } from "react";
import { Button, Frame, TextInput } from "react95";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { useWindowsContext } from "contexts/WindowsContext";
import { WINDOW_IDS } from "fixed";
import { useFlowWalletBridge } from "../flow/useFlowWalletBridge";

const FlowWalletApp: React.FC = () => {
  const { closeWindow } = useWindowsContext();
  const {
    isMobile,
    isConnecting,
    address,
    lastCallbackUrl,
    lastError,
    lastSignature,
    lastSignedMessage,
    connect,
    disconnect,
    signMessage,
  } = useFlowWalletBridge();

  const [message, setMessage] = useState("Flunks login check");
  const [actionError, setActionError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<any[]>([]);
  const [persistedLog, setPersistedLog] = useState<any[]>([]);

  // Load persisted log from localStorage on mount (survives app restarts)
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('__wc_persist_log') || '[]');
      setPersistedLog(saved);
    } catch (e) { /* ignore */ }
  }, []);

  // Poll for both in-memory and persisted log entries
  useEffect(() => {
    const interval = setInterval(() => {
      // In-memory log from wcRequestHook
      const log = (window as any).__wcDebugLog;
      if (log && log.length !== debugLog.length) {
        setDebugLog([...log]);
      }
      // Persisted log from localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('__wc_persist_log') || '[]');
        if (saved.length !== persistedLog.length) {
          setPersistedLog(saved);
        }
      } catch (e) { /* ignore */ }
    }, 500);
    return () => clearInterval(interval);
  }, [debugLog.length, persistedLog.length]);

  const statusText = useMemo(() => {
    if (isConnecting) return "connecting…";
    if (address) return "connected";
    return "disconnected";
  }, [isConnecting, address]);

  const handleConnect = async () => {
    setActionError(null);
    try {
      await connect();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleDisconnect = async () => {
    setActionError(null);
    try {
      await disconnect();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  };

  const handleSign = async () => {
    setActionError(null);
    try {
      await signMessage(message);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : String(error));
    }
  };

  const effectiveError = actionError ?? lastError;

  return (
    <DraggableResizeableWindow
      windowsId={WINDOW_IDS.FLOW_WALLET_APP}
      onClose={() => closeWindow(WINDOW_IDS.FLOW_WALLET_APP)}
      headerTitle="Flow Wallet"
      headerIcon="/images/icons/flowty.png"
      initialWidth="540px"
      initialHeight="520px"
      resizable={false}
      showMaximizeButton={false}
    >
      <div className="p-4 flex flex-col gap-3">
        <Frame variant="field" className="p-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Platform</div>
              <div className="text-sm font-semibold">{isMobile ? "Android/iOS (Capacitor)" : "Web"}</div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Status</div>
              <div className="text-sm font-semibold">{statusText}</div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Address</div>
              <div className="min-w-0 flex-1">
                <TextInput readOnly value={address ?? "(not connected)"} fullWidth />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">Last callback</div>
              <div className="min-w-0 flex-1">
                <TextInput readOnly value={lastCallbackUrl ?? "(none)"} fullWidth />
              </div>
            </div>
          </div>
        </Frame>

        <Frame variant="field" className="p-3">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-semibold">Sign a message</div>
            <TextInput
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              fullWidth
            />
            <div className="text-xs opacity-70">
              This will open Flow Wallet to approve a user signature.
            </div>
          </div>
        </Frame>

        <div className="flex gap-2">
          <Button onClick={handleConnect} disabled={isConnecting}>
            Connect Flow Wallet
          </Button>
          <Button onClick={handleDisconnect} disabled={!address && !isConnecting}>
            Disconnect
          </Button>
          <Button onClick={handleSign} disabled={!address || isConnecting}>
            Sign Message
          </Button>
        </div>

        <Frame variant="field" className="p-3">
          <div className="text-sm font-semibold">Signature result</div>
          <div className="text-xs opacity-70">Last message: {lastSignedMessage ?? "(none)"}</div>
          <textarea
            readOnly
            value={lastSignature ? JSON.stringify(lastSignature, null, 2) : "(no signature yet)"}
            style={{
              width: "100%",
              minHeight: "120px",
              marginTop: "8px",
              background: "#0f0f1a",
              color: "#e5e7eb",
              border: "1px solid #2a2a3e",
              borderRadius: "8px",
              padding: "8px",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          />
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
          Tip: On Android, the Flow Wallet app should open, then return here automatically.
        </div>

        <Frame variant="field" className="p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">🔍 Connection Debug Log</div>
            <Button size="sm" onClick={() => { 
              (window as any).__wcDebugLog = []; 
              setDebugLog([]); 
              localStorage.removeItem('__wc_persist_log');
              setPersistedLog([]);
            }}>
              Clear
            </Button>
          </div>
          <textarea
            readOnly
            value={persistedLog.length > 0 
              ? persistedLog.map((e: any) => `[${e.t}] ${e.step}${e.detail ? ': ' + e.detail : ''}`).join('\n')
              : '(no activity yet — tap Connect Flow Wallet, logs persist through restart)'}
            style={{
              width: "100%",
              minHeight: "140px",
              marginTop: "8px",
              background: "#0f0f1a",
              color: "#fbbf24",
              border: "1px solid #2a2a3e",
              borderRadius: "8px",
              padding: "8px",
              fontFamily: "monospace",
              fontSize: "10px",
              lineHeight: "1.4",
            }}
          />
        </Frame>
      </div>
    </DraggableResizeableWindow>
  );
};

export default FlowWalletApp;
