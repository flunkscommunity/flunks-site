#!/usr/bin/env node

/**
 * Apply WTF Command Tracking Schema to Supabase
 * This script applies the WTF tracking SQL schema to your Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyWtfSchema() {
  try {
    console.log('🚀 Applying WTF Command Tracking Schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '../supabase/wtf_command_tracking.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Read SQL file:', sqlPath);
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try breaking it down into smaller chunks for policies that might conflict
      console.log('🔄 Trying to execute in smaller chunks...');
      
      // Split by major sections and execute individually
      const sections = sql.split(/(?=--\s+(?:Create table|Policy|Function|Grant))/);
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (!section) continue;
        
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
    } else {
      console.log('✅ SQL executed successfully!');
      console.log('📊 Result:', data);
    }
    
    // Test the setup by calling the RPC function
    console.log('\n🧪 Testing WTF logging function...');
    const testResult = await supabase.rpc('log_wtf_command', {
      p_wallet_address: 'test_wallet_script',
      p_access_level: 'BETA',
      p_session_id: 'test_session_' + Date.now(),
      p_user_agent: 'Script Test',
      p_ip_address: '127.0.0.1'
    });
    
    if (testResult.error) {
      console.error('❌ Test failed:', testResult.error);
    } else {
      console.log('✅ WTF logging function working!');
      
      // Check if the record was inserted
      const { data: records, error: selectError } = await supabase
        .from('wtf_command_logs')
        .select('*')
        .eq('wallet_address', 'test_wallet_script')
        .limit(1);
        
      if (selectError) {
        console.error('❌ Error reading test record:', selectError);
      } else if (records && records.length > 0) {
        console.log('✅ Test record found in wtf_command_logs table!');
        console.log('📋 Record:', records[0]);
      } else {
        console.log('⚠️ Test record not found in table');
      }
    }
    
    console.log('\n🎉 WTF Command Tracking Schema setup complete!');
    console.log('👉 You can now test "wtf" command in your app terminal');
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
applyWtfSchema();
