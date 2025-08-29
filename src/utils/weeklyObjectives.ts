import { supabase, hasValidSupabaseConfig } from '../lib/supabase';

export interface WeeklyObjective {
  id: string;
  title: string;
  description: string;
  type: 'cafeteria_click' | 'crack_code' | 'daily_checkin' | 'custom';
  completed: boolean;
  completedAt?: string;
  reward?: number; // gum reward if applicable
}

export interface ObjectiveStatus {
  cafeteriaClicked: boolean;
  crackedCode: boolean;
  completedObjectives: WeeklyObjective[];
}

// Check if user has clicked cafeteria button
export const checkCafeteriaObjective = async (walletAddress: string): Promise<boolean> => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Supabase not configured, cannot check cafeteria objective');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('cafeteria_button_clicks')
      .select('*')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (error) {
      console.error('Error checking cafeteria objective:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('Failed to check cafeteria objective:', err);
    return false;
  }
};

// Check if user has cracked the code
export const checkCrackCodeObjective = async (walletAddress: string): Promise<boolean> => {
  if (!hasValidSupabaseConfig || !supabase) {
    console.warn('Supabase not configured, cannot check crack code objective');
    return false;
  }

  try {
    const { data, error } = await supabase
      .from('crack_the_code')
      .select('*')
      .eq('wallet_address', walletAddress)
      .limit(1);

    if (error) {
      console.error('Error checking crack code objective:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (err) {
    console.error('Failed to check crack code objective:', err);
    return false;
  }
};

// Get all weekly objectives status for a user
export const getWeeklyObjectivesStatus = async (walletAddress: string): Promise<ObjectiveStatus> => {
  const [cafeteriaClicked, crackedCode] = await Promise.all([
    checkCafeteriaObjective(walletAddress),
    checkCrackCodeObjective(walletAddress)
  ]);

  const completedObjectives: WeeklyObjective[] = [
    {
      id: 'slacker',
      title: 'The Slacker',
      description: 'Find and click the cafeteria button',
      type: 'cafeteria_click',
      completed: cafeteriaClicked,
      reward: 5
    },
    {
      id: 'overachiever',
      title: 'The Overachiever', 
      description: 'Crack the access code',
      type: 'crack_code',
      completed: crackedCode,
      reward: 10
    }
  ];

  return {
    cafeteriaClicked,
    crackedCode,
    completedObjectives
  };
};

// Calculate progress percentage
export const calculateObjectiveProgress = (objectives: WeeklyObjective[]): number => {
  if (objectives.length === 0) return 0;
  const completed = objectives.filter(obj => obj.completed).length;
  return Math.round((completed / objectives.length) * 100);
};
