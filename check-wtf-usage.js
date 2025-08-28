// Check WTF command usage data
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://jejycbxxdsrcsobmvbbz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImplanljYnh4ZHNyY3NvYm12YmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwOTk1NjksImV4cCI6MjA2NTY3NTU2OX0.J14zg5h4W_d7SjTN97RbDqCmdAYS9q7x7ZoSxLz0dkE'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkWTFUsage() {
  console.log('📊 Checking current WTF command usage...')
  
  const { data, error } = await supabase
    .from('wtf_command_usage')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('❌ Error fetching WTF usage:', error)
  } else {
    console.log(`✅ Found ${data.length} WTF command records:`)
    data.forEach((record, index) => {
      console.log(`${index + 1}. ${record.username || 'Anonymous'} (${record.wallet_address.substring(0, 8)}...) used "${record.command_used}" at ${new Date(record.executed_at).toLocaleString()}`)
    })
    
    if (data.length === 0) {
      console.log('🆕 No WTF commands tracked yet - ready for first user!')
    }
  }

  // Get table info
  const { count } = await supabase
    .from('wtf_command_usage')
    .select('*', { count: 'exact', head: true })

  console.log(`📈 Total WTF commands tracked: ${count || 0}`)
}

checkWTFUsage()
