import React, { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

const FlunkyUppyArcadeWindow: React.FC = () => {
  const { primaryWallet, user } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleFlowDrawingEntry = async () => {
    if (!primaryWallet?.address) {
      setMessage("Please connect your Flow wallet first!");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/flow-drawing-entry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: primaryWallet.address,
          username: user?.firstName || user?.username || "Anonymous",
          userAgent: navigator.userAgent,
          referrer: document.referrer || window.location.href,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage("Entry recorded! Good luck in the drawing!");
      } else {
        setMessage(`Error: ${result.error || "Failed to record entry"}`);
      }
    } catch (error) {
      console.error("Failed to record drawing entry:", error);
      setMessage("Failed to connect to entry system.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-black text-white flex flex-col overflow-hidden">
      {/* Coming Soon Image - Fixed height to prevent cutoff */}
      <div className="flex-shrink-0 flex items-center justify-center w-full" style={{ height: '40%' }}>
        <img 
          src="/images/coming-soon.png"
          alt="Coming Soon"
          className="max-w-full max-h-full object-contain"
          style={{
            filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))",
          }}
          onError={(e) => {
            // Fallback if image doesn't exist
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: white; font-size: 24px; font-family: 'Press Start 2P', monospace; text-align: center; padding: 20px;">
                  🚧 COMING SOON 🚧
                </div>
              `;
            }
          }}
        />
      </div>

      {/* Controls Section - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 bg-gray-900 bg-opacity-90">
        {/* Message Display */}
        {message && (
          <div className={`mb-4 p-3 rounded text-center text-sm ${
            message.includes("Error") || message.includes("Failed") 
              ? "bg-red-900 border border-red-500 text-red-200"
              : "bg-green-900 border border-green-500 text-green-200"
          }`}>
            {message}
          </div>
        )}

        {/* Flow Drawing Entry Section */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-orange-400 mb-3">
            � FLOW DRAWING
          </h3>
          
          {primaryWallet?.address ? (
            <>
              <div className="text-xs text-gray-400 mb-3 break-all">
                Connected: {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-6)}
              </div>
              
              <button
                onClick={handleFlowDrawingEntry}
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 ${
                  isLoading
                    ? "bg-gray-600 cursor-not-allowed text-gray-400"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 hover:scale-105 shadow-lg text-white"
                } border-2 border-blue-300`}
              >
                {isLoading ? "🔄 Recording Entry..." : "🎯 ENTER FLOW DRAWING"}
              </button>
            </>
          ) : (
            <div className="text-center">
              <p className="text-yellow-400 text-sm mb-3">
                Connect your Flow wallet to enter!
              </p>
              <button
                disabled
                className="w-full py-3 px-4 rounded-lg font-bold bg-gray-600 cursor-not-allowed text-gray-400 border-2 border-gray-500"
              >
                🔒 CONNECT WALLET FIRST
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlunkyUppyArcadeWindow;