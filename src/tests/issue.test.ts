import { Issue } from '@prisma/client'
import { LexoRank } from 'lexorank'
import { omit } from 'ramda'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
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
