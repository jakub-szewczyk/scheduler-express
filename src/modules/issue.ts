// import { Issue, Prisma } from '@prisma/client'
//
// export const ISSUES: Prisma.IssueCreateManyStatusInput[] = [
//   {
//     index: 0,
//     title: 'Adjust column titles',
//     content:
//       'To rename a status, simply click on the three dots icon next to the status title. This will open the configuration menu, where you can find the option to rename it.',
//   },
//   {
//     index: 1,
//     title: 'Create your own issues',
//     content:
//       'Click on the floating action button in the bottom-right corner of the screen to add more issues',
//   },
//   {
//     index: 2,
//     title: 'Get familiar with the kanban board',
//     content:
//       'Get to know the kanban board. Customize statuses and issues to fit your needs.',
//   },
// ]
//
// export const issuesData = (
//   issues: Pick<Issue, 'index' | 'title' | 'content'>[]
// ) => Prisma.validator<Prisma.IssueCreateManyStatusInput[]>()(issues)
