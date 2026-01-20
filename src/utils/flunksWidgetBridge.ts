/**
 * FlunksWidgetBridge - TypeScript Interface
 * 
 * Capacitor plugin to sync data with iOS and Android Home Screen widgets
 * 
 * Usage:
 *   import { FlunksWidgetBridge } from '@/utils/flunksWidgetBridge';
 *   
 *   // Update widget with current user data
 *   await FlunksWidgetBridge.updateWidgetData({
 *     gumBalance: 12450,
 *     lockerNumber: 1337,
 *     username: 'FlunkStudent',
 *     dailyClaimed: true,
 *     nextClaimMinutes: 720
 *   });
 */

import { Capacitor, registerPlugin } from '@capacitor/core';

// Type definitions
export interface WidgetData {
  gumBalance: number;
  lockerNumber: number;
  username: string;
  dailyClaimed: boolean;
  nextClaimMinutes: number;
}

export interface WidgetBridgePlugin {
  updateWidgetData(data: WidgetData): Promise<{ success: boolean; message?: string }>;
  refreshWidgets(): Promise<{ success: boolean }>;
  getWidgetData(): Promise<WidgetData>;
  clearWidgetData(): Promise<{ success: boolean }>;
}

// Register the native plugin
const FlunksWidgetBridgeNative = registerPlugin<WidgetBridgePlugin>('FlunksWidgetBridge');

// Check if we're on a supported native platform (iOS or Android)
const isNativePlatform = (): boolean => {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android';
};

// Wrapper with platform check and fallbacks
export const FlunksWidgetBridge = {
  /**
   * Update widget data - call this whenever GUM balance or daily status changes
   */
  async updateWidgetData(data: WidgetData): Promise<{ success: boolean; message?: string }> {
    if (!isNativePlatform()) {
      console.log('[FlunksWidget] Not on native platform, skipping widget update');
      return { success: false, message: 'Widgets only supported on iOS and Android' };
    }
    
    try {
      const result = await FlunksWidgetBridgeNative.updateWidgetData(data);
      console.log('[FlunksWidget] Widget data updated:', data);
      return result;
    } catch (error) {
      console.error('[FlunksWidget] Failed to update widget:', error);
      return { success: false, message: String(error) };
    }
  },

  /**
   * Force refresh all widgets
   */
  async refreshWidgets(): Promise<{ success: boolean }> {
    if (!isNativePlatform()) {
      return { success: false };
    }
    
    try {
      return await FlunksWidgetBridgeNative.refreshWidgets();
    } catch (error) {
      console.error('[FlunksWidget] Failed to refresh widgets:', error);
      return { success: false };
    }
  },

  /**
   * Get current widget data (for debugging)
   */
  async getWidgetData(): Promise<WidgetData | null> {
    if (!isNativePlatform()) {
      return null;
    }
    
    try {
      return await FlunksWidgetBridgeNative.getWidgetData();
    } catch (error) {
      console.error('[FlunksWidget] Failed to get widget data:', error);
      return null;
    }
  },

  /**
   * Clear widget data on logout
   */
  async clearWidgetData(): Promise<{ success: boolean }> {
    if (!isNativePlatform()) {
      return { success: false };
    }
    
    try {
      return await FlunksWidgetBridgeNative.clearWidgetData();
    } catch (error) {
      console.error('[FlunksWidget] Failed to clear widget data:', error);
      return { success: false };
    }
  },

  /**
   * Check if widgets are available on this platform
   */
  isAvailable(): boolean {
    return isNativePlatform();
  }
};

export default FlunksWidgetBridge;
