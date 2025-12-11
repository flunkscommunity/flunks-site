import React, { useState, useEffect } from 'react';
import * as fcl from '@onflow/fcl';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

/**
 * Day/Night Display Component
 * Shows day or night image based on user's timezone
 * 6 AM - 6 PM = Daytime
 * 6 PM - 6 AM = Nighttime
 * 
 * Features:
 * - Per-user timezone (no global day/night)
 * - Real-time updates every minute
 * - Smooth transitions between day/night
 */

interface DayNightStatus {
  userAddress: string;
  isDaytime: boolean;
  localHour: number;
  timezone: number;
  imageType: 'day' | 'night';
  imageURL: string;
  hasProfile: boolean;
}

interface DayNightDisplayProps {
  locationName?: string;
  dayImage?: string;
  nightImage?: string;
}

export default function DayNightDisplay({ 
  locationName = 'Paradise Motel',
  dayImage = '/images/paradise-motel-day-snow.png',
  nightImage = '/images/paradise-motel-night-snow.png'
}: DayNightDisplayProps) {
  const { primaryWallet } = useDynamicContext();
  const [status, setStatus] = useState<DayNightStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  // Fetch day/night status
  useEffect(() => {
    if (primaryWallet?.address) {
      fetchDayNightStatus();
      
      // Update every minute to check for day/night transitions
      const interval = setInterval(fetchDayNightStatus, 60000);
      return () => clearInterval(interval);
    }
  }, [primaryWallet?.address]);

  const fetchDayNightStatus = async () => {
    if (!primaryWallet?.address) return;

    try {
      const response = await fcl.query({
        cadence: `
          import SemesterZero from 0xYOUR_CONTRACT_ADDRESS
          
          access(all) fun main(userAddress: Address): {String: AnyStruct} {
            return SemesterZero.getUserDayNightStatus(userAddress: userAddress)
          }
        `,
        args: (arg: any, t: any) => [arg(primaryWallet.address, t.Address)],
      });

      const newStatus = response as DayNightStatus;
      
      // Trigger transition animation if day/night changed
      if (status && status.isDaytime !== newStatus.isDaytime) {
        setTransitioning(true);
        setTimeout(() => setTransitioning(false), 1000);
      }
      
      setStatus(newStatus);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching day/night status:', error);
      
      // Default to daytime if no profile
      setStatus({
        userAddress: primaryWallet.address,
        isDaytime: true,
        localHour: 12,
        timezone: 0,
        imageType: 'day',
        imageURL: dayImage,
        hasProfile: false,
      });
      setLoading(false);
    }
  };

  const createProfile = async () => {
    if (!primaryWallet?.address) return;

    try {
      // Detect user's timezone
      const timezoneOffset = -new Date().getTimezoneOffset() / 60;
      
      const transactionId = await fcl.mutate({
        cadence: `
          import SemesterZero from 0xYOUR_CONTRACT_ADDRESS
          
          transaction(username: String, timezone: Int) {
            prepare(signer: AuthAccount) {
              // Create profile
              let profile <- SemesterZero.createUserProfile(
                username: username,
                timezone: timezone
              )
              
              // Save to storage
              signer.save(<-profile, to: SemesterZero.UserProfileStoragePath)
              
              // Link public capability
              signer.link<&SemesterZero.UserProfile>(
                SemesterZero.UserProfilePublicPath,
                target: SemesterZero.UserProfileStoragePath
              )
            }
          }
        `,
        args: (arg: any, t: any) => [
          arg('Anonymous', t.String),
          arg(Math.floor(timezoneOffset), t.Int),
        ],
        payer: fcl.currentUser,
        proposer: fcl.currentUser,
        authorizations: [fcl.currentUser],
        limit: 100,
      });

      console.log('Transaction ID:', transactionId);
      await fcl.tx(transactionId).onceSealed();

      alert('✅ Profile created! Day/night cycle is now based on your timezone.');
      await fetchDayNightStatus();
    } catch (error) {
      console.error('Error creating profile:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="daynight-loading">
        <p>Loading {locationName}...</p>
      </div>
    );
  }

  const imageUrl = status?.isDaytime ? dayImage : nightImage;
  const timeOfDay = status?.isDaytime ? '☀️ Daytime' : '🌙 Nighttime';
  const localTime = status?.localHour 
    ? `${status.localHour % 12 || 12}:00 ${status.localHour >= 12 ? 'PM' : 'AM'}`
    : '';

  return (
    <div className="daynight-container">
      <div className={`daynight-image ${transitioning ? 'transitioning' : ''}`}>
        <img 
          src={imageUrl} 
          alt={`${locationName} - ${status?.isDaytime ? 'Day' : 'Night'}`}
        />
        
        <div className="daynight-overlay">
          <div className="time-info">
            <span className="time-of-day">{timeOfDay}</span>
            {localTime && <span className="local-time">{localTime}</span>}
          </div>
        </div>
      </div>

      {!status?.hasProfile && (
        <div className="no-profile-notice">
          <p>
            📍 You don't have a timezone profile yet. 
            <button onClick={createProfile} className="create-profile-btn">
              Create Profile
            </button>
          </p>
          <small>Day/night will match your local timezone once created.</small>
        </div>
      )}

      <style jsx>{`
        .daynight-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .daynight-image {
          position: relative;
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .daynight-image.transitioning {
          animation: fadeTransition 1s ease-in-out;
        }

        @keyframes fadeTransition {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .daynight-image img {
          width: 100%;
          height: auto;
          display: block;
        }

        .daynight-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0.4) 0%,
            transparent 30%
          );
          pointer-events: none;
        }

        .time-info {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.6);
          padding: 12px 20px;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          display: flex;
          flex-direction: column;
          gap: 4px;
          align-items: flex-end;
        }

        .time-of-day {
          font-size: 18px;
          font-weight: bold;
          color: white;
        }

        .local-time {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
        }

        .no-profile-notice {
          margin-top: 16px;
          padding: 16px;
          background: #fff3cd;
          border: 1px solid #ffc107;
          border-radius: 8px;
          text-align: center;
        }

        .no-profile-notice p {
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .no-profile-notice small {
          display: block;
          margin-top: 8px;
          color: #856404;
        }

        .create-profile-btn {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .create-profile-btn:hover {
          background: #0056b3;
        }

        .daynight-loading {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        @media (max-width: 768px) {
          .time-info {
            top: 12px;
            right: 12px;
            padding: 8px 12px;
          }

          .time-of-day {
            font-size: 14px;
          }

          .local-time {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
