"use client"

import * as React from "react"
import { Flag, AlertTriangle, ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { submitSkillReport } from "@/app/actions"

interface ReportSkillDialogProps {
  skillId: string
  skillTitle: string
}

type ReportReason = "malware_virus" | "prompt_injection" | "phishing_spam" | "copyright" | "other"

export function ReportSkillDialog({ skillId, skillTitle }: ReportSkillDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState<ReportReason>("malware_virus")
  const [details, setDetails] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [statusMessage, setStatusMessage] = React.useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatusMessage(null)

    try {
      const res = await submitSkillReport({
        skillId,
        reason,
        details,
      })

      if (res?.error) {
        setStatusMessage({ type: "error", text: res.error })
      } else {
        setStatusMessage({
          type: "success",
          text: "Thank you for helping keep the community safe. Our security review team has received your report.",
        })
        setDetails("")
        setTimeout(() => {
          setOpen(false)
          setStatusMessage(null)
        }, 2500)
      }
    } catch {
      setStatusMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors gap-1.5"
          >
            <Flag className="w-3.5 h-3.5" />
            Report Issue
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-400 mb-1">
            <AlertTriangle className="w-5 h-5" />
            <DialogTitle className="text-lg font-bold">Report Security or Policy Violation</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Report &ldquo;{skillTitle}&rdquo; if it contains malicious commands, prompt injections, or violates community guidelines.
          </DialogDescription>
        </DialogHeader>

        {statusMessage ? (
          <div
            className={`p-4 rounded-xl border text-sm flex items-start gap-3 my-2 ${
              statusMessage.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
                : "bg-red-500/10 border-red-500/20 text-red-300"
            }`}
          >
            {statusMessage.type === "success" ? (
              <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            )}
            <p>{statusMessage.text}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="report-reason" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Reason for report
              </Label>
              <Select value={reason} onValueChange={(val) => setReason(val as ReportReason)}>
                <SelectTrigger id="report-reason" className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="malware_virus">
                    Malicious Code / Destructive Command (e.g. rm -rf, curl | bash)
                  </SelectItem>
                  <SelectItem value="prompt_injection">
                    Prompt Injection / Secret & Credential Exfiltration
                  </SelectItem>
                  <SelectItem value="phishing_spam">
                    Phishing Links, Spam, or Scam
                  </SelectItem>
                  <SelectItem value="copyright">
                    Plagiarism or Stolen Content
                  </SelectItem>
                  <SelectItem value="other">Other Violation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-details" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Additional Details (Optional)
              </Label>
              <Textarea
                id="report-details"
                placeholder="Describe the dangerous instructions or lines of code you found..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="resize-none h-24 bg-background/50 border-white/10 text-sm"
                maxLength={1000}
              />
            </div>

            <DialogFooter className="mt-6 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                disabled={isSubmitting}
                className="gap-2 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Flag className="w-3.5 h-3.5" /> Submit Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
