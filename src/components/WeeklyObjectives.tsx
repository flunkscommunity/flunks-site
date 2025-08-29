import React, { useState, useEffect } from 'react';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getWeeklyObjectivesStatus, type WeeklyObjective, type ObjectiveStatus, calculateObjectiveProgress } from '../utils/weeklyObjectives';

interface WeeklyObjectivesProps {
  onObjectiveComplete?: (objective: WeeklyObjective) => void;
}

const WeeklyObjectives: React.FC<WeeklyObjectivesProps> = ({ onObjectiveComplete }) => {
  const { primaryWallet } = useDynamicContext();
  const [objectivesStatus, setObjectivesStatus] = useState<ObjectiveStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const loadObjectives = async () => {
    if (!primaryWallet?.address) return;
    
    setLoading(true);
    try {
      const status = await getWeeklyObjectivesStatus(primaryWallet.address);
      setObjectivesStatus(status);
    } catch (error) {
      console.error('Failed to load objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadObjectives();
    
    // Refresh every 10 seconds to catch any missed updates
    const interval = setInterval(loadObjectives, 10000);
    
    // Listen for objective updates
    const handleObjectiveUpdate = () => {
      setTimeout(loadObjectives, 1000); // Small delay to ensure DB is updated
    };

    window.addEventListener('cafeteriaButtonClicked', handleObjectiveUpdate);
    window.addEventListener('codeAccessed', handleObjectiveUpdate);
    window.addEventListener('gumBalanceUpdated', handleObjectiveUpdate); // Also listen to gum updates
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('cafeteriaButtonClicked', handleObjectiveUpdate);
      window.removeEventListener('codeAccessed', handleObjectiveUpdate);
      window.removeEventListener('gumBalanceUpdated', handleObjectiveUpdate);
    };
  }, [primaryWallet?.address]);

  if (!primaryWallet?.address) {
    return null;
  }

  if (loading) {
    return (
      <div style={{
        background: 'rgba(0,0,0,0.8)',
        border: '2px solid #4a90e2',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
        textAlign: 'center'
      }}>
        <div style={{ color: '#4a90e2', fontSize: '16px' }}>
          📊 Loading objectives...
        </div>
      </div>
    );
  }

  if (!objectivesStatus) return null;

  const progress = calculateObjectiveProgress(objectivesStatus.completedObjectives);
  const completedCount = objectivesStatus.completedObjectives.filter(obj => obj.completed).length;
  const totalCount = objectivesStatus.completedObjectives.length;

  return (
    <div style={{
      background: 'rgba(0,0,0,0.8)',
      border: '2px solid #4a90e2',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '20px',
      color: 'white',
      fontFamily: 'MS Sans Serif, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#4a90e2'
          }}>
            📋 Semester Zero: Finding Flunko
          </div>
          <button
            onClick={loadObjectives}
            disabled={loading}
            style={{
              background: 'rgba(74, 144, 226, 0.2)',
              border: '1px solid #4a90e2',
              borderRadius: '4px',
              color: '#4a90e2',
              padding: '4px 8px',
              fontSize: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
        <div style={{
          fontSize: '14px',
          color: '#ccc',
          marginBottom: '12px'
        }}>
          Weekly Objectives ({completedCount}/{totalCount} Complete)
        </div>
        
        {/* Progress Bar */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '10px',
          height: '8px',
          overflow: 'hidden',
          position: 'relative'
        }}>
          <div style={{
            background: progress === 100 
              ? 'linear-gradient(90deg, #00ff00, #32cd32)' 
              : 'linear-gradient(90deg, #4a90e2, #357abd)',
            height: '100%',
            width: `${progress}%`,
            borderRadius: '10px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
        <div style={{
          fontSize: '12px',
          color: '#aaa',
          marginTop: '4px'
        }}>
          {progress}% Complete
        </div>
      </div>

      {/* Objectives List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {objectivesStatus.completedObjectives.map((objective) => (
          <div
            key={objective.id}
            style={{
              background: objective.completed 
                ? 'rgba(0, 255, 0, 0.1)' 
                : 'rgba(255, 255, 255, 0.05)',
              border: objective.completed 
                ? '1px solid rgba(0, 255, 0, 0.3)' 
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 'bold',
                color: objective.completed ? '#00ff00' : '#fff',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {objective.completed ? '✅' : '⭕'} {objective.title}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#ccc',
                marginBottom: '4px'
              }}>
                {objective.description}
              </div>
              {objective.reward && (
                <div style={{
                  fontSize: '11px',
                  color: '#4a90e2',
                  fontWeight: 'bold'
                }}>
                  🍬 Reward: {objective.reward} GUM
                </div>
              )}
            </div>
            
            {objective.completed && (
              <div style={{
                background: 'rgba(0, 255, 0, 0.2)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                animation: 'completePulse 2s ease-in-out infinite'
              }}>
                ✓
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Completion Message */}
      {progress === 100 && (
        <div style={{
          background: 'linear-gradient(45deg, rgba(0, 255, 0, 0.2), rgba(50, 205, 50, 0.2))',
          border: '2px solid #00ff00',
          borderRadius: '8px',
          padding: '12px',
          marginTop: '16px',
          textAlign: 'center',
          animation: 'completionGlow 2s ease-in-out infinite alternate'
        }}>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#00ff00',
            marginBottom: '4px'
          }}>
            🎉 All Objectives Complete! 🎉
          </div>
          <div style={{
            fontSize: '14px',
            color: '#32cd32'
          }}>
            You're ready for the next semester!
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes completePulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes completionGlow {
          0% { box-shadow: 0 0 10px rgba(0, 255, 0, 0.3); }
          100% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.6); }
        }
      `}</style>
    </div>
  );
};

export default WeeklyObjectives;
