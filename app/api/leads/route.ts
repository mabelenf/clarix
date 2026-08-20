// Save this file at: app/api/leads/route.ts

import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const VALID_INTENTS = ['diagnosis', 'session']

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase env vars at runtime')
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()
    const { firstName, lastName, role, company, email, intent, subscribeUpdates } = body

    if (!firstName || !lastName || !role || !company || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!VALID_INTENTS.includes(intent)) {
      return NextResponse.json({ error: 'Invalid intent' }, { status: 400 })
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const { error } = await supabase.from('leads').insert({
      first_name: String(firstName).trim().slice(0, 200),
      last_name: String(lastName).trim().slice(0, 200),
      role: String(role).trim().slice(0, 200),
      company: String(company).trim().slice(0, 200),
      email: String(email).trim().toLowerCase().slice(0, 320),
      intent,
      subscribe_updates: Boolean(subscribeUpdates),
      submitted_at: new Date().toISOString(),
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Could not save your info' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('Leads API error:', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
