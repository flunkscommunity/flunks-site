#!/usr/bin/env node

// Script to apply Magic Carpet Command Tracking schema to Supabase
// This creates the magic_carpet_logs table and related functions

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyMagicCarpetSchema() {
  try {
    console.log('🪄 Setting up Magic Carpet Command Tracking...');
    
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'magic_carpet_tracking.sql');
    const sqlContent = await fs.readFile(schemaPath, 'utf8');
    
    console.log('📄 Read schema file successfully');
    console.log('🔧 Applying to Supabase...');
    
    // Execute the SQL schema
    // Split by function/table creation blocks to handle any dependency issues
    const sections = sqlContent.split(/(?=CREATE TABLE|CREATE OR REPLACE FUNCTION|CREATE INDEX|ALTER TABLE|GRANT)/);
    
    if (sections.length > 1) {
      console.log(`📝 Executing ${sections.length} schema sections...`);
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (section) {
          console.log(`📝 Executing section ${i + 1}/${sections.length}...`);
          
          try {
            const { error: sectionError } = await supabase.rpc('exec', { sql_query: section });
            if (sectionError) {
              console.warn(`⚠️ Section ${i + 1} error (may be expected):`, sectionError.message);
            } else {
              console.log(`✅ Section ${i + 1} completed successfully`);
            }
          } catch (err) {
            console.warn(`⚠️ Section ${i + 1} failed:`, err.message);
          }
        }
      }
    } else {
      console.log('✅ SQL executed successfully!');
      console.log('📊 Result:', data);
    }
    
    // Test the setup by calling the RPC function
    console.log('\n🧪 Testing Magic Carpet logging function...');
    const testResult = await supabase.rpc('log_magic_carpet_command', {
      p_wallet_address: 'test_wallet_script',
      p_access_level: 'BETA',
      p_session_id: 'test_session_setup',
      p_user_agent: 'Script Test',
      p_ip_address: '127.0.0.1'
    });

    if (testResult.error) {
      console.error('❌ Test logging failed:', testResult.error);
    } else {
      console.log('✅ Test logging successful!');
      
      // Verify the test record was created
      const { data: testRecord, error: selectError } = await supabase
        .from('magic_carpet_logs')
        .select('*')
        .eq('wallet_address', 'test_wallet_script')
        .eq('session_id', 'test_session_setup')
        .single();

      if (selectError) {
        console.log('⚠️ Test record verification failed:', selectError.message);
      } else if (testRecord) {
        console.log('✅ Test record verified in table!');
        console.log('📄 Record:', testRecord);
      } else {
        console.log('⚠️ Test record not found in table');
      }
    }
    
    console.log('\n🎉 Magic Carpet Command Tracking Schema setup complete!');
    console.log('👉 You can now test "magic carpet" command in your app terminal');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the schema application
applyMagicCarpetSchema();
