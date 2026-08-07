'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitOnboarding(formData: FormData) {
  const role = formData.get('role') as string
  const use_case = formData.get('use_case') as string
  const referral_source = formData.get('referral_source') as string

  const supabase = await createClient()

  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/login')
  }

  // 1. Update the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role,
      use_case,
      referral_source,
      onboarded: true
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('Error updating profile:', profileError)
    throw new Error('Failed to save onboarding data')
  }

  // 2. Update the user metadata in auth so middleware/callback can read it instantly without db query
  const { error: authError } = await supabase.auth.updateUser({
    data: { onboarded: true }
  })

  if (authError) {
    console.error('Error updating auth metadata:', authError)
    throw new Error('Failed to update auth state')
  }

  // Redirect to home page upon success
  redirect('/')
}
