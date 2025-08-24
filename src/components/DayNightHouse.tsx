import React, { useState, useEffect } from 'react';
import { useHouseImage, useAllHouseImages, getTimeConfig, updateTimeConfig, TimeConfig } from '../utils/dayNightHouses';

/**
 * Component for displaying a house with day/night switching
 */
interface DayNightHouseProps {
  houseId: string;
  className?: string;
  alt?: string;
  onClick?: () => void;
}

export function DayNightHouse({ houseId, className, alt, onClick }: DayNightHouseProps) {
  const { imageUrl, isLoading, isDay } = useHouseImage(houseId);

  if (isLoading) {
    return (
      <div className={`bg-gray-200 animate-pulse ${className}`}>
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className={`bg-red-100 border-2 border-red-300 ${className}`}>
        <div className="flex items-center justify-center h-full">
          <span className="text-red-500">Image not found</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} onClick={onClick}>
      <img 
        src={imageUrl} 
        alt={alt || `${houseId} - ${isDay ? 'Day' : 'Night'}`}
        className="w-full h-full object-cover"
      />
      {/* Optional day/night indicator */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        {isDay ? '☀️ Day' : '🌙 Night'}
      </div>
    </div>
  );
}

/**
 * Component showing all houses with their day/night states
 */
export function AllHousesDisplay() {
  const { houses, isLoading } = useAllHouseImages();

  if (isLoading) {
    return <div className="text-center">Loading houses...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {houses.map((house) => (
        <div key={house.house_id} className="text-center">
          <DayNightHouse 
            houseId={house.house_id} 
            className="w-32 h-32 rounded-lg cursor-pointer hover:scale-105 transition-transform"
          />
          <p className="mt-2 text-sm font-medium">{house.house_name}</p>
          <p className="text-xs text-gray-500">
            {house.is_day_time ? '☀️ Day Mode' : '🌙 Night Mode'}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Admin component for managing time settings
 */
export function TimeConfigAdmin() {
  const [config, setConfig] = useState<TimeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const timeConfig = await getTimeConfig();
      setConfig(timeConfig);
      setIsLoading(false);
    };

    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;

    const success = await updateTimeConfig(config);
    if (success) {
      alert('Time configuration updated successfully!');
    } else {
      alert('Failed to update time configuration');
    }
  };

  if (isLoading) return <div>Loading time configuration...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-xl font-bold mb-6">🌅🌙 Day/Night Time Configuration</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">☀️ Day Starts At:</label>
          <select 
            value={config?.day_start_hour || 6}
            onChange={(e) => setConfig(prev => prev ? {...prev, day_start_hour: parseInt(e.target.value)} : null)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({length: 24}, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? '12 AM (Midnight)' : 
                 i < 12 ? `${i} AM` : 
                 i === 12 ? '12 PM (Noon)' : 
                 `${i-12} PM`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">🌙 Night Starts At:</label>
          <select 
            value={config?.night_start_hour || 20}
            onChange={(e) => setConfig(prev => prev ? {...prev, night_start_hour: parseInt(e.target.value)} : null)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Array.from({length: 24}, (_, i) => (
              <option key={i} value={i}>
                {i === 0 ? '12 AM (Midnight)' : 
                 i < 12 ? `${i} AM` : 
                 i === 12 ? '12 PM (Noon)' : 
                 `${i-12} PM`}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">
            <strong>Current Settings:</strong><br/>
            Day: {config?.day_start_hour === 0 ? '12 AM' : 
                   config?.day_start_hour && config.day_start_hour < 12 ? `${config.day_start_hour} AM` :
                   config?.day_start_hour === 12 ? '12 PM' : 
                   `${config ? config.day_start_hour - 12 : 0} PM`} - {config?.night_start_hour === 0 ? '12 AM' : 
                   config?.night_start_hour && config.night_start_hour < 12 ? `${config.night_start_hour} AM` :
                   config?.night_start_hour === 12 ? '12 PM' : 
                   `${config ? config.night_start_hour - 12 : 8} PM`}<br/>
            Timezone: {config?.timezone || 'America/Chicago'}
          </p>
        </div>

        <button 
          onClick={handleSave}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          💾 Save Configuration
        </button>
      </div>
    </div>
  );
}
