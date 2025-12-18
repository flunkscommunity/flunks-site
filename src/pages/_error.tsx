import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#1a1a2e',
      color: '#fff',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>
        {statusCode || 'Error'}
      </h1>
      <p style={{ fontSize: '1.2rem', opacity: 0.8 }}>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
      <a 
        href="/"
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: '#4CAF50',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        Go Home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
