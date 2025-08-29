import { useWindowsContext } from "contexts/WindowsContext";
import DraggableResizeableWindow from "components/DraggableResizeableWindow";
import { WINDOW_IDS } from "fixed";
import { useState } from "react";
import { useTimeBasedImage, isDayTime } from "utils/timeBasedImages";
import { useAuth } from "contexts/AuthContext";
import { awardGum } from "utils/gumAPI";
import { trackCafeteriaButtonClick } from "utils/cafeteriaButtonTracking";
import DigitalLock from "components/DigitalLock";
import SuccessWindow from "components/SuccessWindow";

const HighSchoolMain = () => {
  const { openWindow, closeWindow } = useWindowsContext();
  const { walletAddress, user } = useAuth();
  const [buttonClickLoading, setButtonClickLoading] = useState(false);

  // Use time-based images with your uploaded day/night photos
  const dayImage = "/images/icons/school-day.png";
  const nightImage = "/images/icons/school-night.png";
  const fallbackImage = "/images/backdrops/BLANK.png";

  // Get time-based image info
  const timeBasedInfo = useTimeBasedImage(dayImage, nightImage);

  // Get current background - use time-based only
  const getCurrentBackground = () => {
    return timeBasedInfo.currentImage;
  };

  // Handle cafeteria button click
  const handleCafeteriaButtonClick = async () => {
    if (!walletAddress) {
      alert('Please connect your wallet first to use this feature!');
      return;
    }

    setButtonClickLoading(true);
    
    try {
      // Get username - could be from user object or wallet address as fallback
      const username = user?.email || user?.username || walletAddress.slice(0, 8) + '...';
      
      // Track the cafeteria button click in the proper table
      const trackingResult = await trackCafeteriaButtonClick({
        walletAddress,
        username
      });

      if (trackingResult) {
        // Also award gum for the click
        const gumResult = await awardGum(
          walletAddress,
          "cafeteria_visit",
          { username }
        );

        // Dispatch event to update objectives immediately
        window.dispatchEvent(new CustomEvent('cafeteriaButtonClicked', { 
          detail: { walletAddress, username } 
        }));

        if (gumResult.success) {
          alert(`🍽️ Your cafeteria visit has been recorded! +${gumResult.earned} gum awarded!`);
        } else {
          alert('🍽️ Cafeteria visit recorded successfully!');
        }
      } else {
        alert('❌ Failed to record visit. Please try again.');
      }
    } catch (error) {
      console.error('Error clicking cafeteria button:', error);
      alert('❌ Something went wrong. Please try again.');
    } finally {
      setButtonClickLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    // Fallback to blank image if day/night specific images don't exist
    e.currentTarget.src = fallbackImage;
  };

  const openRoom = (roomKey: string, title: string, content: string) => {
    openWindow({
      key: roomKey,
      window: (
        <DraggableResizeableWindow
          windowsId={roomKey}
          headerTitle={title}
          onClose={() => closeWindow(roomKey)}
          initialWidth="min(30vw, 90vw)"
          initialHeight="min(30vh, 60vh)"
          resizable={true}
        >
          <div className="p-3 text-sm leading-relaxed bg-[#1a1a1a] text-white w-full h-full overflow-hidden">
            <h1 className="text-lg mb-2 font-semibold">{title}</h1>
            <p className="text-xs leading-relaxed">{content}</p>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  const openOfficeWithLock = () => {
    openWindow({
      key: WINDOW_IDS.HIGH_SCHOOL_OFFICE_LOCK,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.HIGH_SCHOOL_OFFICE_LOCK}
          headerTitle="Security Access - Principal's Office"
          onClose={() => closeWindow(WINDOW_IDS.HIGH_SCHOOL_OFFICE_LOCK)}
          initialWidth="450px"
          initialHeight="700px"
          resizable={true}
        >
          <DigitalLock 
            onUnlock={() => {
              // Close the lock window
              closeWindow(WINDOW_IDS.HIGH_SCHOOL_OFFICE_LOCK);
              
              // Show success window
              openWindow({
                key: WINDOW_IDS.HIGH_SCHOOL_OFFICE_SUCCESS,
                window: (
                  <DraggableResizeableWindow
                    windowsId={WINDOW_IDS.HIGH_SCHOOL_OFFICE_SUCCESS}
                    headerTitle="🎉 ACCESS GRANTED!"
                    onClose={() => closeWindow(WINDOW_IDS.HIGH_SCHOOL_OFFICE_SUCCESS)}
                    initialWidth="min(500px, 95vw)"
                    initialHeight="min(600px, 90vh)"
                    resizable={true}
                    style={{ background: '#2a2a2a' }}
                  >
                    <div style={{ background: '#2a2a2a', width: '100%', height: '100%' }}>
                      <SuccessWindow 
                      onContinue={() => {
                        closeWindow(WINDOW_IDS.HIGH_SCHOOL_OFFICE_SUCCESS);
                        openRoom(
                          WINDOW_IDS.HIGH_SCHOOL_OFFICE,
                          "Principal's Office",
                          "🔓 ACCESS GRANTED! The desk drawers are slightly open. Student files are scattered about with red marks and strange symbols. You notice a hidden compartment behind the filing cabinet..."
                        );
                      }}
                    />
                    </div>
                  </DraggableResizeableWindow>
                ),
              });
            }}
            onCancel={() => closeWindow(WINDOW_IDS.HIGH_SCHOOL_OFFICE_LOCK)}
          />
        </DraggableResizeableWindow>
      ),
    });
  };

  const openCafeteria = () => {
    openWindow({
      key: WINDOW_IDS.HIGH_SCHOOL_CAFETERIA,
      window: (
        <DraggableResizeableWindow
          windowsId={WINDOW_IDS.HIGH_SCHOOL_CAFETERIA}
          headerTitle="Cafeteria"
          onClose={() => closeWindow(WINDOW_IDS.HIGH_SCHOOL_CAFETERIA)}
          initialWidth="70vw"
          initialHeight="70vh"
          resizable={true}
        >
          <div className="relative w-full h-full bg-[#1a1a1a] text-white overflow-hidden">
            {/* Cafeteria Background Image */}
            <img
              src="/images/locations/cafeteria.png"
              alt="Cafeteria Interior"
              className="absolute inset-0 w-full h-full object-cover z-0"
              onError={(e) => {
                e.currentTarget.src = "/images/backdrops/BLANK.png";
              }}
            />
            
            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 bg-black bg-opacity-50 p-6 flex flex-col justify-between">
              {/* Top Section - Interactive Button */}
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleCafeteriaButtonClick}
                  disabled={!walletAddress || buttonClickLoading}
                  className={`
                    px-6 py-3 rounded-lg font-bold text-white text-lg shadow-lg transition-all duration-200
                    ${walletAddress 
                      ? 'bg-green-600 hover:bg-green-700 hover:scale-105 cursor-pointer' 
                      : 'bg-gray-600 cursor-not-allowed opacity-50'
                    }
                    ${buttonClickLoading ? 'animate-pulse' : ''}
                  `}
                  title={walletAddress ? 'Click to record your cafeteria visit!' : 'Connect wallet to use this feature'}
                >
                  {buttonClickLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Recording...
                    </span>
                  ) : (
                    '🍽️ Check In to Cafeteria'
                  )}
                </button>
              </div>

              {/* Bottom Section - Description */}
              <div className="bg-black bg-opacity-80 p-4 rounded">
                <h1 className="text-2xl mb-3 font-bold">🍽️ Cafeteria</h1>
                <p className="text-sm leading-relaxed mb-3">
                  The heart of student life at Flunks High School. Long tables stretch across the room, 
                  each telling stories of friendships, rivalries, and teenage drama. The lunch counter 
                  still has mysterious stains from the last day before semester zero began. Empty lunch 
                  trays sit abandoned on tables, and a suspicious smell lingers in the air - is it from 
                  the mystery meat or something more sinister? The vending machines hum ominously in 
                  the corner, their lights flickering with an otherworldly glow.
                </p>
                
                {/* Status indicator */}
                <div className="text-xs text-gray-300">
                  {walletAddress ? (
                    <span className="text-green-400">✅ Wallet connected - You can check in!</span>
                  ) : (
                    <span className="text-yellow-400">⚠️ Connect your wallet to record visits</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DraggableResizeableWindow>
      ),
    });
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Image Section */}
      <div className="relative flex-1">
        <img
          src={getCurrentBackground()}
          alt={`High School Background - ${timeBasedInfo.isDay ? 'Day' : 'Night'}`}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500"
          onError={handleImageError}
        />

        {/* Day/Night Atmospheric Overlay */}
        <div 
          className={`absolute inset-0 z-1 transition-all duration-500 ${
            !timeBasedInfo.isDay
              ? 'bg-blue-900 bg-opacity-30' 
              : 'bg-yellow-100 bg-opacity-10'
          }`}
          style={{
            background: !timeBasedInfo.isDay
              ? 'linear-gradient(180deg, rgba(25, 25, 112, 0.3) 0%, rgba(0, 0, 0, 0.4) 100%)'
              : 'linear-gradient(180deg, rgba(255, 255, 224, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)'
          }}
        />

        {/* Time Info Display */}
        <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm z-20">
          Auto: {timeBasedInfo.currentTime}
        </div>
      </div>

      {/* Room Buttons Section */}
      <div className="bg-gray-800 p-4 border-t border-gray-600">
        <div className="flex gap-4 flex-wrap justify-center max-w-4xl mx-auto">
        {/* Hallway */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.HIGH_SCHOOL_HALLWAY,
              "Hallway",
              "Lockers line the walls, covered in mysterious graffiti and faded club posters."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🚪 Hallway
        </button>

        {/* Classroom */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.HIGH_SCHOOL_CLASSROOM,
              "Classroom",
              "Dusty desks with carved initials. The chalkboard still has equations from the last day of school."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          📚 Classroom
        </button>

        {/* Cafeteria */}
        <button
          onClick={openCafeteria}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🍽️ Cafeteria
        </button>

        {/* Gymnasium */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.HIGH_SCHOOL_GYMNASIUM,
              "Gymnasium",
              "The basketball hoops are bent at strange angles. Echoes of old cheers seem to bounce off the walls."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🏀 Gymnasium
        </button>

        {/* Library */}
        <button
          onClick={() =>
            openRoom(
              WINDOW_IDS.HIGH_SCHOOL_LIBRARY,
              "Library",
              "Books are scattered everywhere. One particular book seems to glow faintly on the librarian's desk."
            )
          }
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          📖 Library
        </button>

        {/* Principal's Office */}
        <button
          onClick={openOfficeWithLock}
          className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-200 hover:scale-105 min-w-[120px] text-center"
        >
          🏢 Office
        </button>
        </div>
      </div>
    </div>
  );
};

export default HighSchoolMain;
