"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle, Loader2 } from "lucide-react"
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
import { deleteSkillAction } from "@/app/actions"

interface DeleteSkillDialogProps {
  skillId: string
  skillTitle: string
  skillType?: "skill" | "prompt"
  username: string
  variant?: "button" | "danger-zone" | "icon"
  className?: string
}

export function DeleteSkillDialog({
  skillId,
  skillTitle,
  skillType = "skill",
  username,
  variant = "button",
  className = "",
}: DeleteSkillDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()

  const typeLabel = skillType === "prompt" ? "Prompt" : "Skill"

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const res = await deleteSkillAction(skillId)
      if (res?.error) {
        setError(res.error)
        setIsDeleting(false)
        return
      }

      setOpen(false)
      // Refresh cache so the item disappears immediately
      router.refresh()
      // If currently on the skill's detail page, redirect back to the user's profile
      if (typeof window !== "undefined" && window.location.pathname.includes(`/${username}/`)) {
        router.push(`/${username}`)
      }
    } catch (err) {
      console.error("Error deleting skill:", err)
      setError("An unexpected error occurred while deleting. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          variant === "danger-zone" ? (
            <Button
              variant="outline"
              size="sm"
              className={`w-full justify-start text-xs text-red-400 hover:text-red-300 border-red-500/30 hover:border-red-500/50 bg-red-500/10 hover:bg-red-500/20 transition-colors ${className}`}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2 shrink-0" />
              Delete this {typeLabel}
            </Button>
          ) : variant === "icon" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={`h-7 px-2 text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors gap-1.5 ${className}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400/80" />
              Delete
            </Button>
          ) : (
            <Button
              variant="outline"
              size="default"
              className={`text-red-400 hover:text-red-300 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/10 transition-colors ${className}`}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-[460px] bg-card/95 border-red-500/30 backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <div className="w-10 h-10 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-white">
            Delete {typeLabel}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete <strong className="text-white font-medium">&quot;{skillTitle}&quot;</strong>? This action is permanent and cannot be undone. All stars, copy counts, and content will be removed from Kunbase.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-end pt-4 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={isDeleting}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 text-white font-medium text-xs gap-1.5"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                Yes, Delete Permanently
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
