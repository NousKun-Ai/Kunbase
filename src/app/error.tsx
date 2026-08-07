"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="flex flex-col items-center justify-center py-16 px-8 border border-red-500/20 rounded-2xl bg-red-500/5 backdrop-blur-md max-w-md text-center shadow-lg shadow-red-500/5">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-8">
          We encountered an unexpected error while trying to load this page.
        </p>
        <div className="flex gap-4">
          <Button onClick={() => reset()} variant="default" className="bg-red-500 hover:bg-red-600 text-white">
            Try again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Go home
          </Button>
        </div>
      </div>
    </div>
  )
}
