// Client-side profile icon migration tool
// Run this in browser console to update existing users

console.log('🚀 Starting Profile Icon Migration...');

// Function to test and migrate profile icons
async function migrateProfileIcons() {
  try {
    const response = await fetch('/api/migrate-profile-icons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        admin_key: 'flunks_admin_2025'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Migration successful!', result);
      console.log(`📊 Updated ${result.updated_count} users`);
      console.log(`🎨 New default icon: ${result.new_default_icon}`);
      console.log('📈 Icon distribution:', result.icon_distribution);
      
      if (result.updated_users && result.updated_users.length > 0) {
        console.log('👥 Updated users:', result.updated_users);
      }
      
      // Refresh the page to see changes
      setTimeout(() => {
        console.log('🔄 Refreshing page to show updated icons...');
        window.location.reload();
      }, 2000);
      
    } else {
      console.error('❌ Migration failed:', result);
    }
    
  } catch (error) {
    console.error('🔥 Migration error:', error);
  }
}

// Run the migration
migrateProfileIcons();
