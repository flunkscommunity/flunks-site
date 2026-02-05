/**
 * Wallet Diagnostics Page
 * Internal tool for testing and debugging wallet connections
 * Access at /wallet-diagnostics
 */

import { useState } from 'react';
import { 
  runWalletDiagnostics, 
  formatDiagnosticsReport, 
  exportDiagnostics,
  quickConnectionCheck,
  type DiagnosticsReport 
} from '../utils/walletDiagnostics';

export default function WalletDiagnosticsPage() {
  const [report, setReport] = useState<DiagnosticsReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [quickCheck, setQuickCheck] = useState<{ ready: boolean; issues: string[] } | null>(null);

  const handleRunDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await runWalletDiagnostics();
      setReport(result);
    } catch (error) {
      console.error('Diagnostics failed:', error);
      alert('Failed to run diagnostics: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCheck = async () => {
    setLoading(true);
    try {
      const result = await quickConnectionCheck();
      setQuickCheck(result);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    const formatted = formatDiagnosticsReport(report);
    navigator.clipboard.writeText(formatted);
    alert('Report copied to clipboard!');
  };

  const handleExportJSON = () => {
    if (!report) return;
    const json = exportDiagnostics(report);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-diagnostics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return '#00ff00';
      case 'fail': return '#ff0000';
      case 'warning': return '#ffa500';
      case 'info': return '#00bfff';
      default: return '#999';
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '•';
    }
  };

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      padding: '20px',
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: '#0f0f1a',
      color: '#fff',
      minHeight: '100vh',
    }}>
      <h1 style={{ marginBottom: '10px' }}>🔍 Wallet Connection Diagnostics</h1>
      <p style={{ color: '#999', marginBottom: '30px' }}>
        Internal tool for debugging wallet connection issues
      </p>

      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={handleQuickCheck}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {loading ? '⏳ Checking...' : '⚡ Quick Check'}
        </button>

        <button
          onClick={handleRunDiagnostics}
          disabled={loading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {loading ? '⏳ Running...' : '🔬 Full Diagnostics'}
        </button>

        {report && (
          <>
            <button
              onClick={handleCopyReport}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              📋 Copy Report
            </button>

            <button
              onClick={handleExportJSON}
              style={{
                padding: '12px 24px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              💾 Export JSON
            </button>
          </>
        )}
      </div>

      {/* Quick Check Results */}
      {quickCheck && (
        <div style={{
          backgroundColor: quickCheck.ready ? '#065f46' : '#7f1d1d',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px',
          border: `2px solid ${quickCheck.ready ? '#10b981' : '#ef4444'}`,
        }}>
          <h2 style={{ marginTop: 0 }}>
            {quickCheck.ready ? '✅ Ready to Connect' : '❌ Issues Detected'}
          </h2>
          {quickCheck.ready ? (
            <p>All critical checks passed. Wallet connection should work.</p>
          ) : (
            <div>
              <p style={{ fontWeight: 'bold' }}>Issues found:</p>
              <ul>
                {quickCheck.issues.map((issue, i) => (
                  <li key={i} style={{ marginBottom: '8px' }}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Full Diagnostics Report */}
      {report && (
        <div>
          {/* Overall Status */}
          <div style={{
            backgroundColor: 
              report.overallStatus === 'healthy' ? '#065f46' :
              report.overallStatus === 'issues' ? '#78350f' :
              '#7f1d1d',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
          }}>
            <h2 style={{ marginTop: 0 }}>
              {report.overallStatus === 'healthy' && '✅ System Healthy'}
              {report.overallStatus === 'issues' && '⚠️ Some Issues Detected'}
              {report.overallStatus === 'critical' && '❌ Critical Issues'}
            </h2>
            <p style={{ margin: 0, opacity: 0.9 }}>
              Platform: {report.platform} | Environment: {report.environment}
            </p>
            <p style={{ margin: '8px 0 0', opacity: 0.7, fontSize: '14px' }}>
              {new Date(report.timestamp).toLocaleString()}
            </p>
          </div>

          {/* Individual Test Results */}
          <div style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {report.results.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '16px 20px',
                  borderBottom: index < report.results.length - 1 ? '1px solid #2a2a3e' : 'none',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px',
                }}>
                  <span style={{ fontSize: '24px' }}>
                    {getStatusEmoji(result.status)}
                  </span>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                  }}>
                    {result.name}
                  </h3>
                  <span style={{
                    marginLeft: 'auto',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    backgroundColor: getStatusColor(result.status) + '20',
                    color: getStatusColor(result.status),
                  }}>
                    {result.status.toUpperCase()}
                  </span>
                </div>

                <p style={{
                  margin: '8px 0',
                  paddingLeft: '36px',
                  color: '#ccc',
                }}>
                  {result.message}
                </p>

                {result.value && (
                  <pre style={{
                    margin: '8px 0',
                    paddingLeft: '36px',
                    fontSize: '12px',
                    color: '#999',
                    overflow: 'auto',
                  }}>
                    {typeof result.value === 'object' 
                      ? JSON.stringify(result.value, null, 2)
                      : String(result.value)}
                  </pre>
                )}

                {result.fix && (
                  <div style={{
                    margin: '8px 0',
                    paddingLeft: '36px',
                    padding: '12px',
                    backgroundColor: '#2a2a3e',
                    borderRadius: '8px',
                    borderLeft: '4px solid #ffa500',
                  }}>
                    <strong style={{ color: '#ffa500' }}>💡 Fix:</strong>{' '}
                    <span style={{ color: '#ccc' }}>{result.fix}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!report && !quickCheck && (
        <div style={{
          backgroundColor: '#1a1a2e',
          padding: '24px',
          borderRadius: '12px',
          marginTop: '20px',
        }}>
          <h3 style={{ marginTop: 0 }}>How to Use</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>
              <strong>Quick Check:</strong> Fast validation of critical requirements.
              Use this first to identify major issues.
            </li>
            <li>
              <strong>Full Diagnostics:</strong> Comprehensive check of all configuration,
              platform capabilities, and connectivity. Provides detailed fixes.
            </li>
            <li>
              <strong>Copy Report:</strong> Copy formatted report to clipboard for
              sharing with support.
            </li>
            <li>
              <strong>Export JSON:</strong> Download complete diagnostics data for
              debugging.
            </li>
          </ul>

          <h3>When to Run Diagnostics</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>Before testing wallet connection on a new device</li>
            <li>When users report connection issues</li>
            <li>After updating FCL configuration</li>
            <li>After deploying new app version</li>
            <li>To verify WalletConnect setup</li>
          </ul>
        </div>
      )}
    </div>
  );
}
