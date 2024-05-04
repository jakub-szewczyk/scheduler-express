import { Issue, Prisma } from '@prisma/client'
import { LexoRank } from 'lexorank'

export const ISSUE: Pick<Issue, 'title' | 'description' | 'rank'> = {
  title: 'Issue #1',
  description:
    "Edit your issue's title and description. Prioritize your tasks.",
  rank: LexoRank.middle().format(),
}

export const issueSelect = {
  id: true,
  createdAt: true,
  title: true,
  description: true,
  priority: true,
} satisfies Prisma.IssueSelect
