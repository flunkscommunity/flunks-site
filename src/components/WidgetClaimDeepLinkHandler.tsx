import React, { useEffect, useRef } from 'react';

import { useAuth } from 'contexts/AuthContext';
import { useGum } from 'contexts/GumContext';
import { useWindowsContext } from 'contexts/WindowsContext';
import { WINDOW_IDS } from 'fixed';
import LockerSystemNew from 'windows/LockerSystemNew';

const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
};

function tryParseUrl(rawUrl: string): URL | null {
  try {
    return new URL(rawUrl);
  } catch {
    return null;
  }
}

export default function WidgetClaimDeepLinkHandler() {
  const { walletAddress, isAuthenticated } = useAuth();
  const { refreshBalance } = useGum();
  const { openWindow } = useWindowsContext();

  const inflightRef = useRef(false);

  useEffect(() => {
    if (!isMobileApp()) return;

    let removeListener: (() => void) | null = null;

    const handleUrl = async (rawUrl: string) => {
      const url = tryParseUrl(rawUrl);
      if (!url) return;

      if (url.protocol !== 'flunks:' && url.protocol !== 'net.flunks.app:') return;

      const pathname = url.pathname || '';
      
      // Handle gum/claim deep link
      if (pathname === '/gum/claim' || pathname === 'gum/claim') {
        // Always open My Locker first
        openWindow({
          key: WINDOW_IDS.USER_PROFILE,
          window: <LockerSystemNew />,
        });

        if (!walletAddress || !isAuthenticated) {
          console.warn('[WidgetClaim] Opened claim link but no wallet connected - opened My Locker anyway');
          return;
        }

        if (inflightRef.current) return;
        inflightRef.current = true;

        try {
          const resp = await fetch('/api/daily-checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ wallet: walletAddress }),
          });

          // Even if already claimed, refresh balance so widget state stays accurate.
          if (!resp.ok) {
            console.warn('[WidgetClaim] daily-checkin failed:', resp.status);
          }

          await refreshBalance();
        } catch (err) {
          console.warn('[WidgetClaim] Error claiming daily check-in from widget:', err);
        } finally {
          inflightRef.current = false;
        }
        return;
      }

      // Handle generic gum deep link - just open My Locker
      if (pathname === '/gum' || pathname === 'gum') {
        openWindow({
          key: WINDOW_IDS.USER_PROFILE,
          window: <LockerSystemNew />,
        });
        return;
      }
    };

    const setup = async () => {
      try {
        const { App } = await import('@capacitor/app');

        const handle = await App.addListener('appUrlOpen', (event) => {
          if (event?.url) void handleUrl(event.url);
        });
        removeListener = () => handle.remove();

        const launchUrl = await App.getLaunchUrl();
        if (launchUrl?.url) {
          void handleUrl(launchUrl.url);
        }
      } catch (err) {
        console.warn('[WidgetClaim] Failed to set up deep link listener:', err);
      }
    };

    void setup();

    return () => {
      removeListener?.();
    };
  }, [walletAddress, isAuthenticated, refreshBalance]);

  return null;
}
