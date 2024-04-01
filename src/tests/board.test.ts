import { Board } from '@prisma/client'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { BOARD, boardSelect } from '../modules/board'
import { ordinals } from '../modules/common'
import prismaClient from './client'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('GET /projects/:projectId/boards', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          createMany: {
            data: Array(100)
              .fill(null)
              .map((_, index, array) => ({
                title: `Board #${array.length - index}`,
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
              })),
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const res = await req
      .get('/api/projects/abc/boards')
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
    ])
  })

  test('`page`, `size`, `title` and `createdAt` query param being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards: Board[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(boards).toHaveLength(10)
    boards.forEach((board, index) => {
      expect(board).toHaveProperty('id')
      expect(board).toHaveProperty('createdAt')
      expect(board).toMatchObject({
        title: `Board #${100 - index}`,
        description: null,
      })
    })
  })

  it('returns 400 Bad Request when the page number is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
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
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
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
      it(`returns ${ordinals(page + 1)} board page`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/boards`)
          .query({ page })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const boards: Board[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page,
          size: 10,
          total: 100,
        })
        expect(boards).toHaveLength(10)
        boards.forEach((board, index) => {
          expect(board).toHaveProperty('id')
          expect(board).toHaveProperty('createdAt')
          expect(board).toMatchObject({
            title: `Board #${100 - index - page * 10}`,
            description: null,
          })
        })
      })
    )

  it('returns 400 Bad Request when the page size is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
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
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
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
      it(`returns ${size} ${size === 1 ? 'board' : 'boards'}`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/boards`)
          .query({ size })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const boards: Board[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page: 0,
          size,
          total: 100,
        })
        expect(boards).toHaveLength(size)
        boards.forEach((board, index) => {
          expect(board).toHaveProperty('id')
          expect(board).toHaveProperty('createdAt')
          expect(board).toMatchObject({
            title: `Board #${100 - index}`,
            description: null,
          })
        })
      })
    )

  it('returns boards filtered by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
      .query({
        title: 'board #10',
      })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards: Board[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 2,
    })
    expect(boards).toHaveLength(2)
    boards.forEach((board) => {
      expect(board).toHaveProperty('id')
      expect(board).toHaveProperty('createdAt')
    })
    expect(boards[0]).toMatchObject({
      title: 'Board #100',
      description: null,
    })
    expect(boards[1]).toMatchObject({
      title: 'Board #10',
      description: null,
    })
  })

  test('case insensitivity in board search by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res1 = await req
      .get(`/api/projects/${project.id}/boards`)
      .query({ title: 'board #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards1: Board[] = res1.body.content
    expect(res1.status).toEqual(200)
    expect(res1.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(boards1).toHaveLength(1)
    expect(boards1[0]).toHaveProperty('id')
    expect(boards1[0]).toHaveProperty('createdAt')
    expect(boards1[0]).toMatchObject({
      title: 'Board #69',
      description: null,
    })
    const res2 = await req
      .get(`/api/projects/${project.id}/boards`)
      .query({ title: 'Board #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards2: Board[] = res2.body.content
    expect(res2.status).toEqual(200)
    expect(res2.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(boards1).toHaveLength(1)
    expect(boards2[0]).toHaveProperty('id')
    expect(boards2[0]).toHaveProperty('createdAt')
    expect(boards2[0]).toMatchObject({
      title: 'Board #69',
      description: null,
    })
  })

  it('returns an empty boards array if none are found', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
      .query({ title: 'board #420' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards: Board[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(boards).toHaveLength(0)
  })

  it('returns boards sorted by creation date in ascending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
      .query({ createdAt: 'ASC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards: Board[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(boards).toHaveLength(10)
    boards.forEach((board) => {
      expect(board).toHaveProperty('id')
      expect(board).toHaveProperty('createdAt')
    })
    boards
      .slice(1)
      .forEach((board, index) =>
        expect(new Date(board.createdAt).getTime()).toBeGreaterThan(
          new Date(boards[index].createdAt).getTime()
        )
      )
  })

  it('returns boards sorted by creation date in descending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
      .query({ createdAt: 'DESC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards: Board[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(boards).toHaveLength(10)
    boards.forEach((board) => {
      expect(board).toHaveProperty('id')
      expect(board).toHaveProperty('createdAt')
    })
    boards
      .slice(1)
      .forEach((board, index) =>
        expect(new Date(board.createdAt).getTime()).toBeLessThan(
          new Date(boards[index].createdAt).getTime()
        )
      )
  })

  it('returns boards sorted by creation date in descending order by default', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const boards: Board[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(boards).toHaveLength(10)
    boards.forEach((board) => {
      expect(board).toHaveProperty('id')
      expect(board).toHaveProperty('createdAt')
    })
    boards
      .slice(1)
      .forEach((board, index) =>
        expect(new Date(board.createdAt).getTime()).toBeLessThan(
          new Date(boards[index].createdAt).getTime()
        )
      )
  })

  it("returns 400 Bad Request when the `createdAt` query param is not one of the following values: ['ASC', 'DESC']", async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards`)
      .query({ createdAt: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for sorting boards by creation date',
        path: 'createdAt',
        location: 'query',
      },
    ])
  })
})

describe('GET /projects/:projectId/boards/:boardId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        boards: {
          create: {
            title: 'Board #1',
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const board = (await prismaClient.board.findFirst())!
    const res = await req
      .get(`/api/projects/abc/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns a board by id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = (await prismaClient.board.findFirst({
      select: boardSelect,
    }))!
    const res = await req
      .get(`/api/projects/${project.id}/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...board,
      createdAt: board.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/boards/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })
})

describe('POST /projects/:projectId/boards', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const res = await req
      .post('/api/projects/abc/boards')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(BOARD)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Project not found',
        path: 'projectId',
        location: 'params',
      },
    ])
  })

  it('creates a board', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/boards`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(BOARD)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject(BOARD)
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/boards`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Board #1',
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Board #1',
    })
  })

  test('`title` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/boards`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: '' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your board a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the board title is already taken', async () => {
    const project = (await prismaClient.project.findFirst())!
    await prismaClient.board.create({
      data: {
        title: 'Board #1',
        projectId: project.id,
      },
    })
    const res = await req
      .post(`/api/projects/${project.id}/boards`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Board #1' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Board #1',
        msg: 'This title has already been used by one of your boards',
        path: 'title',
        location: 'body',
      },
    ])
  })
})

describe('PUT /projects/:projectId/boards/:boardId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = await prismaClient.board.create({
      select: boardSelect,
      data: {
        title: 'Board #1',
        projectId: project.id,
      },
    })
    const res = await req
      .get(`/api/projects/abc/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('updates a board', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = await prismaClient.board.create({
      select: boardSelect,
      data: {
        title: 'Board #1',
        projectId: project.id,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Board #2',
        description: 'This is the second board',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...board,
      title: 'Board #2',
      description: 'This is the second board',
      createdAt: board.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .put(`/api/projects/${project.id}/boards/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Board #2',
        description: 'This is the second board',
      })
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

  test('`title` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = await prismaClient.board.create({
      select: boardSelect,
      data: {
        title: 'Board #1',
        projectId: project.id,
      },
    })
    const [res1, res2] = await Promise.all([
      req
        .put(`/api/projects/${project.id}/boards/${board.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({}),
      req
        .put(`/api/projects/${project.id}/boards/${board.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({ title: '' }),
    ])
    expect(res1.status).toEqual(400)
    expect(res1.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your board a unique title',
        path: 'title',
        location: 'body',
      },
    ])
    expect(res2.status).toEqual(400)
    expect(res2.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your board a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the board title is already taken', async () => {
    const project = (await prismaClient.project.findFirst())!
    await prismaClient.board.createMany({
      data: [
        {
          title: 'Board #1',
          projectId: project.id,
        },
        {
          title: 'Board #2',
          projectId: project.id,
        },
      ],
    })
    const board = (await prismaClient.board.findFirst({
      select: boardSelect,
    }))!
    const res = await req
      .put(`/api/projects/${project.id}/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Board #2' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Board #2',
        msg: 'This title has already been used by one of your boards',
        path: 'title',
        location: 'body',
      },
    ])
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = await prismaClient.board.create({
      select: boardSelect,
      data: {
        title: 'Board #1',
        projectId: project.id,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Board #2',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...board,
      title: 'Board #2',
      createdAt: board.createdAt.toISOString(),
    })
  })
})

describe('DELETE /projects/:projectId/boards/:boardId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = await prismaClient.board.create({
      select: boardSelect,
      data: {
        title: 'Board #1',
        projectId: project.id,
      },
    })
    const res = await req
      .get(`/api/projects/abc/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('deletes a board', async () => {
    const project = (await prismaClient.project.findFirst())!
    const board = await prismaClient.board.create({
      select: boardSelect,
      data: {
        title: 'Board #1',
        projectId: project.id,
      },
    })
    const res = await req
      .delete(`/api/projects/${project.id}/boards/${board.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...board,
      createdAt: board.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid board id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .delete(`/api/projects/${project.id}/boards/abc`)
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
})
