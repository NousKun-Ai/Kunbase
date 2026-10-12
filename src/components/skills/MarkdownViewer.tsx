"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { sanitizeMarkdownUrl } from "@/lib/security"

interface MarkdownViewerProps {
  content: string
}

export function MarkdownViewer({ content }: MarkdownViewerProps) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none w-full
      prose-headings:font-bold prose-headings:tracking-tight
      prose-a:text-primary hover:prose-a:text-primary/80 prose-a:no-underline
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:bg-muted prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50
    ">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={sanitizeMarkdownUrl}
        components={{
          a: ({ href, children, ...props }) => {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://")
            return (
              <a
                href={href}
                {...props}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

