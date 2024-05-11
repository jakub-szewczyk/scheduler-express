import { Issue, Prisma } from '@prisma/client'
import { LexoRank } from 'lexorank'

export const ISSUE: Pick<Issue, 'title' | 'description' | 'rank' | 'priority'> =
  {
    title: 'Issue #1',
    description:
      "Edit your issue's title and description. Prioritize them based on your needs.",
    rank: LexoRank.middle().format(),
    priority: 'MEDIUM',
  }

export const issueSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  priority: true,
} satisfies Prisma.IssueSelect
