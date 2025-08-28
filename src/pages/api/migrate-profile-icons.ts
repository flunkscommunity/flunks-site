// Admin API endpoint to migrate existing profiles to new icon system
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// New default icon for updated profiles
const NEW_DEFAULT_ICON = '🤓';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Simple admin key check (replace with your actual admin authentication)
  const { admin_key } = req.body;
  if (admin_key !== 'flunks_admin_2025') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🔄 Starting profile icon migration...');

    // Step 1: Get all users with old/missing icons
    const { data: usersToUpdate, error: fetchError } = await supabase
      .from('user_profiles')
      .select('id, wallet_address, username, profile_icon')
      .or('profile_icon.is.null,profile_icon.eq.,profile_icon.eq.🎭,profile_icon.like.%FlunkBot%,profile_icon.like.%/images/%');

    if (fetchError) {
      console.error('❌ Error fetching users to update:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    if (!usersToUpdate || usersToUpdate.length === 0) {
      return res.status(200).json({ 
        message: 'No users need icon updates', 
        updated_count: 0 
      });
    }

    console.log(`📊 Found ${usersToUpdate.length} users to update:`, 
      usersToUpdate.map(u => ({ username: u.username, old_icon: u.profile_icon }))
    );

    // Step 2: Update all users to use new default icon
    const { data: updatedUsers, error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        profile_icon: NEW_DEFAULT_ICON,
        updated_at: new Date().toISOString()
      })
      .in('id', usersToUpdate.map(u => u.id))
      .select('username, profile_icon');

    if (updateError) {
      console.error('❌ Error updating users:', updateError);
      return res.status(500).json({ error: 'Failed to update users' });
    }

    console.log('✅ Successfully updated users:', updatedUsers);

    // Step 3: Get final statistics
    const { data: stats, error: statsError } = await supabase
      .from('user_profiles')
      .select('profile_icon')
      .not('profile_icon', 'is', null);

    const iconCounts: Record<string, number> = {};
    if (!statsError && stats) {
      stats.forEach(user => {
        iconCounts[user.profile_icon] = (iconCounts[user.profile_icon] || 0) + 1;
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile icon migration completed successfully',
      updated_count: updatedUsers?.length || 0,
      updated_users: updatedUsers?.map(u => u.username) || [],
      new_default_icon: NEW_DEFAULT_ICON,
      icon_distribution: iconCounts
    });

  } catch (error) {
    console.error('🔥 Profile migration error:', error);
    return res.status(500).json({ 
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
