import { Status } from '@prisma/client'
import { omit } from 'ramda'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { ordinals } from '../modules/common'
import { RANKS, STATUS, statusSelect } from '../modules/status'
import prismaClient from './client'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('GET /projects/:projectId/boards/:boardId/statuses', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          create: {
            id: '7a6ea58e-4e88-4e94-9eeb-800527aa88b6',
            title: 'Board #1',
            statuses: {
              createMany: {
                data: RANKS.map((_, index, array) => ({
                  title: `Status #${array.length - index}`,
                  createdAt: new Date(
                    Date.now() - index * 1000000
                  ).toISOString(),
                  rank: RANKS[index],
                })),
              },
            },
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/abc/boards/${board.id}/statuses`)
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
        value: '7a6ea58e-4e88-4e94-9eeb-800527aa88b6',
        msg: 'Board not found',
        path: 'boardId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/abc/statuses`)
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
    ])
  })

  test('`page`, `size`, `title` and `createdAt` query param being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses: Status[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(statuses).toHaveLength(10)
    statuses.forEach((status, index) => {
      expect(status).toHaveProperty('id')
      expect(status).toHaveProperty('createdAt')
      expect(status).toMatchObject({
        title: `Status #${100 - index}`,
        description: null,
      })
    })
  })

  it('returns 400 Bad Request when the page number is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
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
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
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
      it(`returns ${ordinals(page + 1)} status page`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const board = (await prismaClient.board.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
          .query({ page })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const statuses: Status[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page,
          size: 10,
          total: 100,
        })
        expect(statuses).toHaveLength(10)
        statuses.forEach((status, index) => {
          expect(status).toHaveProperty('id')
          expect(status).toHaveProperty('createdAt')
          expect(status).toMatchObject({
            title: `Status #${100 - index - page * 10}`,
            description: null,
          })
        })
      })
    )

  it('returns 400 Bad Request when the page size is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
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
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
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
      it(`returns ${size} ${size === 1 ? 'status' : 'statuses'}`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const board = (await prismaClient.board.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
          .query({ size })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const statuses: Status[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page: 0,
          size,
          total: 100,
        })
        expect(statuses).toHaveLength(size)
        statuses.forEach((status, index) => {
          expect(status).toHaveProperty('id')
          expect(status).toHaveProperty('createdAt')
          expect(status).toMatchObject({
            title: `Status #${100 - index}`,
            description: null,
          })
        })
      })
    )

  it('returns statuses filtered by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .query({
        title: 'status #10',
      })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses: Status[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 2,
    })
    expect(statuses).toHaveLength(2)
    statuses.forEach((status) => {
      expect(status).toHaveProperty('id')
      expect(status).toHaveProperty('createdAt')
    })
    expect(statuses[0]).toMatchObject({
      title: 'Status #100',
      description: null,
    })
    expect(statuses[1]).toMatchObject({
      title: 'Status #10',
      description: null,
    })
  })

  test('case insensitivity in status search by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res1 = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .query({ title: 'status #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses1: Status[] = res1.body.content
    expect(res1.status).toEqual(200)
    expect(res1.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(statuses1).toHaveLength(1)
    expect(statuses1[0]).toHaveProperty('id')
    expect(statuses1[0]).toHaveProperty('createdAt')
    expect(statuses1[0]).toMatchObject({
      title: 'Status #69',
      description: null,
    })
    const res2 = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .query({ title: 'Status #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses2: Status[] = res2.body.content
    expect(res2.status).toEqual(200)
    expect(res2.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(statuses1).toHaveLength(1)
    expect(statuses2[0]).toHaveProperty('id')
    expect(statuses2[0]).toHaveProperty('createdAt')
    expect(statuses2[0]).toMatchObject({
      title: 'Status #69',
      description: null,
    })
  })

  it('returns an empty statuses array if none are found', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .query({ title: 'status #420' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses: Status[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(statuses).toHaveLength(0)
  })

  it('returns statuses sorted by creation date in ascending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .query({ createdAt: 'ASC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses: Status[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(statuses).toHaveLength(10)
    statuses.forEach((status) => {
      expect(status).toHaveProperty('id')
      expect(status).toHaveProperty('createdAt')
    })
    statuses
      .slice(1)
      .forEach((status, index) =>
        expect(new Date(status.createdAt).getTime()).toBeGreaterThan(
          new Date(statuses[index].createdAt).getTime()
        )
      )
  })

  it('returns statuses sorted by creation date in descending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .query({ createdAt: 'DESC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses: Status[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(statuses).toHaveLength(10)
    statuses.forEach((status) => {
      expect(status).toHaveProperty('id')
      expect(status).toHaveProperty('createdAt')
    })
    statuses
      .slice(1)
      .forEach((status, index) =>
        expect(new Date(status.createdAt).getTime()).toBeLessThan(
          new Date(statuses[index].createdAt).getTime()
        )
      )
  })

  it('returns statuses sorted by creation date in descending order by default', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const statuses: Status[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(statuses).toHaveLength(10)
    statuses.forEach((status) => {
      expect(status).toHaveProperty('id')
      expect(status).toHaveProperty('createdAt')
    })
    statuses
      .slice(1)
      .forEach((status, index) =>
        expect(new Date(status.createdAt).getTime()).toBeLessThan(
          new Date(statuses[index].createdAt).getTime()
        )
      )
  })

  it("returns 400 Bad Request when the `createdAt` query param is not one of the following values: ['ASC', 'DESC']", async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .query({ createdAt: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for sorting statuses by creation date',
        path: 'createdAt',
        location: 'query',
      },
    ])
  })
})

describe('GET /projects/:projectId/boards/:boardId/statuses/:statusId', () => {
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
              create: omit(['description'], STATUS),
            },
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const board = (await prismaClient.board.findFirst())!
    const status = (await prismaClient.status.findFirst())!
    const res = await req
      .get(`/api/projects/abc/boards/${board.id}/statuses/${status.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const status = (await prismaClient.status.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/abc/statuses/${status.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns status by id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const status = (await prismaClient.status.findFirst({
      select: statusSelect,
    }))!
    const res = await req
      .get(
        `/api/projects/${project.id}/boards/${board.id}/statuses/${status.id}`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...status,
      createdAt: status.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid status id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}/statuses/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })
})
