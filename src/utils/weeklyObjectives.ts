import { createClient } from '@supabase/supabase-js';
import { checkFridayNightLightsClicked } from './fridayNightLightsTracking';
import { checkCafeteriaButtonClicked } from './cafeteriaButtonTracking';
import { checkFlunkoClicked } from './flunkoClickTracking';
import { checkParadiseMotelEntered } from './paradiseMotelTracking';
import { checkParadiseMotelRoom7NightVisit } from './paradiseMotelRoom7Tracking';
import { checkHiddenRiffCompletion } from './hiddenRiffTracking';
import { checkFourThievesUndergroundAccess } from './fourThievesUndergroundTracking';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: any = null;
let hasValidSupabaseConfig = false;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  hasValidSupabaseConfig = true;
  console.log('✅ Weekly Objectives: Supabase initialized');
} else {
  console.warn('⚠️ Weekly Objectives: Supabase environment variables not found');
}

export interface ChapterObjective {
  id: string;
  title: string;
  description: string;
  type: 'friday_night_lights' | 'crack_code' | 'daily_checkin' | 'picture_day_voting' | 'custom';
  completed: boolean;
  completedAt?: string;
  reward?: number; // gum reward if applicable
}

export interface ObjectiveStatus {
  fridayNightLightsClicked: boolean; // Chapter 1: cafeteria check-in, Chapter 2: Friday Night Lights
  crackedCode: boolean; // Chapter 1 code
  crackedCodeChapter2?: boolean; // Chapter 2 code
  votedInPictureDay?: boolean; // Chapter 3 - Picture Day voting
  completedObjectives: ChapterObjective[];
}
// The Friday Night Lights checking is handled by the imported function
// from fridayNightLightsTracking.ts

// Check if user has cracked the code
export const checkCrackCodeObjective = async (walletAddress: string): Promise<boolean> => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Supabase not configured, cannot check crack code objective');
    return false;
  }

  try {
    console.log('🔍 Checking crack code objective for wallet:', walletAddress);
    
    const { data, error } = await supabase
      .from('digital_lock_attempts')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('code_entered', '8004')
      .eq('success', true)
      .limit(1)
      .order('created_at', { ascending: false }); // Get most recent first

    if (error) {
      console.error('Error checking crack code objective:', error);
      return false;
    }

    const hasCracked = data && data.length > 0;
    console.log('✅ Crack code objective completed:', hasCracked);
    return hasCracked;
  } catch (err) {
    console.error('Failed to check crack code objective:', err);
    return false;
  }
};

// Check if user has cracked the Chapter 2 code (0730)
export const checkCrackCodeObjectiveChapter2 = async (walletAddress: string): Promise<boolean> => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Supabase not configured, cannot check Chapter 2 crack code objective');
    return false;
  }

  try {
    console.log('🔍 Checking Chapter 2 crack code objective for wallet:', walletAddress);
    
    const { data, error } = await supabase
      .from('digital_lock_attempts')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('code_entered', '0730')
      .eq('success', true)
      .limit(1)
      .order('created_at', { ascending: false }); // Get most recent first

    if (error) {
      console.error('Error checking Chapter 2 crack code objective:', error);
      return false;
    }

    const hasCracked = data && data.length > 0;
    console.log('✅ Chapter 2 crack code objective completed:', hasCracked);
    return hasCracked;
  } catch (err) {
    console.error('Failed to check Chapter 2 crack code objective:', err);
    return false;
  }
};

// Check if user has voted for at least one flunk in Picture Day
export const checkPictureDayVoting = async (walletAddress: string): Promise<boolean> => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Supabase not configured, cannot check Picture Day voting objective');
    return false;
  }

  try {
    console.log('🔍 Checking Picture Day voting objective for wallet:', walletAddress);
    
    const { data, error } = await supabase
      .from('picture_day_votes')
      .select('*')
      .eq('user_wallet', walletAddress)
      .limit(1);

    if (error) {
      console.error('Error checking Picture Day voting objective:', error);
      return false;
    }

    const hasVoted = data && data.length > 0;
    console.log('✅ Picture Day voting objective completed:', hasVoted);
    return hasVoted;
  } catch (err) {
    console.error('Failed to check Picture Day voting objective:', err);
    return false;
  }
};

// Get Chapter 1 objectives status for a user
export const getObjectivesStatus = async (walletAddress: string): Promise<ObjectiveStatus> => {
  console.log('🎯 getObjectivesStatus called for wallet:', walletAddress?.slice(0,10) + '...');
  
  const [cafeteriaButtonClicked, crackedCode] = await Promise.all([
    checkCafeteriaButtonClicked(walletAddress),
    checkCrackCodeObjective(walletAddress)
  ]);

  console.log('📊 Objectives status:', { cafeteriaButtonClicked, crackedCode });

  const completedObjectives: ChapterObjective[] = [
    {
      id: 'slacker',
      title: 'The Slacker',
      description: 'Check into the cafeteria',
      type: 'daily_checkin',
      completed: cafeteriaButtonClicked,
      reward: 50
    },
    {
      id: 'overachiever',
      title: 'The Overachiever', 
      description: 'Crack the access code',
      type: 'crack_code',
      completed: crackedCode,
      reward: 100
    }
  ];

  const progress = calculateObjectiveProgress(completedObjectives);
  console.log('🎯 Final progress calculated:', progress + '%');
  
  return {
    fridayNightLightsClicked: cafeteriaButtonClicked, // Keep interface compatible
    crackedCode,
    completedObjectives
  };
};

// Get Chapter 2 objectives status for a user
export const getChapter2ObjectivesStatus = async (walletAddress: string): Promise<ObjectiveStatus> => {
  console.log('🎯 getChapter2ObjectivesStatus called for wallet:', walletAddress?.slice(0,10) + '...');
  
  const [fridayNightLightsClicked, crackedCodeChapter2] = await Promise.all([
    checkFridayNightLightsClicked(walletAddress),
    checkCrackCodeObjectiveChapter2(walletAddress)
  ]);

  console.log('📊 Chapter 2 Objectives status:', { fridayNightLightsClicked, crackedCodeChapter2 });

  const completedObjectives: ChapterObjective[] = [
    {
      id: 'slacker_chapter2',
      title: 'The Slacker',
      description: 'Click the Friday Night Lights button on the football field',
      type: 'friday_night_lights',
      completed: fridayNightLightsClicked,
      reward: 50
    },
    {
      id: 'overachiever_chapter2',
      title: 'The Overachiever', 
      description: 'Find and unlock the trunk',
      type: 'crack_code',
      completed: crackedCodeChapter2,
      reward: 100
    }
  ];

  const progress = calculateObjectiveProgress(completedObjectives);
  console.log('🎯 Chapter 2 Final progress calculated:', progress + '%');
  
  return {
    fridayNightLightsClicked,
    crackedCode: false, // Chapter 1 code not relevant for Chapter 2
    crackedCodeChapter2,
    completedObjectives
  };
};

// Check if user has completed Chapter 3 Overachiever (clicked Flunko)
export async function checkChapter3Overachiever(walletAddress: string): Promise<boolean> {
  // Use the simple tracking approach like Friday Night Lights
  return await checkFlunkoClicked(walletAddress);
}

// Get Chapter 3 objectives status for a user
export const getChapter3ObjectivesStatus = async (walletAddress: string): Promise<ObjectiveStatus> => {
  console.log('🎯 getChapter3ObjectivesStatus called for wallet:', walletAddress?.slice(0,10) + '...');
  
  const votedInPictureDay = await checkPictureDayVoting(walletAddress);
  const completedOverachiever = await checkChapter3Overachiever(walletAddress);

  console.log('📊 Chapter 3 Objectives status:', { votedInPictureDay, completedOverachiever });

  const completedObjectives: ChapterObjective[] = [
    {
      id: 'slacker_chapter3',
      title: 'The Slacker',
      description: 'Vote for a flunk! Log in and vote for at least one flunk in Picture Day',
      type: 'picture_day_voting',
      completed: votedInPictureDay,
      reward: 50
    },
    {
      id: 'overachiever_chapter3',
      title: 'The Overachiever',
      description: 'Find Flunko\'s pic!',
      type: 'custom',
      completed: completedOverachiever,
      reward: 100
    }
  ];

  const progress = calculateObjectiveProgress(completedObjectives);
  console.log('🎯 Chapter 3 Final progress calculated:', progress + '%');
  
  return {
    fridayNightLightsClicked: false, // Not relevant for Chapter 3
    crackedCode: false, // Not relevant for Chapter 3
    votedInPictureDay,
    completedObjectives
  };
};

// Calculate progress percentage
export const calculateObjectiveProgress = (objectives: ChapterObjective[]): number => {
  if (objectives.length === 0) return 0;
  const completed = objectives.filter(obj => obj.completed).length;
  return Math.round((completed / objectives.length) * 100);
};

// Check if user attended homecoming dance (Saturday 24-hour window)
export const checkHomecomingDanceAttendance = async (walletAddress: string): Promise<boolean> => {
  try {
    console.log('🕺 [SUPER SIMPLE] Checking homecoming dance via API for wallet:', walletAddress);
    
    // Use the EXACT SAME API that the button uses to check attendance
    const response = await fetch(`/api/check-homecoming-dance-attendance?walletAddress=${walletAddress}`);
    
    if (!response.ok) {
      console.error('❌ [SUPER SIMPLE] API response not ok:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('📋 [SUPER SIMPLE] API response:', data);
    
    const hasAttended = data.success && data.hasAttended;
    console.log('✅ [SUPER SIMPLE] Final result:', hasAttended);
    
    return hasAttended;

  } catch (err) {
    console.error('💥 [SUPER SIMPLE] API call failed:', err);
    return false;
  }
};

// Check if user entered the paradise motel terminal code
export async function checkParadiseMotelCode(walletAddress: string): Promise<boolean> {
  // Use the simple tracking approach like Friday Night Lights
  return await checkParadiseMotelEntered(walletAddress);
}

// Get Chapter 4 objectives status for a user
export const getChapter4ObjectivesStatus = async (walletAddress: string): Promise<ObjectiveStatus> => {
  console.log('🎯 [CHAPTER4] getChapter4ObjectivesStatus called for wallet:', walletAddress?.slice(0,10) + '...');
  
  const attendedHomecoming = await checkHomecomingDanceAttendance(walletAddress);
  const enteredParadiseCode = await checkParadiseMotelCode(walletAddress);

  console.log('📊 [CHAPTER4] Objectives status:', { 
    attendedHomecoming, 
    enteredParadiseCode,
    walletSlice: walletAddress?.slice(0,10) + '...'
  });

  const completedObjectives: ChapterObjective[] = [
    {
      id: 'slacker_chapter4',
      title: 'The Slacker',
      description: 'Attend the homecoming dance on Saturday (one-time only)',
      type: 'custom',
      completed: attendedHomecoming,
      reward: 50
    },
    {
      id: 'overachiever_chapter4',
      title: 'The Overachiever',
      description: 'Enter the terminal code for the first place we\'ll search for Flunko',
      type: 'custom',
      completed: enteredParadiseCode,
      reward: 100
    }
  ];

  const progress = calculateObjectiveProgress(completedObjectives);
  console.log('🎯 Chapter 4 Final progress calculated:', progress + '%');
  
  return {
    fridayNightLightsClicked: false, // Not relevant for Chapter 4
    crackedCode: false, // Not relevant for Chapter 4
    votedInPictureDay: false, // Not relevant for Chapter 4
    completedObjectives
  };
};

// Get Chapter 5 objectives status for a user
export const getChapter5ObjectivesStatus = async (walletAddress: string): Promise<ObjectiveStatus> => {
  console.log('🎯 [CHAPTER5] getChapter5ObjectivesStatus called for wallet:', walletAddress?.slice(0,10) + '...');
  
  // Check if user visited Room 7 at night (Slacker objective)
  const slackerObjectiveCompleted = await checkParadiseMotelRoom7NightVisit(walletAddress);
  
  // Check if user completed Hidden Riff guitar sequence (Overachiever objective)
  const overachieverObjectiveCompleted = await checkHiddenRiffCompletion(walletAddress);

  console.log('📊 [CHAPTER5] Objectives status:', { 
    slackerObjectiveCompleted, 
    overachieverObjectiveCompleted,
    walletSlice: walletAddress?.slice(0,10) + '...'
  });

  const completedObjectives: ChapterObjective[] = [
    {
      id: 'slacker_chapter5',
      title: 'The Slacker',
      description: 'shhhh, don\'t tell anyone...',
      type: 'custom',
      completed: slackerObjectiveCompleted,
      reward: 50
    },
    {
      id: 'overachiever_chapter5',
      title: 'The Overachiever',
      description: 'Complete the Hidden Riff guitar sequence',
      type: 'custom',
      completed: overachieverObjectiveCompleted,
      reward: 100
    }
  ];

  const progress = calculateObjectiveProgress(completedObjectives);
  console.log('🎯 Chapter 5 Final progress calculated:', progress + '%');
  
  return {
    fridayNightLightsClicked: false, // Not relevant for Chapter 5
    crackedCode: false, // Not relevant for Chapter 5
    votedInPictureDay: false, // Not relevant for Chapter 5
    completedObjectives
  };
};

// Get Chapter 6 objectives status for a user
export const getChapter6ObjectivesStatus = async (walletAddress: string): Promise<ObjectiveStatus> => {
  console.log('🎯 [CHAPTER6] getChapter6ObjectivesStatus called for wallet:', walletAddress?.slice(0,10) + '...');
  
  // Check if user entered snicklefritz password (Slacker objective)
  const slackerObjectiveCompleted = await checkFourThievesUndergroundAccess(walletAddress);
  
  // Overachiever objective - placeholder for now
  const overachieverObjectiveCompleted = false;

  console.log('📊 [CHAPTER6] Objectives status:', { 
    slackerObjectiveCompleted, 
    overachieverObjectiveCompleted,
    walletSlice: walletAddress?.slice(0,10) + '...'
  });

  const completedObjectives: ChapterObjective[] = [
    {
      id: 'slacker_chapter6',
      title: 'The Slacker',
      description: 'Enter the code to gain access to the Underground',
      type: 'custom',
      completed: slackerObjectiveCompleted,
      reward: 75
    },
    {
      id: 'overachiever_chapter6',
      title: 'The Overachiever',
      description: '???',
      type: 'custom',
      completed: overachieverObjectiveCompleted,
      reward: 100
    }
  ];

  const progress = calculateObjectiveProgress(completedObjectives);
  console.log('🎯 Chapter 6 Final progress calculated:', progress + '%');
  
  return {
    fridayNightLightsClicked: false, // Not relevant for Chapter 6
    crackedCode: false, // Not relevant for Chapter 6
    votedInPictureDay: false, // Not relevant for Chapter 6
    completedObjectives
  };
};
