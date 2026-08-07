import { NextResponse } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const rawNext = searchParams.get('next') ?? '/'
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (token_hash && type) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({ type, token_hash })

    if (!error) {
      const isOnboarded = data.user?.user_metadata?.onboarded === true
      return NextResponse.redirect(`${origin}${isOnboarded ? next : '/onboarding'}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
