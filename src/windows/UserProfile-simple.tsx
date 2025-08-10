import React from 'react';
import DraggableResizeableWindow from '../components/DraggableResizeableWindow';
import { WINDOW_IDS } from '../fixed';

const UserProfile: React.FC = () => {
  return (
    <DraggableResizeableWindow
      headerTitle="My Locker"
      windowsId={WINDOW_IDS.USER_PROFILE}
      initialWidth="400px"
      initialHeight="300px"
      openCentered
    >
      <div style={{ 
        padding: '20px', 
        height: '100%', 
        background: '#f0f0f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>My Locker</h2>
        <p style={{ margin: 0, color: '#666' }}>Welcome to your personal locker!</p>
        <div style={{ 
          marginTop: '20px',
          padding: '10px',
          background: '#ddd',
          borderRadius: '4px'
        }}>
          Basic locker interface working ✅
        </div>
      </div>
    </DraggableResizeableWindow>
  );
};

export default UserProfile;
