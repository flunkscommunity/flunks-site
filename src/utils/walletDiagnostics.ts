/**
 * Wallet Connection Diagnostics
 * Helps debug wallet connection issues on mobile and desktop
 */

import * as fcl from '@onflow/fcl';

export interface DiagnosticResult {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  message: string;
  value?: any;
  fix?: string;
}

export interface DiagnosticsReport {
  timestamp: string;
  platform: string;
  environment: string;
  results: DiagnosticResult[];
  overallStatus: 'healthy' | 'issues' | 'critical';
}

/**
 * Check if running in Capacitor mobile app
 */
function isMobileApp(): boolean {
  if (typeof window === 'undefined') return false;
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Test if a URL scheme can be opened (mobile only)
 */
async function canOpenUrlScheme(scheme: string): Promise<boolean> {
  if (!isMobileApp()) return false;
  
  try {
    const { AppLauncher } = await import('@capacitor/app-launcher');
    const result = await AppLauncher.canOpenUrl({ url: `${scheme}://test` });
    return result?.value ?? false;
  } catch {
    return false;
  }
}

/**
 * Test Flow blockchain connection
 */
async function testFlowConnection(): Promise<boolean> {
  try {
    const script = `
      access(all) fun main(): String {
        return "connected"
      }
    `;
    const result = await fcl.send([fcl.script(script)]).then(fcl.decode);
    return result === 'connected';
  } catch {
    return false;
  }
}

/**
 * Test WalletConnect relay connection
 */
async function testWalletConnectRelay(): Promise<boolean> {
  try {
    const response = await fetch('https://relay.walletconnect.com/health');
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if a wallet app is installed (browser extension or injected provider)
 */
function checkWalletInjection(walletKey: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const checks: Record<string, () => boolean> = {
    flowWallet: () => !!(window as any).flowWallet || !!(window as any).lilico,
    lilico: () => !!(window as any).lilico,
    dapper: () => !!(window as any).dapper,
    blocto: () => !!(window as any).blocto,
  };
  
  return checks[walletKey]?.() ?? false;
}

/**
 * Check localStorage for wallet sessions
 */
function checkStoredSessions() {
  if (typeof window === 'undefined') return {};
  
  return {
    walletConnect: !!localStorage.getItem('wc@2:client:0.3'),
    fclAuth: !!localStorage.getItem('FCL:AUTH'),
    fclUser: !!localStorage.getItem('fcl:user'),
    pendingAuth: !!localStorage.getItem('flunks_pending_auth'),
  };
}

/**
 * Run comprehensive wallet diagnostics
 */
export async function runWalletDiagnostics(): Promise<DiagnosticsReport> {
  const results: DiagnosticResult[] = [];
  const isMobile = isMobileApp();
  const platform = isMobile 
    ? (window as any).Capacitor?.getPlatform?.() ?? 'unknown'
    : 'web';

  // 1. Platform Detection
  results.push({
    name: 'Platform Detection',
    status: 'info',
    message: `Running on ${isMobile ? 'mobile app' : 'web browser'}`,
    value: { platform, isMobile },
  });

  // 2. FCL Configuration
  try {
    const [accessNode, network, wcProjectId, discoveryWallet, discoveryMethod] = await Promise.all([
      fcl.config().get('accessNode.api'),
      fcl.config().get('flow.network'),
      fcl.config().get('walletconnect.projectId'),
      fcl.config().get('discovery.wallet'),
      fcl.config().get('discovery.wallet.method'),
    ]);

    // Check access node
    results.push({
      name: 'Flow Access Node',
      status: accessNode && typeof accessNode === 'string' ? 'pass' : 'fail',
      message: accessNode ? `Connected to ${accessNode}` : 'Not configured',
      value: accessNode,
      fix: !accessNode ? 'Set accessNode.api in FCL config' : undefined,
    });

    // Check network
    const isMainnet = network === 'mainnet';
    results.push({
      name: 'Flow Network',
      status: isMainnet ? 'pass' : 'warning',
      message: `Network: ${network || 'not set'}`,
      value: network,
      fix: !isMainnet ? 'Should be "mainnet" for production' : undefined,
    });

    // Check WalletConnect Project ID
    results.push({
      name: 'WalletConnect Project ID',
      status: wcProjectId ? 'pass' : 'fail',
      message: wcProjectId ? 'WalletConnect configured' : 'Missing Project ID',
      value: wcProjectId ? '***' + String(wcProjectId).slice(-8) : undefined,
      fix: !wcProjectId ? 'Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env' : undefined,
    });

    // Check discovery endpoint
    const hasMainnetPath = typeof discoveryWallet === 'string' && discoveryWallet.includes('/mainnet/');
    results.push({
      name: 'Discovery Endpoint',
      status: discoveryWallet ? (hasMainnetPath ? 'pass' : 'warning') : 'fail',
      message: discoveryWallet || 'Not configured',
      value: discoveryWallet,
      fix: !hasMainnetPath && discoveryWallet 
        ? 'Consider using /mainnet/ path for better reliability'
        : !discoveryWallet ? 'Set discovery.wallet in FCL config' : undefined,
    });

    // Check discovery method
    results.push({
      name: 'Discovery Method',
      status: 'info',
      message: `Method: ${discoveryMethod || 'default'}`,
      value: discoveryMethod,
    });

  } catch (error: any) {
    results.push({
      name: 'FCL Configuration',
      status: 'fail',
      message: 'Failed to read FCL config',
      value: error.message,
      fix: 'Check if FCL is properly initialized',
    });
  }

  // 3. Current User Status
  try {
    const user = await fcl.currentUser.snapshot();
    results.push({
      name: 'FCL User Status',
      status: user?.loggedIn ? 'pass' : 'info',
      message: user?.loggedIn 
        ? `Logged in as ${user.addr?.slice(0, 10)}...`
        : 'Not logged in',
      value: user?.loggedIn ? { addr: user.addr, services: user.services?.length } : null,
    });
  } catch (error: any) {
    results.push({
      name: 'FCL User Status',
      status: 'warning',
      message: 'Could not check user status',
      value: error.message,
    });
  }

  // 4. Blockchain Connectivity
  const canConnectToFlow = await testFlowConnection();
  results.push({
    name: 'Flow Blockchain Connection',
    status: canConnectToFlow ? 'pass' : 'fail',
    message: canConnectToFlow 
      ? 'Successfully connected to Flow' 
      : 'Cannot reach Flow blockchain',
    fix: !canConnectToFlow ? 'Check internet connection and access node URL' : undefined,
  });

  // 5. WalletConnect Relay
  const canConnectToRelay = await testWalletConnectRelay();
  results.push({
    name: 'WalletConnect Relay',
    status: canConnectToRelay ? 'pass' : 'fail',
    message: canConnectToRelay 
      ? 'Relay server reachable' 
      : 'Cannot reach WalletConnect relay',
    fix: !canConnectToRelay ? 'Check firewall/network settings' : undefined,
  });

  // 6. Wallet App Detection (Mobile)
  if (isMobile) {
    const wallets = [
      { key: 'frw', name: 'Flow Wallet (frw://)' },
      { key: 'lilico', name: 'Flow Wallet (lilico://)' },
      { key: 'blocto', name: 'Blocto' },
    ];

    for (const wallet of wallets) {
      const canOpen = await canOpenUrlScheme(wallet.key);
      results.push({
        name: `${wallet.name} App`,
        status: canOpen ? 'pass' : 'warning',
        message: canOpen ? 'App installed' : 'App not detected',
        fix: !canOpen ? `Install ${wallet.name} from Play Store` : undefined,
      });
    }

    // Check AndroidManifest queries
    results.push({
      name: 'Deep Link Configuration',
      status: 'info',
      message: 'Check AndroidManifest.xml has <queries> for wallet schemes',
      fix: 'Ensure frw://, lilico://, blocto://, and wc:// schemes are declared',
    });
  }

  // 7. Wallet Injection (Desktop)
  if (!isMobile) {
    const wallets = ['flowWallet', 'lilico', 'dapper', 'blocto'];
    const detected = wallets.filter(w => checkWalletInjection(w));
    
    results.push({
      name: 'Browser Wallet Extensions',
      status: detected.length > 0 ? 'pass' : 'warning',
      message: detected.length > 0 
        ? `Detected: ${detected.join(', ')}`
        : 'No wallet extensions detected',
      value: detected,
      fix: detected.length === 0 ? 'Install Flow Wallet extension from Chrome Web Store' : undefined,
    });
  }

  // 8. Session Storage
  const sessions = checkStoredSessions();
  const hasActiveSession = sessions.walletConnect || sessions.fclAuth;
  results.push({
    name: 'Stored Sessions',
    status: hasActiveSession ? 'info' : 'info',
    message: hasActiveSession ? 'Found stored session data' : 'No stored sessions',
    value: sessions,
  });

  // 9. Environment Variables
  const hasWcId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;
  results.push({
    name: 'Environment Variables',
    status: hasWcId ? 'pass' : 'fail',
    message: hasWcId 
      ? 'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set'
      : 'Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    fix: !hasWcId ? 'Add to .env.local and .env.production' : undefined,
  });

  // 10. Capacitor Plugins (Mobile)
  if (isMobile) {
    try {
      const { Capacitor } = await import('@capacitor/core');
      const plugins = ['App', 'AppLauncher', 'Browser'];
      
      for (const plugin of plugins) {
        const isAvailable = Capacitor.isPluginAvailable(plugin);
        results.push({
          name: `Capacitor ${plugin} Plugin`,
          status: isAvailable ? 'pass' : 'warning',
          message: isAvailable ? 'Available' : 'Not available',
          fix: !isAvailable ? `Install @capacitor/${plugin.toLowerCase()}` : undefined,
        });
      }
    } catch {
      results.push({
        name: 'Capacitor Plugins',
        status: 'warning',
        message: 'Could not check Capacitor plugins',
      });
    }
  }

  // Determine overall status
  const failures = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  let overallStatus: 'healthy' | 'issues' | 'critical';
  if (failures > 0) {
    overallStatus = 'critical';
  } else if (warnings > 2) {
    overallStatus = 'issues';
  } else {
    overallStatus = 'healthy';
  }

  return {
    timestamp: new Date().toISOString(),
    platform,
    environment: process.env.NODE_ENV || 'development',
    results,
    overallStatus,
  };
}

/**
 * Generate a user-friendly diagnostics report
 */
export function formatDiagnosticsReport(report: DiagnosticsReport): string {
  let output = '=== WALLET CONNECTION DIAGNOSTICS ===\n\n';
  output += `Timestamp: ${new Date(report.timestamp).toLocaleString()}\n`;
  output += `Platform: ${report.platform}\n`;
  output += `Environment: ${report.environment}\n`;
  output += `Overall Status: ${report.overallStatus.toUpperCase()}\n\n`;

  const statusEmoji = {
    pass: '✅',
    fail: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  for (const result of report.results) {
    output += `${statusEmoji[result.status]} ${result.name}\n`;
    output += `   ${result.message}\n`;
    if (result.value && typeof result.value === 'object') {
      output += `   Value: ${JSON.stringify(result.value, null, 2)}\n`;
    } else if (result.value) {
      output += `   Value: ${result.value}\n`;
    }
    if (result.fix) {
      output += `   💡 Fix: ${result.fix}\n`;
    }
    output += '\n';
  }

  return output;
}

/**
 * Export diagnostics as JSON for support tickets
 */
export function exportDiagnostics(report: DiagnosticsReport): string {
  return JSON.stringify(report, null, 2);
}

/**
 * Quick check if wallet connection is likely to work
 */
export async function quickConnectionCheck(): Promise<{
  ready: boolean;
  issues: string[];
}> {
  const issues: string[] = [];
  
  try {
    // Check FCL config
    const [accessNode, wcProjectId] = await Promise.all([
      fcl.config().get('accessNode.api'),
      fcl.config().get('walletconnect.projectId'),
    ]);
    
    if (!accessNode) issues.push('Flow access node not configured');
    if (!wcProjectId) issues.push('WalletConnect project ID missing');
    
    // Check blockchain connection
    const canConnect = await testFlowConnection();
    if (!canConnect) issues.push('Cannot connect to Flow blockchain');
    
    // Check WalletConnect relay
    const relayOk = await testWalletConnectRelay();
    if (!relayOk) issues.push('WalletConnect relay unreachable');
    
    // Mobile-specific checks
    if (isMobileApp()) {
      const hasFlowWallet = await canOpenUrlScheme('frw') || await canOpenUrlScheme('lilico');
      if (!hasFlowWallet) issues.push('No Flow wallet app detected');
    }
    
  } catch (error: any) {
    issues.push(`Configuration error: ${error.message}`);
  }
  
  return {
    ready: issues.length === 0,
    issues,
  };
}
