// Activity Tracking Utilities for Supabase Integration
// This file contains centralized tracking functions for user activities

import { supabase, hasValidSupabaseConfig } from '../lib/supabase';

export interface ProfileActivationData {
  wallet_address: string | null;
  activation_step: string;
  step_data: any;
  session_id: string | null;
  timestamp?: string;
}

export interface TerminalActivityData {
  wallet_address: string | null;
  command_entered: string;
  command_type: string;
  response_given: string;
  success: boolean;
  session_id: string | null;
  timestamp?: string;
}

/**
 * Track user profile activation events
 * @param walletAddress - User's wallet address (can be null for trial mode)
 * @param activationStep - The specific step being tracked
 * @param stepData - Additional data specific to this step
 * @param sessionId - Session identifier for grouping related activities
 */
export const trackProfileActivation = async (
  walletAddress: string | null,
  activationStep: string,
  stepData: any,
  sessionId: string | null
): Promise<void> => {
  try {
    const data: ProfileActivationData = {
      wallet_address: walletAddress,
      activation_step: activationStep,
      step_data: stepData,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    };

    // Log to console for development
    console.log('Profile Activation Tracked:', data);
    
    // Save to Supabase database only if configured
    if (hasValidSupabaseConfig && supabase) {
      const { error } = await supabase.from('profile_activations').insert(data);
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } else {
      console.log('Supabase not configured - tracking locally only');
    }
    
  } catch (error) {
    console.error('Failed to track profile activation:', error);
  }
};

/**
 * Track terminal command activities
 * @param walletAddress - User's wallet address (can be null for anonymous users)
 * @param command - The command that was entered
 * @param commandType - Type of command (code, system, unknown)
 * @param response - The response given to the user
 * @param success - Whether the command was valid/successful
 * @param sessionId - Session identifier for grouping related activities
 */
export const trackTerminalActivity = async (
  walletAddress: string | null,
  command: string,
  commandType: string,
  response: string,
  success: boolean,
  sessionId: string | null
): Promise<void> => {
  try {
  const data: TerminalActivityData = {
      wallet_address: walletAddress,
      command_entered: command,
      command_type: commandType,
      response_given: response,
      success: success,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    };

    // Log to console for development
    console.log('Terminal Activity Tracked:', data);
    
    // Save to Supabase database only if configured
    if (hasValidSupabaseConfig && supabase) {
      // First attempt with current schema (command_entered)
      let { error } = await supabase.from('terminal_activities').insert(data as any);
      if (error) {
        console.error('Supabase insert error (command_entered):', error);
        // If the remote schema doesn't have command_entered, retry with legacy column name
        const message = (error as any)?.message || '';
        if (message.includes("command_entered") || (error as any)?.code === 'PGRST204') {
          const legacyData: any = {
            wallet_address: walletAddress,
            command_input: command,
            command_type: commandType,
            response_given: response,
            success: success,
            session_id: sessionId,
            timestamp: new Date().toISOString()
          };
          const retry = await supabase.from('terminal_activities').insert(legacyData);
          if (retry.error) {
            console.error('Supabase retry error (command_input):', retry.error);
            throw retry.error;
          }
        } else {
          throw error;
        }
      }
    } else {
      console.log('Supabase not configured - tracking locally only');
    }
    
  } catch (error) {
    console.error('Failed to track terminal activity:', error);
  }
};

/**
 * Generate a unique session ID for tracking related activities
 * @returns A unique session identifier
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Common profile activation step constants
 */
export const PROFILE_STEPS = {
  PROFILE_CREATED: 'profile_created',
  PROFILE_UPDATED: 'profile_updated',
  USERNAME_SET: 'username_set',
  DISCORD_LINKED: 'discord_linked',
  PROFILE_COMPLETED: 'profile_completed',
  PROFILE_CREATION_STARTED: 'profile_creation_started',
  PROFILE_UPDATE_STARTED: 'profile_update_started',
  PROFILE_CREATION_FAILED: 'profile_creation_failed',
  PROFILE_UPDATE_FAILED: 'profile_update_failed',
  PROFILE_CREATION_ERROR: 'profile_creation_error',
  PROFILE_UPDATE_ERROR: 'profile_update_error'
} as const;

/**
 * Common terminal command type constants
 */
export const COMMAND_TYPES = {
  CODE: 'code',
  SYSTEM: 'system',
  HELP: 'help',
  UNKNOWN: 'unknown'
} as const;
