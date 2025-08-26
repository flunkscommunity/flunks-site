import { useState, useEffect } from 'react';

/**
 * Time-based Image Switching System
 * Switches images based on Central Time Zone
 */

export interface TimeBasedImage {
  id: string;
  dayImage: string;
  nightImage: string;
  description?: string;
}

export interface TimeConfig {
  dayStart: number; // Hour in 24-hour format (e.g., 6 = 6 AM)
  nightStart: number; // Hour in 24-hour format (e.g., 20 = 8 PM)
  timezone: string; // IANA timezone identifier
}

// Default configuration
export const DEFAULT_TIME_CONFIG: TimeConfig = {
  dayStart: 6, // 6 AM
  nightStart: 20, // 8 PM
  timezone: 'America/Chicago' // Central Time Zone
};

/**
 * Get current time in specified timezone
 */
export function getCurrentTimeInTimezone(timezone: string = 'America/Chicago'): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
}

/**
 * Check if it's currently day or night based on Central Time
 */
export function isDayTime(config: TimeConfig = DEFAULT_TIME_CONFIG): boolean {
  const now = getCurrentTimeInTimezone(config.timezone);
  const currentHour = now.getHours();
  
  // Day is from dayStart (6 AM) to nightStart (8 PM)
  return currentHour >= config.dayStart && currentHour < config.nightStart;
}

/**
 * Get the appropriate image based on current time
 */
export function getTimeBasedImage(
  dayImage: string, 
  nightImage: string, 
  config: TimeConfig = DEFAULT_TIME_CONFIG
): string {
  return isDayTime(config) ? dayImage : nightImage;
}

/**
 * Get time-based image with live updates
 * Returns an object with current image and time info
 */
export function getTimeBasedImageInfo(
  dayImage: string,
  nightImage: string,
  config: TimeConfig = DEFAULT_TIME_CONFIG
) {
  const isDay = isDayTime(config);
  const currentTime = getCurrentTimeInTimezone(config.timezone);
  
  return {
    currentImage: isDay ? dayImage : nightImage,
    isDay,
    currentTime: currentTime.toLocaleTimeString('en-US', {
      timeZone: config.timezone,
      hour12: true,
      timeZoneName: 'short'
    }),
    nextTransition: isDay ? 
      `Night begins at ${config.nightStart === 12 ? '12 PM' : config.nightStart > 12 ? (config.nightStart - 12) + ' PM' : config.nightStart + ' AM'}` :
      `Day begins at ${config.dayStart === 12 ? '12 PM' : config.dayStart > 12 ? (config.dayStart - 12) + ' PM' : config.dayStart + ' AM'}`
  };
}

/**
 * React hook for time-based images with auto-refresh
 */
export function useTimeBasedImage(
  dayImage: string,
  nightImage: string,
  config: TimeConfig = DEFAULT_TIME_CONFIG,
  refreshInterval: number = 60000 // Check every minute
) {
  const [imageInfo, setImageInfo] = useState(() => 
    getTimeBasedImageInfo(dayImage, nightImage, config)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setImageInfo(getTimeBasedImageInfo(dayImage, nightImage, config));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [dayImage, nightImage, config, refreshInterval]);

  return imageInfo;
}

// Example house configurations
export const HOUSE_CONFIGS: Record<string, TimeBasedImage> = {
  'jocks-house': {
    id: 'jocks-house',
    dayImage: '/images/icons/jocks-house-icon.png',
    nightImage: '/images/icons/jocks-house-icon.png',
    description: 'Jocks House - Day & Night'
  },
  'preps-house': {
    id: 'preps-house',
    dayImage: '/images/icons/preps-house-icon.png',
    nightImage: '/images/icons/preps-house-icon.png',
    description: 'Preps House - Day & Night'
  },
  'geeks-house': {
    id: 'geeks-house',
    dayImage: '/images/icons/geeks-house-icon.png',
    nightImage: '/images/icons/geeks-house-icon.png',
    description: 'Geeks House - Day & Night'
  },
  'freaks-house': {
    id: 'freaks-house',
    dayImage: '/images/icons/freaks-house-icon.png',
    nightImage: '/images/icons/freaks-house-icon.png',
    description: 'Freaks House - Day & Night'
  }
};
