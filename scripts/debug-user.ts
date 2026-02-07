import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.resolve(__dirname, '../.env.local')
dotenv.config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser(email: string) {
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) {
        console.error('Error listing users:', error)
        return
    }

    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase())
    if (!user) {
        console.log(`User ${email} not found`)
        return
    }

    console.log(`Found user: ${user.id}`)

    const { data: credits, error: creditError } = await supabaseAdmin
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (creditError) {
        console.log('No credits record found or error:', creditError.message)
    } else {
        console.log('Credits record:', JSON.stringify(credits, null, 2))
    }

    const { data: transactions, error: transError } = await supabaseAdmin
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

    if (transError) {
        console.log('No transactions found or error:', transError.message)
    } else {
        console.log('\nRecent transactions:')
        transactions?.forEach((t, i) => {
            console.log(`${i + 1}. ${t.created_at} - ${t.transaction_type}: ${t.credits_amount} credits - ${t.description}`)
        })
    }
}

const email = 'lic.msdg.marketing@gmail.com'
checkUser(email)
