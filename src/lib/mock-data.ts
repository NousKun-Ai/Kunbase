export interface MockCreator {
  name: string
  username: string
  avatar: string
  bio?: string
  links?: {
    github?: string
    twitter?: string
    website?: string
  }
  followers: number
  following: number
}

export interface MockSkill {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  creator: Pick<MockCreator, 'name' | 'username' | 'avatar'>
  stats: {
    stars: number
    copies: number
    views: number
  }
  type?: 'skill' | 'prompt'
  content?: string
  createdAt: string
}

export const CREATORS: MockCreator[] = [
  {
    name: 'Sofia Davis',
    username: 'sofiadavis',
    avatar: 'https://github.com/shadcn.png',
    bio: 'Frontend Architect. Building open-source tools for the Next.js ecosystem. Ex-Vercel.',
    links: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      website: 'https://example.com'
    },
    followers: 1420,
    following: 35
  },
  {
    name: 'Alex Chen',
    username: 'alexc',
    avatar: 'https://github.com/shadcn.png',
    bio: 'Staff AI Engineer focusing on advanced LLM prompting and architectures.',
    links: {
      github: 'https://github.com',
      twitter: 'https://twitter.com'
    },
    followers: 890,
    following: 112
  }
]

export const TRENDING_SKILLS: MockSkill[] = [
  {
    id: '1',
    title: 'Next.js App Router Master Prompt',
    slug: 'nextjs-app-router-master',
    description: 'A comprehensive prompt to generate production-ready Next.js 15 apps with Server Components and shadcn/ui.',
    category: 'Web Development',
    tags: ['nextjs', 'react', 'tailwind'],
    type: 'skill',
    creator: {
      name: 'Sofia Davis',
      username: 'sofiadavis',
      avatar: 'https://github.com/shadcn.png'
    },
    stats: { stars: 1205, copies: 4500, views: 12500 },
    createdAt: '2026-07-20T10:00:00Z',
    content: `# Next.js App Router Master Prompt

This system prompt configures an AI agent to build production-ready Next.js applications.

## Usage
Simply copy this into your \`.cursor/rules/nextjs.mdc\` file.

## Rule Definition
\`\`\`xml
<rule>
  <description>Strict guidelines for Next.js 15 App Router</description>
  <instructions>
    - ALWAYS use Server Components by default.
    - NEVER use \`useEffect\` for data fetching.
    - ALWAYS use Server Actions for mutations.
  </instructions>
</rule>
\`\`\`
`
  }
]

export const RECENT_SKILLS: MockSkill[] = [
  {
    id: '2',
    title: 'Senior Frontend Engineer Persona',
    slug: 'senior-frontend-engineer-persona',
    description: 'A powerful system prompt that configures Claude or ChatGPT to act as a Staff-level frontend engineer.',
    category: 'System Prompts',
    tags: ['prompt', 'frontend', 'persona'],
    type: 'prompt',
    creator: {
      name: 'Alex Chen',
      username: 'alexc',
      avatar: 'https://github.com/shadcn.png'
    },
    stats: { stars: 850, copies: 3200, views: 9000 },
    createdAt: new Date().toISOString(),
    content: `# Senior Frontend Engineer Persona

This system prompt configures the AI to act as a deeply experienced Staff-level Frontend Engineer.

## Prompt

\`\`\`markdown
You are a Staff-level Frontend Engineer with 10+ years of experience. You specialize in React, Next.js, and TypeScript. 
When providing code:
1. Prioritize accessibility (a11y) and semantic HTML.
2. Ensure components are fully responsive and edge-case tested.
3. Write clean, DRY, and highly maintainable code.
4. Explain the *why* behind your architectural choices, not just the *how*.
\`\`\`
`
  }
]
