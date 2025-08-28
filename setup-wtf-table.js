const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jejycbxxdsrcsobmvbbz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplanljYnh4ZHNyY3NvYm12YmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTk1NjksImV4cCI6MjA2NTY3NTU2OX0.J14zg5h4W_d7SjTN97RbDqCmdAYS9q7x7ZoSxLz0dkE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createWTFTable() {
  try {
    console.log('Creating wtf_command_usage table...')
    
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS wtf_command_usage (
          id SERIAL PRIMARY KEY,
          wallet_address TEXT NOT NULL,
          username TEXT,
          command_used TEXT NOT NULL CHECK (command_used IN ('wtf', 'WTF')),
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          session_info JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_wtf_wallet_address ON wtf_command_usage(wallet_address);
        CREATE INDEX IF NOT EXISTS idx_wtf_executed_at ON wtf_command_usage(executed_at);
        CREATE INDEX IF NOT EXISTS idx_wtf_command_used ON wtf_command_usage(command_used);

        ALTER TABLE wtf_command_usage ENABLE ROW LEVEL SECURITY;
      `
    })

    if (error) {
      console.error('Error creating table:', error)
    } else {
      console.log('✅ wtf_command_usage table created successfully!')
    }

    // Test insertion
    const { data: insertData, error: insertError } = await supabase
      .from('wtf_command_usage')
      .insert([
        {
          wallet_address: '0x1234567890abcdef',
          username: 'test_user',
          command_used: 'wtf'
        }
      ])
      .select()

    if (insertError) {
      console.log('Insert test failed (table might not exist yet):', insertError.message)
      console.log('You may need to create the table manually in Supabase dashboard')
    } else {
      console.log('✅ Test record inserted:', insertData)
      
      // Clean up test record
      await supabase
        .from('wtf_command_usage')
        .delete()
        .eq('wallet_address', '0x1234567890abcdef')
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

createWTFTable()
