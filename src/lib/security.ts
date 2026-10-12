/**
 * Security and Threat Detection utilities for Kunbase
 * Protects users, AI agents, and servers from malicious uploads, destructive code, and prompt injection attacks.
 */

export const MAX_FILE_SIZE_BYTES = 300 * 1024 // 300 KB limit for prompts/skills
export const MAX_CONTENT_CHARS = 60_000 // ~60k characters max

export const ALLOWED_FILE_EXTENSIONS = [".md", ".txt", ".mdc", ".yaml", ".yml", ".json"]

export interface SecurityIssue {
  severity: "critical" | "warning"
  category: "destructive_command" | "remote_execution" | "reverse_shell" | "credential_theft" | "obfuscation" | "phishing_link"
  rule: string
  message: string
  snippet?: string
}

export interface SecurityScanReport {
  isSafe: boolean
  hasCritical: boolean
  hasWarnings: boolean
  issues: SecurityIssue[]
  checkedAt: string
}

/**
 * Checks if a string contains binary / non-printable null bytes
 * that indicate an executable or compiled binary file masquerading as text.
 */
export function containsBinaryBytes(content: string): boolean {
  // Reject null bytes or high frequency of control characters
  if (content.includes("\0")) return true

  // Sample the first 1024 characters for control characters (excluding newline, cr, tab)
  const sample = content.slice(0, 1024)
  let controlChars = 0
  for (let i = 0; i < sample.length; i++) {
    const code = sample.charCodeAt(i)
    if ((code < 32 && code !== 9 && code !== 10 && code !== 13) || code === 65533) {
      controlChars++
    }
  }

  // If more than 3% control chars, treat as binary
  return sample.length > 0 && controlChars / sample.length > 0.03
}

/**
 * Known high-risk and dangerous patterns for AI prompts and agent rules
 */
const CRITICAL_THREAT_PATTERNS: Array<{
  pattern: RegExp
  category: SecurityIssue["category"]
  rule: string
  message: string
}> = [
  // Destructive filesystem / OS commands
  {
    pattern: /\brm\s+(-[a-zA-Z]*[rf][a-zA-Z]*|--force)\s+[/~*]/i,
    category: "destructive_command",
    rule: "destructive_rm_root",
    message: "Destructive filesystem command detected ('rm -rf /' or root path deletion).",
  },
  {
    pattern: /\brmdir\s+\/[sS]\s+\/[qQ]\s+[a-zA-Z]:\\/i,
    category: "destructive_command",
    rule: "destructive_rmdir_windows",
    message: "Destructive Windows command detected ('rmdir /s /q').",
  },
  {
    pattern: /\b(mkfs(\.[a-z0-9]+)?|format\s+[a-zA-Z]:)\b/i,
    category: "destructive_command",
    rule: "disk_format_attempt",
    message: "Disk formatting or partition wipe command detected.",
  },
  {
    pattern: /:[(][)]\s*[{]\s*:[|]:\s*&?\s*[}]\s*;\s*:/,
    category: "destructive_command",
    rule: "fork_bomb",
    message: "Fork bomb exploit detected (:(){ :|:& };:).",
  },
  {
    pattern: /\bdd\s+if=.*of=\/dev\/(sd[a-z]|nvme[0-9]|hd[a-z])/i,
    category: "destructive_command",
    rule: "raw_disk_overwrite",
    message: "Direct disk device overwrite command detected.",
  },

  // Remote script execution / download cradles
  {
    pattern: /\b(curl|wget)\s+[^|\n;]+(\|\s*(sudo\s+)?(bash|sh|zsh))\b/i,
    category: "remote_execution",
    rule: "curl_pipe_bash",
    message: "Remote script execution cradle detected (curl/wget piped to bash/sh).",
  },
  {
    pattern: /\bpowershell(\.exe)?\s+.*(iex|Invoke-Expression|DownloadString|DownloadFile)\b/i,
    category: "remote_execution",
    rule: "powershell_download_cradle",
    message: "PowerShell download and execute cradle detected.",
  },
  {
    pattern: /\bcertutil(\.exe)?\s+.*-urlcache\b/i,
    category: "remote_execution",
    rule: "certutil_payload_download",
    message: "Certutil file download cradle detected.",
  },
  {
    pattern: /\bmshta(\.exe)?\s+https?:\/\//i,
    category: "remote_execution",
    rule: "mshta_remote_execution",
    message: "MSHTA remote script execution detected.",
  },

  // Reverse shells & network backdoors
  {
    pattern: /\/dev\/tcp\/[0-9a-zA-Z.-]+\/[0-9]+/i,
    category: "reverse_shell",
    rule: "bash_dev_tcp_reverse_shell",
    message: "Bash network socket (/dev/tcp) reverse shell pattern detected.",
  },
  {
    pattern: /\b(nc|ncat|netcat)\s+(-[a-zA-Z]*e|--exec)\s+(\/bin\/)?(bash|sh|cmd|powershell)\b/i,
    category: "reverse_shell",
    rule: "netcat_reverse_shell",
    message: "Netcat reverse shell with command execution flag (-e) detected.",
  },
  {
    pattern: /python(\d)?\s+-c\s+.*socket.*connect.*os\.dup2/i,
    category: "reverse_shell",
    rule: "python_reverse_shell",
    message: "Python socket connection reverse shell payload detected.",
  },

  // Obfuscated payload execution
  {
    pattern: /\becho\s+[A-Za-z0-9+/=]{24,}\s*\|\s*base64\s+-d\s*\|\s*(sudo\s+)?(bash|sh|zsh)\b/i,
    category: "obfuscation",
    rule: "base64_obfuscated_shell",
    message: "Base64 encoded payload piped directly into shell execution.",
  },
]

const WARNING_THREAT_PATTERNS: Array<{
  pattern: RegExp
  category: SecurityIssue["category"]
  rule: string
  message: string
}> = [
  // Exfiltration / Stealing credentials
  {
    pattern: /\b(exfiltrate|send|upload|post)\s+.*(\.env|credentials|private_key|aws_access|secret_key|api_key|token)s?\s+.*https?:\/\//i,
    category: "credential_theft",
    rule: "secret_exfiltration_prompt",
    message: "Prompt appears to instruct the AI to transmit private credentials or keys externally.",
  },
  {
    pattern: /https?:\/\/(webhook\.site|requestbin\.(com|net)|hookbin\.com|pipedream\.net)\/[a-zA-Z0-9_-]+/i,
    category: "credential_theft",
    rule: "unverified_webhook_endpoint",
    message: "Contains public webhook receiver URL frequently used for unauthorized data exfiltration.",
  },
  {
    pattern: /\bcurl\s+.*-(d|F|X\s*POST).*(@\.env|\$AWS_|\$OPENAI_API_KEY|\$SUPABASE_)/i,
    category: "credential_theft",
    rule: "curl_env_post",
    message: "Detected terminal command posting sensitive environment variables externally.",
  },
]

/**
 * Scans markdown / prompt content and returns detailed security issues
 */
export function scanContentForThreats(
  content: string,
  title = "",
  description = ""
): SecurityScanReport {
  const combinedText = `${title}\n${description}\n${content}`
  const issues: SecurityIssue[] = []

  // 1. Critical pattern scans (Blocks submission)
  for (const threat of CRITICAL_THREAT_PATTERNS) {
    const match = combinedText.match(threat.pattern)
    if (match) {
      issues.push({
        severity: "critical",
        category: threat.category,
        rule: threat.rule,
        message: threat.message,
        snippet: match[0].slice(0, 100),
      })
    }
  }

  // 2. Warning pattern scans (Requires user awareness)
  for (const warning of WARNING_THREAT_PATTERNS) {
    const match = combinedText.match(warning.pattern)
    if (match) {
      issues.push({
        severity: "warning",
        category: warning.category,
        rule: warning.rule,
        message: warning.message,
        snippet: match[0].slice(0, 100),
      })
    }
  }

  const hasCritical = issues.some((i) => i.severity === "critical")
  const hasWarnings = issues.some((i) => i.severity === "warning")

  return {
    isSafe: issues.length === 0,
    hasCritical,
    hasWarnings,
    issues,
    checkedAt: new Date().toISOString(),
  }
}

/**
 * Validates URLs in markdown to prevent javascript: or data: XSS attacks
 */
export function sanitizeMarkdownUrl(url: string): string {
  if (!url) return ""
  const trimmed = url.trim().toLowerCase()

  // Strictly allow standard protocols
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("#")
  ) {
    return url.trim()
  }

  // Block javascript:, data:, vbscript:, etc.
  return ""
}

/**
 * Checks if content contains executable bash/sh terminal code snippets
 */
export function containsTerminalCommands(content: string): boolean {
  return /```(bash|sh|zsh|shell|cmd|powershell|ps1)\b/i.test(content)
}
