import React, { useState, useEffect } from 'react';
import { useLockerStats } from '../hooks/useLocker';

const LockerAdmin: React.FC = () => {
  const { stats, loading, error, refetch } = useLockerStats();

  return (
    <div style={{
      maxWidth: '600px',
      margin: '20px auto',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      background: '#f8f9fa',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        🏫 Locker System Statistics
      </h2>

      {loading && (
        <div style={{
          textAlign: 'center',
          color: '#7f8c8d',
          fontSize: '16px'
        }}>
          Loading statistics...
        </div>
      )}

      {error && (
        <div style={{
          background: '#e74c3c',
          color: 'white',
          padding: '10px',
          borderRadius: '4px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #3498db',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#3498db', margin: '0 0 10px 0' }}>
              Total Assigned
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              {stats.total_assigned}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
              Lockers assigned to users
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #27ae60',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#27ae60', margin: '0 0 10px 0' }}>
              Active Lockers
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              {stats.active_lockers}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
              Currently active users
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #f39c12',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#f39c12', margin: '0 0 10px 0' }}>
              Reserved Lockers
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              {stats.reserved_lockers}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
              Reserved for future use
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #9b59b6',
            textAlign: 'center'
          }}>
            <h3 style={{ color: '#9b59b6', margin: '0 0 10px 0' }}>
              Highest Number
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              #{stats.highest_locker_number}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
              Latest assigned locker
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '2px solid #e74c3c',
            textAlign: 'center',
            gridColumn: 'span 2'
          }}>
            <h3 style={{ color: '#e74c3c', margin: '0 0 10px 0' }}>
              Next Assignment
            </h3>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50' }}>
              #{stats.next_locker_number}
            </div>
            <div style={{ fontSize: '14px', color: '#7f8c8d' }}>
              Will be assigned to the next user who signs up
            </div>
          </div>
        </div>
      )}

      <div style={{
        textAlign: 'center',
        marginTop: '30px'
      }}>
        <button
          onClick={refetch}
          disabled={loading}
          style={{
            background: loading ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh Statistics'}
        </button>
      </div>

      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#d5e8d4',
        border: '1px solid #82b366',
        borderRadius: '6px',
        fontSize: '14px',
        color: '#2d5016'
      }}>
        <strong>How it works:</strong> Locker numbers are assigned automatically in sequential order starting from #1. 
        When a user connects their wallet and creates a profile, they receive the next available locker number. 
        The database ensures no duplicate assignments and maintains perfect sequential order.
      </div>
    </div>
  );
};

export default LockerAdmin;
