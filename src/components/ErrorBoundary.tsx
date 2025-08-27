import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
    
    // Log to external service if needed
    if (typeof window !== 'undefined') {
      console.error('Error Boundary - Client Side Error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffe0e0',
          color: '#c92a2a',
          fontFamily: 'monospace'
        }}>
          <h3>⚠️ Something went wrong</h3>
          <p>An error occurred while loading this component.</p>
          <details style={{ marginTop: '10px' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              Click for error details
            </summary>
            <pre style={{ 
              background: '#f8f8f8', 
              padding: '10px', 
              marginTop: '10px',
              overflow: 'auto',
              fontSize: '12px'
            }}>
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#339af0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '10px',
              marginLeft: '10px',
              padding: '8px 16px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
