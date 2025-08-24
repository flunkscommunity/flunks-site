import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface HouseImage {
  house_id: string;
  house_name: string;
  current_image_url: string;
  day_image_url: string;
  night_image_url: string;
  is_day_time: boolean;
  current_central_time: string;
  description?: string;
}

export interface TimeConfig {
  config_name: string;
  day_start_hour: number;
  night_start_hour: number;
  timezone: string;
  is_active: boolean;
}

/**
 * Fetch current house image from Supabase based on Central Time
 */
export async function getHouseImage(houseId: string): Promise<string | null> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return null;
    }

    const { data, error } = await supabase
      .rpc('get_house_image', { house_id_param: houseId });

    if (error) {
      console.error('Error fetching house image:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getHouseImage:', error);
    return null;
  }
}

/**
 * Fetch all houses with their current appropriate images
 */
export async function getAllHousesWithCurrentImages(): Promise<HouseImage[]> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return [];
    }

    const { data, error } = await supabase
      .from('house_images_current')
      .select('*');

    if (error) {
      console.error('Error fetching house images:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllHousesWithCurrentImages:', error);
    return [];
  }
}

/**
 * Check if it's currently day time in Central Time
 */
export async function isDayTime(): Promise<boolean> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, defaulting to day time');
      return true;
    }

    const { data, error } = await supabase
      .rpc('is_day_time');

    if (error) {
      console.error('Error checking day time:', error);
      return true; // Default to day if error
    }

    return data;
  } catch (error) {
    console.error('Error in isDayTime:', error);
    return true;
  }
}

/**
 * Get current time configuration
 */
export async function getTimeConfig(): Promise<TimeConfig | null> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return null;
    }

    const { data, error } = await supabase
      .from('time_config')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching time config:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getTimeConfig:', error);
    return null;
  }
}

/**
 * Update time configuration (admin only)
 */
export async function updateTimeConfig(config: Partial<TimeConfig>): Promise<boolean> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured');
      return false;
    }

    // First, deactivate all configs
    await supabase
      .from('time_config')
      .update({ is_active: false })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    // Then insert or update the new config
    const { error } = await supabase
      .from('time_config')
      .upsert({
        ...config,
        is_active: true
      });

    if (error) {
      console.error('Error updating time config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateTimeConfig:', error);
    return false;
  }
}

/**
 * React hook for a single house image with auto-refresh
 */
export function useHouseImage(
  houseId: string,
  refreshInterval: number = 60000 // Check every minute
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDay, setIsDay] = useState<boolean>(true);

  useEffect(() => {
    const fetchImage = async () => {
      setIsLoading(true);
      const url = await getHouseImage(houseId);
      const dayTime = await isDayTime();
      setImageUrl(url);
      setIsDay(dayTime);
      setIsLoading(false);
    };

    // Initial fetch
    fetchImage();

    // Set up interval for updates
    const interval = setInterval(fetchImage, refreshInterval);

    return () => clearInterval(interval);
  }, [houseId, refreshInterval]);

  return { imageUrl, isLoading, isDay };
}

/**
 * React hook for all houses with auto-refresh
 */
export function useAllHouseImages(refreshInterval: number = 60000) {
  const [houses, setHouses] = useState<HouseImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHouses = async () => {
      setIsLoading(true);
      const housesData = await getAllHousesWithCurrentImages();
      setHouses(housesData);
      setIsLoading(false);
    };

    // Initial fetch
    fetchHouses();

    // Set up interval for updates
    const interval = setInterval(fetchHouses, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { houses, isLoading };
}
