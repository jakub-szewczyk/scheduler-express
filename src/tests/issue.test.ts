import { Issue, Priority } from '@prisma/client'
import { ValidationError } from 'express-validator'
import { LexoRank } from 'lexorank'
import { omit } from 'ramda'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { BOARD } from '../modules/board'
import { RANKS, ordinals } from '../modules/common'
import { ISSUE, issueSelect } from '../modules/issue'
import { STATUS } from '../modules/status'
import prismaClient from './client'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

const itMovesAnIssueToTheBeginningOfAnotherStatus = async ({
  sourceStatusIndex,
  sourceIssueIndex,
  targetStatusIndex,
  targetIssueIndex,
  onComplete,
}: {
  sourceStatusIndex: number
  sourceIssueIndex: number
  targetStatusIndex: number
  targetIssueIndex: number
  onComplete: ([nextStatus1Issues, nextStatus2Issues, nextStatus3Issues]: {
    id: string
    title: string
  }[][]) => Promise<void>
}) =>
  it(`moves the ${ordinals((sourceIssueIndex % 3) + 1)} issue of the ${ordinals(sourceStatusIndex + 1)} status to the ${ordinals(targetStatusIndex + 1)} status and puts it at the beginning`, async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    await prismaClient.status.deleteMany()
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.parse(STATUS.rank).genPrev().format(),
          boardId: board!.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: STATUS.rank,
          boardId: board!.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.parse(STATUS.rank).genNext().format(),
          boardId: board!.id,
        },
      ],
    })
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '2',
          title: 'Issue #1.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '3',
          title: 'Issue #1.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '4',
          title: 'Issue #2.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '5',
          title: 'Issue #2.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '6',
          title: 'Issue #2.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '7',
          title: 'Issue #3.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '8',
          title: 'Issue #3.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '9',
          title: 'Issue #3.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
      ],
    })
    const [prevStatus1Issues, prevStatus2Issues, prevStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    expect(prevStatus1Issues).toStrictEqual([
      { id: '1', title: 'Issue #1.1' },
      { id: '2', title: 'Issue #1.2' },
      { id: '3', title: 'Issue #1.3' },
    ])
    expect(prevStatus2Issues).toStrictEqual([
      { id: '4', title: 'Issue #2.1' },
      { id: '5', title: 'Issue #2.2' },
      { id: '6', title: 'Issue #2.3' },
    ])
    expect(prevStatus3Issues).toStrictEqual([
      { id: '7', title: 'Issue #3.1' },
      { id: '8', title: 'Issue #3.2' },
      { id: '9', title: 'Issue #3.3' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${sourceStatusIndex + 1}/issues/${sourceIssueIndex + 1}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: `Issue #${sourceStatusIndex + 1}.${(sourceIssueIndex % 3) + 1}`,
        priority: 'MEDIUM',
        nextIssueId: `${targetIssueIndex + 1}`,
        statusId: `${targetStatusIndex + 1}`,
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: `Issue #${sourceStatusIndex + 1}.${(sourceIssueIndex % 3) + 1}`,
      description: null,
      priority: 'MEDIUM',
    })
    const [nextStatus1Issues, nextStatus2Issues, nextStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    await onComplete([nextStatus1Issues, nextStatus2Issues, nextStatus3Issues])
  })

const itMovesAnIssueInBetweenTheIssuesOfAnotherStatus = async ({
  sourceStatusIndex,
  sourceIssueIndex,
  targetStatusIndex,
  prevTargetIssueIndex,
  nextTargetIssueIndex,
  onComplete,
}: {
  sourceStatusIndex: number
  sourceIssueIndex: number
  targetStatusIndex: number
  prevTargetIssueIndex: number
  nextTargetIssueIndex: number
  onComplete: ([nextStatus1Issues, nextStatus2Issues, nextStatus3Issues]: {
    id: string
    title: string
  }[][]) => Promise<void>
}) =>
  it(`moves the ${ordinals((sourceIssueIndex % 3) + 1)} issue of the ${ordinals(sourceStatusIndex + 1)} status to the ${ordinals(targetStatusIndex + 1)} status and puts it in between the ${ordinals((prevTargetIssueIndex % 3) + 1)} and the ${ordinals((nextTargetIssueIndex % 3) + 1)} issue of that status`, async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    await prismaClient.status.deleteMany()
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.parse(STATUS.rank).genPrev().format(),
          boardId: board!.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: STATUS.rank,
          boardId: board!.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.parse(STATUS.rank).genNext().format(),
          boardId: board!.id,
        },
      ],
    })
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '2',
          title: 'Issue #1.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '3',
          title: 'Issue #1.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '4',
          title: 'Issue #2.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '5',
          title: 'Issue #2.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '6',
          title: 'Issue #2.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '7',
          title: 'Issue #3.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '8',
          title: 'Issue #3.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '9',
          title: 'Issue #3.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
      ],
    })
    const [prevStatus1Issues, prevStatus2Issues, prevStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    expect(prevStatus1Issues).toStrictEqual([
      { id: '1', title: 'Issue #1.1' },
      { id: '2', title: 'Issue #1.2' },
      { id: '3', title: 'Issue #1.3' },
    ])
    expect(prevStatus2Issues).toStrictEqual([
      { id: '4', title: 'Issue #2.1' },
      { id: '5', title: 'Issue #2.2' },
      { id: '6', title: 'Issue #2.3' },
    ])
    expect(prevStatus3Issues).toStrictEqual([
      { id: '7', title: 'Issue #3.1' },
      { id: '8', title: 'Issue #3.2' },
      { id: '9', title: 'Issue #3.3' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${sourceStatusIndex + 1}/issues/${sourceIssueIndex + 1}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: `Issue #${sourceStatusIndex + 1}.${(sourceIssueIndex % 3) + 1}`,
        priority: 'MEDIUM',
        prevIssueId: `${prevTargetIssueIndex + 1}`,
        nextIssueId: `${nextTargetIssueIndex + 1}`,
        statusId: `${targetStatusIndex + 1}`,
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: `Issue #${sourceStatusIndex + 1}.${(sourceIssueIndex % 3) + 1}`,
      description: null,
      priority: 'MEDIUM',
    })
    const [nextStatus1Issues, nextStatus2Issues, nextStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    await onComplete([nextStatus1Issues, nextStatus2Issues, nextStatus3Issues])
  })

const itMovesAnIssueToTheEndOfAnotherStatus = async ({
  sourceStatusIndex,
  sourceIssueIndex,
  targetStatusIndex,
  targetIssueIndex,
  onComplete,
}: {
  sourceStatusIndex: number
  sourceIssueIndex: number
  targetStatusIndex: number
  targetIssueIndex: number
  onComplete: ([nextStatus1Issues, nextStatus2Issues, nextStatus3Issues]: {
    id: string
    title: string
  }[][]) => Promise<void>
}) =>
  it(`moves the ${ordinals((sourceIssueIndex % 3) + 1)} issue of the ${ordinals(sourceStatusIndex + 1)} status to the ${ordinals(targetStatusIndex + 1)} status and puts it at the end`, async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    await prismaClient.status.deleteMany()
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.parse(STATUS.rank).genPrev().format(),
          boardId: board!.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: STATUS.rank,
          boardId: board!.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.parse(STATUS.rank).genNext().format(),
          boardId: board!.id,
        },
      ],
    })
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '2',
          title: 'Issue #1.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '3',
          title: 'Issue #1.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '4',
          title: 'Issue #2.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '5',
          title: 'Issue #2.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '6',
          title: 'Issue #2.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '7',
          title: 'Issue #3.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '8',
          title: 'Issue #3.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '9',
          title: 'Issue #3.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
      ],
    })
    const [prevStatus1Issues, prevStatus2Issues, prevStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    expect(prevStatus1Issues).toStrictEqual([
      { id: '1', title: 'Issue #1.1' },
      { id: '2', title: 'Issue #1.2' },
      { id: '3', title: 'Issue #1.3' },
    ])
    expect(prevStatus2Issues).toStrictEqual([
      { id: '4', title: 'Issue #2.1' },
      { id: '5', title: 'Issue #2.2' },
      { id: '6', title: 'Issue #2.3' },
    ])
    expect(prevStatus3Issues).toStrictEqual([
      { id: '7', title: 'Issue #3.1' },
      { id: '8', title: 'Issue #3.2' },
      { id: '9', title: 'Issue #3.3' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${sourceStatusIndex + 1}/issues/${sourceIssueIndex + 1}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: `Issue #${sourceStatusIndex + 1}.${(sourceIssueIndex % 3) + 1}`,
        priority: 'MEDIUM',
        prevIssueId: `${targetIssueIndex + 1}`,
        statusId: `${targetStatusIndex + 1}`,
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: `Issue #${sourceStatusIndex + 1}.${(sourceIssueIndex % 3) + 1}`,
      description: null,
      priority: 'MEDIUM',
    })
    const [nextStatus1Issues, nextStatus2Issues, nextStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    await onComplete([nextStatus1Issues, nextStatus2Issues, nextStatus3Issues])
  })

describe('GET /projects/:projectId/boards/:boardId/statuses/:statusId/issues', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          create: {
            title: 'Board #1',
            statuses: {
              create: {
                title: 'Status #1',
                rank: LexoRank.middle().format(),
                issues: {
                  createMany: {
                    data: RANKS.map((_, index, array) => ({
                      createdAt: new Date(
                        Date.now() - index * 1000000
                      ).toISOString(),
                      title: `Issue #${array.length - index}`,
                      rank: RANKS[index],
                      priority: 'MEDIUM',
                    })),
                  },
                },
              },
            },
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const [board, status] = await Promise.all([
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/abc/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Project not found',
        path: 'projectId',
        location: 'params',
      },
      {
        type: 'field',
        value: board!.id,
        msg: 'Board not found',
        path: 'boardId',
        location: 'params',
      },
      {
        type: 'field',
        value: status!.id,
        msg: 'Status not found',
        path: 'statusId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const [project, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/abc/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Board not found',
        path: 'boardId',
        location: 'params',
      },
      {
        type: 'field',
        value: status!.id,
        msg: 'Status not found',
        path: 'statusId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid status id', async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/abc/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Status not found',
        path: 'statusId',
        location: 'params',
      },
    ])
  })

  test('`page`, `size` and `title`  query param being optional', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const issues: Issue[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(issues).toHaveLength(10)
    issues.forEach((issue, index) => {
      expect(issue).toHaveProperty('id')
      expect(issue).toHaveProperty('createdAt')
      expect(issue).toMatchObject({
        title: `Issue #${100 - index}`,
        description: null,
        priority: 'MEDIUM',
      })
    })
  })

  it('returns 400 Bad Request when the page number is negative', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .query({ page: -1 })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '-1',
        msg: 'Page number must be a non-negative integer',
        path: 'page',
        location: 'query',
      },
    ])
  })

  it('returns 400 Bad Request when the page number is not an integer', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .query({ page: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Page number must be a non-negative integer',
        path: 'page',
        location: 'query',
      },
    ])
  })

  Array(10)
    .fill(null)
    .forEach((_, page) =>
      it(`returns ${ordinals(page + 1)} issue page`, async () => {
        const [project, board, status] = await Promise.all([
          prismaClient.project.findFirst(),
          prismaClient.board.findFirst(),
          prismaClient.status.findFirst(),
        ])
        const res = await req
          .get(
            `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
          )
          .query({ page })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const issues: Issue[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page,
          size: 10,
          total: 100,
        })
        expect(issues).toHaveLength(10)
        issues.forEach((issue, index) => {
          expect(issue).toHaveProperty('id')
          expect(issue).toHaveProperty('createdAt')
          expect(issue).toMatchObject({
            title: `Issue #${100 - index - page * 10}`,
            description: null,
            priority: 'MEDIUM',
          })
        })
      })
    )

  it('returns 400 Bad Request when the page size is negative', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .query({ size: -1 })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '-1',
        msg: 'Page size must be a non-negative integer',
        path: 'size',
        location: 'query',
      },
    ])
  })

  it('returns 400 Bad Request when the page size is not an integer', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .query({ size: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Page size must be a non-negative integer',
        path: 'size',
        location: 'query',
      },
    ])
  })

  Array(101)
    .fill(null)
    .forEach((_, size) =>
      it(`returns ${size} ${size === 1 ? 'issue' : 'issues'}`, async () => {
        const [project, board, status] = await Promise.all([
          prismaClient.project.findFirst(),
          prismaClient.board.findFirst(),
          prismaClient.status.findFirst(),
        ])
        const res = await req
          .get(
            `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
          )
          .query({ size })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const issues: Issue[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page: 0,
          size,
          total: 100,
        })
        expect(issues).toHaveLength(size)
        issues.forEach((issue, index) => {
          expect(issue).toHaveProperty('id')
          expect(issue).toHaveProperty('createdAt')
          expect(issue).toMatchObject({
            title: `Issue #${100 - index}`,
            description: null,
          })
        })
      })
    )

  it('returns issues filtered by title', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .query({
        title: 'issue #10',
      })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const issues: Issue[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 2,
    })
    expect(issues).toHaveLength(2)
    issues.forEach((issue) => {
      expect(issue).toHaveProperty('id')
      expect(issue).toHaveProperty('createdAt')
    })
    expect(issues[0]).toMatchObject({
      title: 'Issue #100',
      description: null,
    })
    expect(issues[1]).toMatchObject({
      title: 'Issue #10',
      description: null,
    })
  })

  test('case insensitivity in issue search by title', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res1 = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .query({ title: 'issue #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const issues1: Issue[] = res1.body.content
    expect(res1.status).toEqual(200)
    expect(res1.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(issues1).toHaveLength(1)
    expect(issues1[0]).toHaveProperty('id')
    expect(issues1[0]).toHaveProperty('createdAt')
    expect(issues1[0]).toMatchObject({
      title: 'Issue #69',
      description: null,
    })
    const res2 = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .query({ title: 'Issue #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const issues2: Issue[] = res2.body.content
    expect(res2.status).toEqual(200)
    expect(res2.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(issues1).toHaveLength(1)
    expect(issues2[0]).toHaveProperty('id')
    expect(issues2[0]).toHaveProperty('createdAt')
    expect(issues2[0]).toMatchObject({
      title: 'Issue #69',
      description: null,
    })
  })

  it('returns an empty issues array if none are found', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const status = (await prismaClient.status.findFirst())!
    const res = await req
      .get(
        `/api/projects/${project.id}/boards/${board.id}/statuses/${status.id}/issues`
      )
      .query({ title: 'issue #420' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const issues: Issue[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(issues).toHaveLength(0)
  })
})

describe('GET /projects/:projectId/boards/:boardId/statuses/:statusId/issues/:issueId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          create: {
            title: 'Board #1',
            statuses: {
              create: {
                ...omit(['description'], STATUS),
                issues: {
                  create: ISSUE,
                },
              },
            },
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const [board, status, issue] = await Promise.all([
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
      prismaClient.issue.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/abc/boards/${board!.id}/statuses/${status!.id}/issues/${issue!.id}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const [project, status, issue] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.status.findFirst(),
      prismaClient.issue.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/abc/statuses/${status!.id}/issues/${issue!.id}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns 404 Not Found in case of invalid status id', async () => {
    const [project, board, issue] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.issue.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/abc/issues/${issue!.id}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns 404 Not Found in case of invalid issue id', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/abc`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns issue by id', async () => {
    const [project, board, status, issue] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
      prismaClient.issue.findFirst({ select: issueSelect }),
    ])
    const res = await req
      .get(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/${issue!.id}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...issue,
      createdAt: issue!.createdAt.toISOString(),
    })
  })
})

describe('POST /projects/:projectId/boards/:boardId/statuses/:statusId/issues', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          create: {
            ...BOARD,
            statuses: { create: STATUS },
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const [board, status] = await Promise.all([
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .post(
        `/api/projects/abc/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(ISSUE)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Project not found',
        path: 'projectId',
        location: 'params',
      },
      {
        type: 'field',
        value: board!.id,
        msg: 'Board not found',
        path: 'boardId',
        location: 'params',
      },
      {
        type: 'field',
        value: status!.id,
        msg: 'Status not found',
        path: 'statusId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const [project, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/abc/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(ISSUE)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Board not found',
        path: 'boardId',
        location: 'params',
      },
      {
        type: 'field',
        value: status!.id,
        msg: 'Status not found',
        path: 'statusId',
        location: 'params',
      },
    ])
  })

  it('creates the first issue', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const payload = omit(['rank'], ISSUE)
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject(payload)
    const issues = await prismaClient.issue.findMany()
    expect(issues).toMatchObject([ISSUE])
  })

  it('creates an issue at a default position', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    await prismaClient.issue.create({
      data: {
        ...ISSUE,
        status: { connect: { id: status!.id } },
      },
    })
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Issue #2', priority: 'MEDIUM' })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #2', description: null })
    const issues = await prismaClient.issue.findMany({
      select: { title: true, description: true, rank: true, priority: true },
      orderBy: { rank: 'asc' },
    })
    expect(issues).toStrictEqual([
      {
        title: 'Issue #2',
        description: null,
        rank: '0|hzzzzr:',
        priority: 'MEDIUM',
      },
      ISSUE,
    ])
  })

  it('prepends an issue', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const issue = await prismaClient.issue.create({
      data: {
        ...ISSUE,
        status: { connect: { id: status!.id } },
      },
    })
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #0',
        priority: 'MEDIUM',
        nextIssueId: issue.id,
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Issue #0',
      description: null,
      priority: 'MEDIUM',
    })
    const issues = await prismaClient.issue.findMany({
      select: { title: true, rank: true },
    })
    expect(issues).toMatchObject([
      {
        title: 'Issue #1',
        rank: LexoRank.middle().format(),
      },
      {
        title: 'Issue #0',
        rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
      },
    ])
  })

  it('appends an issue', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const issue = await prismaClient.issue.create({
      data: {
        ...ISSUE,
        status: { connect: { id: status!.id } },
      },
    })
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: issue.id,
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Issue #2',
      description: null,
      priority: 'MEDIUM',
    })
    const issues = await prismaClient.issue.findMany({
      select: { title: true, rank: true },
      orderBy: { rank: 'asc' },
    })
    expect(issues).toMatchObject([
      {
        title: 'Issue #1',
        rank: LexoRank.middle().format(),
      },
      {
        title: 'Issue #2',
        rank: LexoRank.parse(ISSUE.rank).genNext().format(),
      },
    ])
  })

  it('inserts an issue in between', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssue = await prismaClient.issue.create({
      data: {
        ...ISSUE,
        status: { connect: { id: status!.id } },
      },
    })
    const nextIssue = await prismaClient.issue.create({
      data: {
        ...ISSUE,
        rank: LexoRank.parse(ISSUE.rank).genNext().format(),
        title: 'Issue #3',
        status: { connect: { id: status!.id } },
      },
    })
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: prevIssue.id,
        nextIssueId: nextIssue.id,
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Issue #2',
      description: null,
      priority: 'MEDIUM',
    })
    const issues = await prismaClient.issue.findMany({
      select: { title: true, rank: true },
      orderBy: { rank: 'asc' },
    })
    expect(issues).toMatchObject([
      {
        title: 'Issue #1',
        rank: LexoRank.middle().format(),
      },
      {
        title: 'Issue #2',
        rank: LexoRank.middle().between(LexoRank.middle().genNext()).format(),
      },
      {
        title: 'Issue #3',
        rank: LexoRank.middle().genNext().format(),
      },
    ])
  })

  it("fails to append an issue when the reference ain't on the last position", async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1',
          rank: LexoRank.middle().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '2',
          title: 'Issue #2',
          rank: LexoRank.middle().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '3',
          title: 'Issue #3',
          rank: LexoRank.middle().genNext().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '4',
          title: 'Issue #4',
          rank: LexoRank.middle().genNext().genNext().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '5',
          title: 'Issue #5',
          rank: LexoRank.middle()
            .genNext()
            .genNext()
            .genNext()
            .genNext()
            .format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
      ],
    })
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #6',
        priority: 'MEDIUM',
        prevIssueId: '4',
      })
    expect(res.status).toEqual(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine issue's position when appending it"
    )
  })

  it("fails to prepend an issue when the reference ain't on the first position", async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1',
          rank: LexoRank.middle().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '2',
          title: 'Issue #2',
          rank: LexoRank.middle().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '3',
          title: 'Issue #3',
          rank: LexoRank.middle().genNext().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '4',
          title: 'Issue #4',
          rank: LexoRank.middle().genNext().genNext().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '5',
          title: 'Issue #5',
          rank: LexoRank.middle()
            .genNext()
            .genNext()
            .genNext()
            .genNext()
            .format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
      ],
    })
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Issue #0', priority: 'MEDIUM', nextIssueId: '2' })
    expect(res.status).toEqual(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine issue's position when prepending it"
    )
  })

  it('fails to insert an issue in between when its neighbors are incorrectly provided', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1',
          rank: LexoRank.middle().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '2',
          title: 'Issue #2',
          rank: LexoRank.middle().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '3',
          title: 'Issue #3',
          rank: LexoRank.middle().genNext().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '4',
          title: 'Issue #4',
          rank: LexoRank.middle().genNext().genNext().genNext().format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
        {
          id: '5',
          title: 'Issue #5',
          rank: LexoRank.middle()
            .genNext()
            .genNext()
            .genNext()
            .genNext()
            .format(),
          priority: 'MEDIUM',
          statusId: status!.id,
        },
      ],
    })
    const res1 = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #1.5',
        priority: 'MEDIUM',
        prevIssueId: '1',
        nextIssueId: '3',
      })
    expect(res1.status).toEqual(400)
    expect(res1.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res2 = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #4.0',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '5',
      })
    expect(res2.status).toEqual(400)
    expect(res2.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res3 = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3.0',
        priority: 'MEDIUM',
        prevIssueId: '1',
        nextIssueId: '5',
      })
    expect(res3.status).toEqual(400)
    expect(res3.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res4 = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2.0',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '1',
      })
    expect(res4.status).toEqual(400)
    expect(res4.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res5 = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3.0',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '3',
      })
    expect(res5.status).toEqual(404)
    expect(res5.body[0].msg).toEqual('Issue not found')
    const res6 = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #5.0',
        priority: 'MEDIUM',
        prevIssueId: '4',
        nextIssueId: '6',
      })
    expect(res6.status).toEqual(404)
    expect(res6.body[0].msg).toEqual('Issue not found')
  })

  test('`description` field in request body being optional', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const payload = omit(['rank', 'description'], ISSUE)
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...payload,
      description: null,
      priority: 'MEDIUM',
    })
  })

  test('`title` field in request body being required', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const payload = omit(['rank', 'title'], ISSUE)
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your issue a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it("returns 400 Bad Request when the issue's title is already taken", async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    await prismaClient.issue.create({
      data: {
        ...ISSUE,
        status: { connect: { id: status!.id } },
      },
    })
    const payload = omit(['rank'], ISSUE)
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.body[0]).toStrictEqual({
      type: 'field',
      value: 'Issue #1',
      msg: 'This title has already been used by one of your issues',
      path: 'title',
      location: 'body',
    })
  })

  test('`priority` field in request body being required', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const payload = omit(['rank', 'priority'], ISSUE)
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.body[0]).toStrictEqual({
      type: 'field',
      msg: 'You have to assign your issue a priority',
      path: 'priority',
      location: 'body',
    })
  })

  test('`priority` field in request body being an enum', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const payload = { ...omit(['rank'], ISSUE), priority: 'BLOCKER' }
    const res = await req
      .post(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'BLOCKER',
        msg: "Invalid value was provided for the issue's priority",
        path: 'priority',
        location: 'body',
      },
    ])
    await Object.values(Priority).reduce(
      (promise, priority, index) =>
        promise.then(async () => {
          const payload = {
            ...omit(['rank'], ISSUE),
            title: `Issue #${index + 1}`,
            priority,
          }
          const res = await req
            .post(
              `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues`
            )
            .set('Accept', 'application/json')
            .set('Authorization', BEARER_TOKEN)
            .send(payload)
          expect(res.status).toEqual(201)
          expect(res.body).toHaveProperty('id')
          expect(res.body).toHaveProperty('createdAt')
          expect(res.body).toMatchObject(payload)
        }),
      Promise.resolve()
    )
  })
})

describe('PUT /projects/:projectId/boards/:boardId/statuses/:statusId/issues/:issueId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          create: {
            ...BOARD,
            statuses: {
              create: {
                ...STATUS,
                issues: {
                  createMany: {
                    data: [
                      {
                        id: '1',
                        title: 'Issue #1',
                        rank: LexoRank.middle().format(),
                        priority: 'MEDIUM',
                      },
                      {
                        id: '2',
                        title: 'Issue #2',
                        rank: LexoRank.middle().genNext().format(),
                        priority: 'MEDIUM',
                      },
                      {
                        id: '3',
                        title: 'Issue #3',
                        rank: LexoRank.middle().genNext().genNext().format(),
                        priority: 'MEDIUM',
                      },
                      {
                        id: '4',
                        title: 'Issue #4',
                        rank: LexoRank.middle()
                          .genNext()
                          .genNext()
                          .genNext()
                          .format(),
                        priority: 'MEDIUM',
                      },
                      {
                        id: '5',
                        title: 'Issue #5',
                        rank: LexoRank.middle()
                          .genNext()
                          .genNext()
                          .genNext()
                          .genNext()
                          .format(),
                        priority: 'MEDIUM',
                      },
                    ],
                  },
                },
              },
            },
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const [board, status] = await Promise.all([
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/abc/boards/${board!.id}/statuses/${status!.id}/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3.0',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res.status).toEqual(404)
    expect(res.body.map((error: ValidationError) => error.msg)).toStrictEqual([
      'Project not found',
      'Board not found',
      'Status not found',
      'Issue not found',
      'Issue not found',
      'Issue not found',
    ])
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const [project, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/abc/statuses/${status!.id}/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3.0',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res.status).toEqual(404)
    expect(res.body.map((error: ValidationError) => error.msg)).toStrictEqual([
      'Board not found',
      'Status not found',
      'Issue not found',
      'Issue not found',
      'Issue not found',
    ])
  })

  it('returns 404 Not Found in case of invalid status id', async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/abc/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3.0',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res.status).toEqual(404)
    expect(res.body.map((error: ValidationError) => error.msg)).toStrictEqual([
      'Status not found',
      'Issue not found',
      'Issue not found',
      'Issue not found',
    ])
  })

  it('returns 404 Not Found in case of invalid issue id', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/abc`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3.0',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Issue not found',
        path: 'issueId',
        location: 'params',
      },
    ])
  })

  it('moves the first issue down by one', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/1`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #1',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #1', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '2', title: 'Issue #2' },
      { id: '1', title: 'Issue #1' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
  })

  it('moves the first issue down by two', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/1`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #1',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '4',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #1', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '1', title: 'Issue #1' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
  })

  it('moves the first issue down by three', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/1`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #1',
        priority: 'MEDIUM',
        prevIssueId: '4',
        nextIssueId: '5',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #1', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '1', title: 'Issue #1' },
      { id: '5', title: 'Issue #5' },
    ])
  })

  it('moves the first issue down by four and puts it at the end', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/1`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Issue #1', priority: 'MEDIUM', prevIssueId: '5' })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #1', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
      { id: '1', title: 'Issue #1' },
    ])
  })

  it('moves the last issue up by one', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/5`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #5',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '4',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #5', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '5', title: 'Issue #5' },
      { id: '4', title: 'Issue #4' },
    ])
  })

  it('moves the last issue up by two', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/5`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #5',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #5', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '5', title: 'Issue #5' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
    ])
  })

  it('moves the last issue up by three', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/5`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #5',
        priority: 'MEDIUM',
        prevIssueId: '1',
        nextIssueId: '2',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #5', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '5', title: 'Issue #5' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
    ])
  })

  it('moves the last issue up by four and puts it at the beginning', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const prevIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(prevIssues).toStrictEqual([
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
      { id: '5', title: 'Issue #5' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/5`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Issue #5', priority: 'MEDIUM', nextIssueId: '1' })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Issue #5', description: null })
    const nextIssues = await prismaClient.issue.findMany({
      select: { id: true, title: true },
      orderBy: { rank: 'asc' },
    })
    expect(nextIssues).toStrictEqual([
      { id: '5', title: 'Issue #5' },
      { id: '1', title: 'Issue #1' },
      { id: '2', title: 'Issue #2' },
      { id: '3', title: 'Issue #3' },
      { id: '4', title: 'Issue #4' },
    ])
  })

  it("fails to put an issue at the end when the reference ain't on the last position", async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/1`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Issue #1', priority: 'MEDIUM', prevIssueId: '4' })
    expect(res.status).toEqual(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine issue's position when appending it"
    )
  })

  it("fails to put an issue at the beginning when the reference ain't on the first position", async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/5`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Issue #5', priority: 'MEDIUM', nextIssueId: '2' })
    expect(res.status).toEqual(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine issue's position when prepending it"
    )
  })

  it('fails to put an issue in between when its neighbors are incorrectly provided', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res1 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/2`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: '1',
        nextIssueId: '3',
      })
    expect(res1.status).toEqual(400)
    expect(res1.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res2 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/2`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '5',
      })
    expect(res2.status).toEqual(400)
    expect(res2.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res3 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/2`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: '1',
        nextIssueId: '5',
      })
    expect(res3.status).toEqual(400)
    expect(res3.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res4 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/2`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '1',
      })
    expect(res4.status).toEqual(400)
    expect(res4.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res5 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/2`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res5.status).toEqual(400)
    expect(res5.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res6 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3',
        priority: 'MEDIUM',
        prevIssueId: '2',
        nextIssueId: '3',
      })
    expect(res6.status).toEqual(400)
    expect(res6.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
    const res7 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/2`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: '3',
        nextIssueId: '3',
      })
    expect(res7.status).toEqual(404)
    expect(res7.body[0].msg).toEqual('Issue not found')
    const res8 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/2`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #2',
        priority: 'MEDIUM',
        prevIssueId: '4',
        nextIssueId: '6',
      })
    expect(res8.status).toEqual(404)
    expect(res8.body[0].msg).toEqual('Issue not found')
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 1,
    targetIssueIndex: 3,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 1,
    targetIssueIndex: 3,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 1,
    targetIssueIndex: 3,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '3', title: 'Issue #1.3' },
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 2,
    targetIssueIndex: 6,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 2,
    targetIssueIndex: 6,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 2,
    targetIssueIndex: 6,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '3', title: 'Issue #1.3' },
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 0,
    targetIssueIndex: 0,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 0,
    targetIssueIndex: 0,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 0,
    targetIssueIndex: 0,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '6', title: 'Issue #2.3' },
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 2,
    targetIssueIndex: 6,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 2,
    targetIssueIndex: 6,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 2,
    targetIssueIndex: 6,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '6', title: 'Issue #2.3' },
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 1,
    targetIssueIndex: 3,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 1,
    targetIssueIndex: 3,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 1,
    targetIssueIndex: 3,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '9', title: 'Issue #3.3' },
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 0,
    targetIssueIndex: 0,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 0,
    targetIssueIndex: 0,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheBeginningOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 0,
    targetIssueIndex: 0,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '9', title: 'Issue #3.3' },
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 3,
    nextTargetIssueIndex: 4,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '1', title: 'Issue #1.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 4,
    nextTargetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '1', title: 'Issue #1.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 3,
    nextTargetIssueIndex: 4,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 4,
    nextTargetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '2', title: 'Issue #1.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 3,
    nextTargetIssueIndex: 4,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '3', title: 'Issue #1.3' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 4,
    nextTargetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 6,
    nextTargetIssueIndex: 7,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '1', title: 'Issue #1.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 7,
    nextTargetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '1', title: 'Issue #1.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 6,
    nextTargetIssueIndex: 7,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 7,
    nextTargetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '2', title: 'Issue #1.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 6,
    nextTargetIssueIndex: 7,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '3', title: 'Issue #1.3' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 7,
    nextTargetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 0,
    nextTargetIssueIndex: 1,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '4', title: 'Issue #2.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 1,
    nextTargetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '4', title: 'Issue #2.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 0,
    nextTargetIssueIndex: 1,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 1,
    nextTargetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '5', title: 'Issue #2.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 0,
    nextTargetIssueIndex: 1,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '6', title: 'Issue #2.3' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 1,
    nextTargetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 6,
    nextTargetIssueIndex: 7,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '4', title: 'Issue #2.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 7,
    nextTargetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '4', title: 'Issue #2.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 6,
    nextTargetIssueIndex: 7,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 7,
    nextTargetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '5', title: 'Issue #2.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 6,
    nextTargetIssueIndex: 7,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '6', title: 'Issue #2.3' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 2,
    prevTargetIssueIndex: 7,
    nextTargetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 3,
    nextTargetIssueIndex: 4,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '7', title: 'Issue #3.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 4,
    nextTargetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '7', title: 'Issue #3.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 3,
    nextTargetIssueIndex: 4,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 4,
    nextTargetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '8', title: 'Issue #3.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 3,
    nextTargetIssueIndex: 4,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '9', title: 'Issue #3.3' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 1,
    prevTargetIssueIndex: 4,
    nextTargetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 0,
    nextTargetIssueIndex: 1,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '7', title: 'Issue #3.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 1,
    nextTargetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '7', title: 'Issue #3.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 0,
    nextTargetIssueIndex: 1,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 1,
    nextTargetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '8', title: 'Issue #3.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 0,
    nextTargetIssueIndex: 1,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '9', title: 'Issue #3.3' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  itMovesAnIssueInBetweenTheIssuesOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 0,
    prevTargetIssueIndex: 1,
    nextTargetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 1,
    targetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '1', title: 'Issue #1.1' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 1,
    targetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 1,
    targetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 0,
    targetStatusIndex: 2,
    targetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '1', title: 'Issue #1.1' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 1,
    targetStatusIndex: 2,
    targetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '2', title: 'Issue #1.2' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 0,
    sourceIssueIndex: 2,
    targetStatusIndex: 2,
    targetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '3', title: 'Issue #1.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 0,
    targetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '4', title: 'Issue #2.1' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 0,
    targetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 0,
    targetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 3,
    targetStatusIndex: 2,
    targetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '4', title: 'Issue #2.1' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 4,
    targetStatusIndex: 2,
    targetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '5', title: 'Issue #2.2' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 1,
    sourceIssueIndex: 5,
    targetStatusIndex: 2,
    targetIssueIndex: 8,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
        { id: '6', title: 'Issue #2.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 1,
    targetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '7', title: 'Issue #3.1' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 1,
    targetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '8', title: 'Issue #3.2' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 1,
    targetIssueIndex: 5,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
        { id: '9', title: 'Issue #3.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 6,
    targetStatusIndex: 0,
    targetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '7', title: 'Issue #3.1' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '8', title: 'Issue #3.2' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 7,
    targetStatusIndex: 0,
    targetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '8', title: 'Issue #3.2' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '9', title: 'Issue #3.3' },
      ])
    },
  })

  itMovesAnIssueToTheEndOfAnotherStatus({
    sourceStatusIndex: 2,
    sourceIssueIndex: 8,
    targetStatusIndex: 0,
    targetIssueIndex: 2,
    onComplete: async ([
      nextStatus1Issues,
      nextStatus2Issues,
      nextStatus3Issues,
    ]) => {
      expect(nextStatus1Issues).toStrictEqual([
        { id: '1', title: 'Issue #1.1' },
        { id: '2', title: 'Issue #1.2' },
        { id: '3', title: 'Issue #1.3' },
        { id: '9', title: 'Issue #3.3' },
      ])
      expect(nextStatus2Issues).toStrictEqual([
        { id: '4', title: 'Issue #2.1' },
        { id: '5', title: 'Issue #2.2' },
        { id: '6', title: 'Issue #2.3' },
      ])
      expect(nextStatus3Issues).toStrictEqual([
        { id: '7', title: 'Issue #3.1' },
        { id: '8', title: 'Issue #3.2' },
      ])
    },
  })

  it("fails to put an issue at the end when the reference ain't on the last position", async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    await prismaClient.status.deleteMany()
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.parse(STATUS.rank).genPrev().format(),
          boardId: board!.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: STATUS.rank,
          boardId: board!.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.parse(STATUS.rank).genNext().format(),
          boardId: board!.id,
        },
      ],
    })
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '2',
          title: 'Issue #1.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '3',
          title: 'Issue #1.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '4',
          title: 'Issue #2.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '5',
          title: 'Issue #2.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '6',
          title: 'Issue #2.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '7',
          title: 'Issue #3.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '8',
          title: 'Issue #3.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '9',
          title: 'Issue #3.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
      ],
    })
    const [prevStatus1Issues, prevStatus2Issues, prevStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    expect(prevStatus1Issues).toStrictEqual([
      { id: '1', title: 'Issue #1.1' },
      { id: '2', title: 'Issue #1.2' },
      { id: '3', title: 'Issue #1.3' },
    ])
    expect(prevStatus2Issues).toStrictEqual([
      { id: '4', title: 'Issue #2.1' },
      { id: '5', title: 'Issue #2.2' },
      { id: '6', title: 'Issue #2.3' },
    ])
    expect(prevStatus3Issues).toStrictEqual([
      { id: '7', title: 'Issue #3.1' },
      { id: '8', title: 'Issue #3.2' },
      { id: '9', title: 'Issue #3.3' },
    ])
    const res1 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/2/issues/4`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #4',
        priority: 'MEDIUM',
        prevIssueId: '2',
        statusId: '1',
      })
    expect(res1.statusCode).toBe(400)
    expect(res1.body[0].msg).toEqual(
      "Cannot determine issue's position when appending it"
    )
  })

  it("fails to put an issue at the beginning when the reference ain't on the first position", async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    await prismaClient.status.deleteMany()
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.parse(STATUS.rank).genPrev().format(),
          boardId: board!.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: STATUS.rank,
          boardId: board!.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.parse(STATUS.rank).genNext().format(),
          boardId: board!.id,
        },
      ],
    })
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '2',
          title: 'Issue #1.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '3',
          title: 'Issue #1.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '4',
          title: 'Issue #2.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '5',
          title: 'Issue #2.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '6',
          title: 'Issue #2.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '7',
          title: 'Issue #3.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '8',
          title: 'Issue #3.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '9',
          title: 'Issue #3.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
      ],
    })
    const [prevStatus1Issues, prevStatus2Issues, prevStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    expect(prevStatus1Issues).toStrictEqual([
      { id: '1', title: 'Issue #1.1' },
      { id: '2', title: 'Issue #1.2' },
      { id: '3', title: 'Issue #1.3' },
    ])
    expect(prevStatus2Issues).toStrictEqual([
      { id: '4', title: 'Issue #2.1' },
      { id: '5', title: 'Issue #2.2' },
      { id: '6', title: 'Issue #2.3' },
    ])
    expect(prevStatus3Issues).toStrictEqual([
      { id: '7', title: 'Issue #3.1' },
      { id: '8', title: 'Issue #3.2' },
      { id: '9', title: 'Issue #3.3' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/2/issues/4`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #4',
        priority: 'MEDIUM',
        nextIssueId: '2',
        statusId: '1',
      })
    expect(res.statusCode).toBe(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine issue's position when prepending it"
    )
  })

  it('fails to put an issue in between when its neighbors are incorrectly provided', async () => {
    const [project, board] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
    ])
    await prismaClient.status.deleteMany()
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.parse(STATUS.rank).genPrev().format(),
          boardId: board!.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: STATUS.rank,
          boardId: board!.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.parse(STATUS.rank).genNext().format(),
          boardId: board!.id,
        },
      ],
    })
    await prismaClient.issue.createMany({
      data: [
        {
          id: '1',
          title: 'Issue #1.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '2',
          title: 'Issue #1.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '3',
          title: 'Issue #1.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '1',
        },
        {
          id: '4',
          title: 'Issue #2.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '5',
          title: 'Issue #2.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '6',
          title: 'Issue #2.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '2',
        },
        {
          id: '7',
          title: 'Issue #3.1',
          rank: LexoRank.parse(ISSUE.rank).genPrev().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '8',
          title: 'Issue #3.2',
          rank: ISSUE.rank,
          priority: 'MEDIUM',
          statusId: '3',
        },
        {
          id: '9',
          title: 'Issue #3.3',
          rank: LexoRank.parse(ISSUE.rank).genNext().format(),
          priority: 'MEDIUM',
          statusId: '3',
        },
      ],
    })
    const [prevStatus1Issues, prevStatus2Issues, prevStatus3Issues] =
      await Promise.all([
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '1' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '2' },
          orderBy: { rank: 'asc' },
        }),
        prismaClient.issue.findMany({
          select: { id: true, title: true },
          where: { statusId: '3' },
          orderBy: { rank: 'asc' },
        }),
      ])
    expect(prevStatus1Issues).toStrictEqual([
      { id: '1', title: 'Issue #1.1' },
      { id: '2', title: 'Issue #1.2' },
      { id: '3', title: 'Issue #1.3' },
    ])
    expect(prevStatus2Issues).toStrictEqual([
      { id: '4', title: 'Issue #2.1' },
      { id: '5', title: 'Issue #2.2' },
      { id: '6', title: 'Issue #2.3' },
    ])
    expect(prevStatus3Issues).toStrictEqual([
      { id: '7', title: 'Issue #3.1' },
      { id: '8', title: 'Issue #3.2' },
      { id: '9', title: 'Issue #3.3' },
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/2/issues/4`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #4',
        priority: 'MEDIUM',
        prevIssueId: '1',
        nextIssueId: '3',
        statusId: '1',
      })
    expect(res.statusCode).toBe(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine issue's position when putting one in between"
    )
  })

  test('`description` field in request body being optional', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3',
        priority: 'MEDIUM',
        prevIssueId: '4',
        nextIssueId: '5',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Issue #3',
      description: null,
    })
  })

  test('`title` field in request body being required', async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ priority: 'MEDIUM', prevIssueId: '4', nextIssueId: '5' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your issue a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it("returns 400 Bad Request when the issue's title is already taken", async () => {
    const [project, board, status] = await Promise.all([
      prismaClient.project.findFirst(),
      prismaClient.board.findFirst(),
      prismaClient.status.findFirst(),
    ])
    const res1 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #3',
        priority: 'MEDIUM',
        prevIssueId: '4',
        nextIssueId: '5',
      })
    expect(res1.status).toEqual(200)
    expect(res1.body).toHaveProperty('id')
    expect(res1.body).toHaveProperty('createdAt')
    expect(res1.body).toMatchObject({
      title: 'Issue #3',
      description: null,
    })
    const res2 = await req
      .put(
        `/api/projects/${project!.id}/boards/${board!.id}/statuses/${status!.id}/issues/3`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Issue #4',
        priority: 'MEDIUM',
        prevIssueId: '4',
        nextIssueId: '5',
      })
    expect(res2.status).toEqual(400)
    expect(res2.body[0]).toStrictEqual({
      type: 'field',
      value: 'Issue #4',
      msg: 'This title has already been used by one of your issues',
      path: 'title',
      location: 'body',
    })
  })

  // TODO:
  // Test `req.body.priority` field.
  // Test `req.body.statusId` field.
})
