import { Status } from '@prisma/client'
import { LexoRank } from 'lexorank'
import { omit } from 'ramda'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { BOARD } from '../modules/board'
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

describe('POST /projects/:projectId/boards/:boardId/statuses', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          create: BOARD,
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .post(`/api/projects/abc/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(STATUS)
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
        value: board.id,
        msg: 'Board not found',
        path: 'boardId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/boards/abc/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(STATUS)
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

  it('creates a status', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const payload = omit(['rank'], STATUS)
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject(payload)
    const statuses = await prismaClient.status.findMany()
    expect(statuses).toMatchObject([STATUS])
  })

  it('creates a status at a default position', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    await prismaClient.status.create({
      data: {
        ...STATUS,
        board: {
          connect: {
            id: board.id,
            project: {
              id: project.id,
              authorId: AUTHOR_ID,
            },
          },
        },
      },
    })
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Status #2' })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({ title: 'Status #2', description: null })
    const statuses = await prismaClient.status.findMany({
      select: { title: true, description: true, rank: true },
      orderBy: { rank: 'asc' },
    })
    expect(statuses).toStrictEqual([
      { title: 'Status #2', description: null, rank: '0|hzzzzr:' },
      STATUS,
    ])
  })

  it('prepends a status', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const status = await prismaClient.status.create({
      data: {
        ...STATUS,
        board: {
          connect: {
            id: board.id,
            project: {
              id: project.id,
              authorId: AUTHOR_ID,
            },
          },
        },
      },
    })
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #0',
        nextStatusId: status.id,
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Status #0',
      description: null,
    })
    const statuses = await prismaClient.status.findMany({
      select: { title: true, rank: true },
    })
    expect(statuses).toMatchObject([
      {
        title: 'Status #1',
        rank: LexoRank.middle().format(),
      },
      {
        title: 'Status #0',
        rank: LexoRank.parse(STATUS.rank).genPrev().format(),
      },
    ])
  })

  it('appends a status', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const status = await prismaClient.status.create({
      data: {
        ...STATUS,
        board: {
          connect: {
            id: board.id,
            project: {
              id: project.id,
              authorId: AUTHOR_ID,
            },
          },
        },
      },
    })
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #2',
        prevStatusId: status.id,
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Status #2',
      description: null,
    })
    const statuses = await prismaClient.status.findMany({
      select: { title: true, rank: true },
    })
    expect(statuses).toMatchObject([
      {
        title: 'Status #1',
        rank: LexoRank.middle().format(),
      },
      {
        title: 'Status #2',
        rank: LexoRank.parse(STATUS.rank).genNext().format(),
      },
    ])
  })

  it('inserts a status in between', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const prevStatus = await prismaClient.status.create({
      data: {
        ...STATUS,
        board: {
          connect: {
            id: board.id,
            project: {
              id: project.id,
              authorId: AUTHOR_ID,
            },
          },
        },
      },
    })
    const nextStatus = await prismaClient.status.create({
      data: {
        ...STATUS,
        rank: LexoRank.parse(STATUS.rank).genNext().genNext().format(),
        title: 'Status #3',
        board: {
          connect: {
            id: board.id,
            project: {
              id: project.id,
              authorId: AUTHOR_ID,
            },
          },
        },
      },
    })
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #2',
        prevStatusId: prevStatus.id,
        nextStatusId: nextStatus.id,
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Status #2',
      description: null,
    })
    const statuses = await prismaClient.status.findMany({
      select: { title: true, rank: true },
    })
    expect(statuses).toMatchObject([
      {
        title: 'Status #1',
        rank: LexoRank.middle().format(),
      },
      {
        title: 'Status #3',
        rank: LexoRank.parse(STATUS.rank).genNext().genNext().format(),
      },
      {
        title: 'Status #2',
        rank: LexoRank.parse(STATUS.rank).genNext().format(),
      },
    ])
  })

  it("fails to append a status when the reference ain't on the last position", async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.middle().format(),
          boardId: board.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: LexoRank.middle().genNext().format(),
          boardId: board.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.middle().genNext().genNext().format(),
          boardId: board.id,
        },
        {
          id: '4',
          title: 'Status #4',
          rank: LexoRank.middle().genNext().genNext().genNext().format(),
          boardId: board.id,
        },
        {
          id: '5',
          title: 'Status #5',
          rank: LexoRank.middle()
            .genNext()
            .genNext()
            .genNext()
            .genNext()
            .format(),
          boardId: board.id,
        },
      ],
    })
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #6',
        prevStatusId: '4',
      })
    expect(res.status).toEqual(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine status' position when appending it"
    )
  })

  it("fails to prepend a status when the reference ain't on the first position", async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.middle().format(),
          boardId: board.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: LexoRank.middle().genNext().format(),
          boardId: board.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.middle().genNext().genNext().format(),
          boardId: board.id,
        },
        {
          id: '4',
          title: 'Status #4',
          rank: LexoRank.middle().genNext().genNext().genNext().format(),
          boardId: board.id,
        },
        {
          id: '5',
          title: 'Status #5',
          rank: LexoRank.middle()
            .genNext()
            .genNext()
            .genNext()
            .genNext()
            .format(),
          boardId: board.id,
        },
      ],
    })
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #0',
        nextStatusId: '2',
      })
    expect(res.status).toEqual(400)
    expect(res.body[0].msg).toEqual(
      "Cannot determine status' position when prepending it"
    )
  })

  it('fails to insert a status in between when its neighbors are incorrectly provided', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    await prismaClient.status.createMany({
      data: [
        {
          id: '1',
          title: 'Status #1',
          rank: LexoRank.middle().format(),
          boardId: board.id,
        },
        {
          id: '2',
          title: 'Status #2',
          rank: LexoRank.middle().genNext().format(),
          boardId: board.id,
        },
        {
          id: '3',
          title: 'Status #3',
          rank: LexoRank.middle().genNext().genNext().format(),
          boardId: board.id,
        },
        {
          id: '4',
          title: 'Status #4',
          rank: LexoRank.middle().genNext().genNext().genNext().format(),
          boardId: board.id,
        },
        {
          id: '5',
          title: 'Status #5',
          rank: LexoRank.middle()
            .genNext()
            .genNext()
            .genNext()
            .genNext()
            .format(),
          boardId: board.id,
        },
      ],
    })
    const res1 = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #1.5',
        prevStatusId: '1',
        nextStatusId: '3',
      })
    expect(res1.status).toEqual(400)
    expect(res1.body[0].msg).toEqual(
      "Cannot determine status' position when putting one in between"
    )
    const res2 = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #4.0',
        prevStatusId: '3',
        nextStatusId: '5',
      })
    expect(res2.status).toEqual(400)
    expect(res2.body[0].msg).toEqual(
      "Cannot determine status' position when putting one in between"
    )
    const res3 = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #3.0',
        prevStatusId: '1',
        nextStatusId: '5',
      })
    expect(res3.status).toEqual(400)
    expect(res3.body[0].msg).toEqual(
      "Cannot determine status' position when putting one in between"
    )
    const res4 = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #2.0',
        prevStatusId: '3',
        nextStatusId: '1',
      })
    expect(res4.status).toEqual(400)
    expect(res4.body[0].msg).toEqual(
      "Cannot determine status' position when putting one in between"
    )
    const res5 = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #3.0',
        prevStatusId: '3',
        nextStatusId: '3',
      })
    expect(res5.status).toEqual(404)
    expect(res5.body[0].msg).toEqual('Status not found')
    const res6 = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Status #5.0',
        prevStatusId: '4',
        nextStatusId: '6',
      })
    expect(res6.status).toEqual(404)
    expect(res6.body[0].msg).toEqual('Status not found')
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const payload = omit(['rank', 'description'], STATUS)
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...payload,
      description: null,
    })
  })

  test('`title` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    const payload = omit(['rank', 'title'], STATUS)
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your status a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the status title is already taken', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst())!
    await prismaClient.status.create({
      data: {
        ...STATUS,
        board: {
          connect: {
            id: board.id,
            project: {
              id: project.id,
              authorId: AUTHOR_ID,
            },
          },
        },
      },
    })
    const payload = omit(['rank'], STATUS)
    const res = await req
      .post(`/api/projects/${project.id}/boards/${board.id}/statuses`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(payload)
    expect(res.status).toEqual(400)
    expect(res.body[0]).toStrictEqual({
      type: 'field',
      value: 'Status #1',
      msg: 'This title has already been used by one of your statuses',
      path: 'title',
      location: 'body',
    })
  })
})
