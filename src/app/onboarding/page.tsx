'use client'

import { useState } from 'react'
import { submitOnboarding } from './actions'
import { Logo } from '@/components/ui/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'Saving...' : 'Finish'}
    </Button>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState('')
  const [referral, setReferral] = useState('')

  const handleNext = () => {
    if (role && referral) {
      setStep(2)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-center mb-6">
          <Logo className="w-8 h-8" />
        </div>
        
        <form action={submitOnboarding} className="space-y-6">
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-2xl font-bold text-center mb-8">Welcome to Kunbase</h1>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">What best describes you? *</Label>
                  <Select name="role" value={role} onValueChange={(v) => setRole(v ?? '')} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="Designer">Designer</SelectItem>
                      <SelectItem value="Product Manager">Product Manager</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral_source">Where did you hear about us? *</Label>
                  <Select name="referral_source" value={referral} onValueChange={(v) => setReferral(v ?? '')} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Twitter / X">Twitter / X</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="GitHub">GitHub</SelectItem>
                      <SelectItem value="Friend / Colleague">Friend / Colleague</SelectItem>
                      <SelectItem value="Search Engine">Search Engine</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="button" 
                  className="w-full mt-4" 
                  onClick={handleNext}
                  disabled={!role || !referral}
                >
                  Continue
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-4">
                  We will never share your information with anyone else.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h1 className="text-2xl font-bold text-center mb-2">What will you use Kunbase for?</h1>
              <p className="text-sm text-center text-muted-foreground mb-8">
                This helps us create a better experience.
              </p>
              
              {/* Pass the step 1 values as hidden inputs so they submit with the form */}
              <input type="hidden" name="role" value={role} />
              <input type="hidden" name="referral_source" value={referral} />
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-zinc-50 dark:has-[:checked]:bg-zinc-800/50">
                  <input type="radio" name="use_case" value="Work" className="sr-only" required />
                  <span className="w-full text-center font-medium">Work</span>
                </label>
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-zinc-50 dark:has-[:checked]:bg-zinc-800/50">
                  <input type="radio" name="use_case" value="Personal" className="sr-only" required />
                  <span className="w-full text-center font-medium">Personal</span>
                </label>
                <label className="flex items-center p-4 border rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors has-[:checked]:border-primary has-[:checked]:bg-zinc-50 dark:has-[:checked]:bg-zinc-800/50">
                  <input type="radio" name="use_case" value="Education" className="sr-only" required />
                  <span className="w-full text-center font-medium">Education</span>
                </label>
              </div>

              <div className="mt-8 flex gap-3">
                <Button type="button" variant="outline" className="w-1/3" onClick={() => setStep(1)}>
                  Back
                </Button>
                <div className="w-2/3">
                  <SubmitButton />
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            <div className={`h-1 rounded-full transition-all duration-300 ${step === 1 ? 'w-6 bg-zinc-800 dark:bg-zinc-200' : 'w-4 bg-zinc-200 dark:bg-zinc-800'}`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${step === 2 ? 'w-6 bg-zinc-800 dark:bg-zinc-200' : 'w-4 bg-zinc-200 dark:bg-zinc-800'}`} />
          </div>
        </form>
      </div>
    </div>
  )
}
