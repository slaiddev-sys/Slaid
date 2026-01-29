import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Handle ES modules __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addCreditsToUser(email: string, credits: number, description?: string) {
  try {
    console.log(`🔍 Looking for user with email: ${email}`)
    
    // Find user by email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (userError) {
      console.error('❌ Error fetching users:', userError)
      return false
    }
    
    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
    
    if (!user) {
      console.error(`❌ User not found for email: ${email}`)
      return false
    }
    
    console.log(`✅ Found user: ${user.id} (${user.email})`)
    console.log(`💰 Adding ${credits} credits...`)
    
    // Check if user has existing credits record
    const { data: existingCredits, error: fetchError } = await supabaseAdmin
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = not found, which is OK
      console.error('❌ Error checking existing credits:', fetchError)
      return false
    }
    
    // Add credits to user account - update existing or insert new
    if (existingCredits) {
      const { error: updateError } = await supabaseAdmin
        .from('user_credits')
        .update({
          total_credits: existingCredits.total_credits + credits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      if (updateError) {
        console.error('❌ Failed to update credits:', updateError)
        return false
      }
    } else {
      const { error: insertError } = await supabaseAdmin
        .from('user_credits')
        .insert({
          user_id: user.id,
          total_credits: credits,
          used_credits: 0,
          plan_type: 'free'
        })
      
      if (insertError) {
        console.error('❌ Failed to insert credits:', insertError)
        return false
      }
    }
    
    // Log the transaction (using credits_amount column name)
    const { error: transactionError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        credits_amount: credits,
        transaction_type: 'add',
        description: description || 'Manual credit addition via script'
      })
    
    if (transactionError) {
      console.warn('⚠️ Failed to log transaction (credits were still added):', transactionError)
    }
    
    // Get updated balance
    const { data: updatedCredits, error: balanceError } = await supabaseAdmin
      .rpc('get_user_credits', { p_user_id: user.id })
    
    if (balanceError) {
      console.error('⚠️ Failed to fetch updated balance:', balanceError)
    }
    
    console.log('✅ Credits added successfully!')
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${user.email}`)
    console.log(`   Credits added: ${credits}`)
    if (updatedCredits && updatedCredits[0]) {
      console.log(`   New balance: ${updatedCredits[0].remaining_credits} remaining credits`)
      console.log(`   Total credits: ${updatedCredits[0].total_credits}`)
      console.log(`   Used credits: ${updatedCredits[0].used_credits}`)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Error:', error)
    return false
  }
}

// Main execution
const email = 'jl.prado.diaz@gmail.com'
const credits = 500
const description = 'Manual credit addition - 500 credits'

addCreditsToUser(email, credits, description)
  .then((success) => {
    if (success) {
      console.log('\n🎉 Process completed successfully!')
      process.exit(0)
    } else {
      console.log('\n❌ Process failed. Please check the errors above.')
      process.exit(1)
    }
  })
  .catch((error) => {
    console.error('\n❌ Unexpected error:', error)
    process.exit(1)
  })

