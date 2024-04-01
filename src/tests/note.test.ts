import { Note, Prisma } from '@prisma/client'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { ordinals } from '../modules/common'
import { NOTE, noteSelect } from '../modules/note'
import prismaClient from './client'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('GET /projects/:projectId/notes', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        notes: {
          createMany: {
            data: Array(100)
              .fill(null)
              .map((_, index, array) => ({
                title: `Note #${array.length - index}`,
                createdAt: new Date(Date.now() - index * 1000000).toISOString(),
                content: Prisma.JsonNull,
              })),
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const res = await req
      .get('/api/projects/abc/notes')
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
      .get(`/api/projects/${project.id}/notes`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes: Note[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(notes).toHaveLength(10)
    notes.forEach((note, index) => {
      expect(note).toHaveProperty('id')
      expect(note).toHaveProperty('createdAt')
      expect(note).toMatchObject({
        title: `Note #${100 - index}`,
        description: null,
      })
    })
  })

  it('returns 400 Bad Request when the page number is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
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
      .get(`/api/projects/${project.id}/notes`)
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
      it(`returns ${ordinals(page + 1)} note page`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/notes`)
          .query({ page })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const notes: Note[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page,
          size: 10,
          total: 100,
        })
        expect(notes).toHaveLength(10)
        notes.forEach((note, index) => {
          expect(note).toHaveProperty('id')
          expect(note).toHaveProperty('createdAt')
          expect(note).toMatchObject({
            title: `Note #${100 - index - page * 10}`,
            description: null,
          })
        })
      })
    )

  it('returns 400 Bad Request when the page size is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
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
      .get(`/api/projects/${project.id}/notes`)
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
      it(`returns ${size} ${size === 1 ? 'note' : 'notes'}`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/notes`)
          .query({ size })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const notes: Note[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page: 0,
          size,
          total: 100,
        })
        expect(notes).toHaveLength(size)
        notes.forEach((note, index) => {
          expect(note).toHaveProperty('id')
          expect(note).toHaveProperty('createdAt')
          expect(note).toMatchObject({
            title: `Note #${100 - index}`,
            description: null,
          })
        })
      })
    )

  it('returns notes filtered by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
      .query({
        title: 'note #10',
      })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes: Note[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 2,
    })
    expect(notes).toHaveLength(2)
    notes.forEach((note) => {
      expect(note).toHaveProperty('id')
      expect(note).toHaveProperty('createdAt')
    })
    expect(notes[0]).toMatchObject({
      title: 'Note #100',
      description: null,
    })
    expect(notes[1]).toMatchObject({
      title: 'Note #10',
      description: null,
    })
  })

  test('case insensitivity in note search by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res1 = await req
      .get(`/api/projects/${project.id}/notes`)
      .query({ title: 'note #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes1: Note[] = res1.body.content
    expect(res1.status).toEqual(200)
    expect(res1.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(notes1).toHaveLength(1)
    expect(notes1[0]).toHaveProperty('id')
    expect(notes1[0]).toHaveProperty('createdAt')
    expect(notes1[0]).toMatchObject({
      title: 'Note #69',
      description: null,
    })
    const res2 = await req
      .get(`/api/projects/${project.id}/notes`)
      .query({ title: 'Note #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes2: Note[] = res2.body.content
    expect(res2.status).toEqual(200)
    expect(res2.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(notes1).toHaveLength(1)
    expect(notes2[0]).toHaveProperty('id')
    expect(notes2[0]).toHaveProperty('createdAt')
    expect(notes2[0]).toMatchObject({
      title: 'Note #69',
      description: null,
    })
  })

  it('returns an empty notes array if none are found', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
      .query({ title: 'note #420' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes: Note[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(notes).toHaveLength(0)
  })

  it('returns notes sorted by creation date in ascending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
      .query({ createdAt: 'ASC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes: Note[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(notes).toHaveLength(10)
    notes.forEach((note) => {
      expect(note).toHaveProperty('id')
      expect(note).toHaveProperty('createdAt')
    })
    notes
      .slice(1)
      .forEach((note, index) =>
        expect(new Date(note.createdAt).getTime()).toBeGreaterThan(
          new Date(notes[index].createdAt).getTime()
        )
      )
  })

  it('returns notes sorted by creation date in descending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
      .query({ createdAt: 'DESC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes: Note[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(notes).toHaveLength(10)
    notes.forEach((note) => {
      expect(note).toHaveProperty('id')
      expect(note).toHaveProperty('createdAt')
    })
    notes
      .slice(1)
      .forEach((note, index) =>
        expect(new Date(note.createdAt).getTime()).toBeLessThan(
          new Date(notes[index].createdAt).getTime()
        )
      )
  })

  it('returns notes sorted by creation date in descending order by default', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const notes: Note[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(notes).toHaveLength(10)
    notes.forEach((note) => {
      expect(note).toHaveProperty('id')
      expect(note).toHaveProperty('createdAt')
    })
    notes
      .slice(1)
      .forEach((note, index) =>
        expect(new Date(note.createdAt).getTime()).toBeLessThan(
          new Date(notes[index].createdAt).getTime()
        )
      )
  })

  it("returns 400 Bad Request when the `createdAt` query param is not one of the following values: ['ASC', 'DESC']", async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes`)
      .query({ createdAt: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for sorting notes by creation date',
        path: 'createdAt',
        location: 'query',
      },
    ])
  })
})

describe('GET /projects/:projectId/notes/:noteId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        notes: {
          create: {
            title: 'Note #1',
            content: Prisma.JsonNull,
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const note = (await prismaClient.note.findFirst())!
    const res = await req
      .get(`/api/projects/abc/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns a note by id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const note = (await prismaClient.note.findFirst({
      select: noteSelect,
    }))!
    const res = await req
      .get(`/api/projects/${project.id}/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...note,
      createdAt: note.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid note id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/notes/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })
})

describe('POST /projects/:projectId/notes', () => {
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
      .post('/api/projects/abc/notes')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTE)
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

  it('creates a note', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/notes`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTE)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject(NOTE)
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/notes`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Note #1',
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Note #1',
    })
  })

  test('`title` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/notes`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: '' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your note a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the note title is already taken', async () => {
    const project = (await prismaClient.project.findFirst())!
    await prismaClient.note.create({
      data: {
        title: 'Note #1',
        content: Prisma.JsonNull,
        projectId: project.id,
      },
    })
    const res = await req
      .post(`/api/projects/${project.id}/notes`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Note #1' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Note #1',
        msg: 'This title has already been used by one of your notes',
        path: 'title',
        location: 'body',
      },
    ])
  })
})

describe('PUT /projects/:projectId/notes/:noteId', () => {
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
    const note = await prismaClient.note.create({
      select: noteSelect,
      data: {
        title: 'Note #1',
        content: Prisma.JsonNull,
        projectId: project.id,
      },
    })
    const res = await req
      .get(`/api/projects/abc/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('updates a note', async () => {
    const project = (await prismaClient.project.findFirst())!
    const note = await prismaClient.note.create({
      select: noteSelect,
      data: {
        title: 'Note #1',
        content: Prisma.JsonNull,
        projectId: project.id,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Note #2',
        description: 'This is the second note',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...note,
      title: 'Note #2',
      description: 'This is the second note',
      createdAt: note.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid note id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .put(`/api/projects/${project.id}/notes/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Note #2',
        description: 'This is the second note',
      })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Note not found',
        path: 'noteId',
        location: 'params',
      },
    ])
  })

  test('`title` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const note = await prismaClient.note.create({
      select: noteSelect,
      data: {
        title: 'Note #1',
        content: Prisma.JsonNull,
        projectId: project.id,
      },
    })
    const [res1, res2] = await Promise.all([
      req
        .put(`/api/projects/${project.id}/notes/${note.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({}),
      req
        .put(`/api/projects/${project.id}/notes/${note.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({ title: '' }),
    ])
    expect(res1.status).toEqual(400)
    expect(res1.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your note a unique title',
        path: 'title',
        location: 'body',
      },
    ])
    expect(res2.status).toEqual(400)
    expect(res2.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your note a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the note title is already taken', async () => {
    const project = (await prismaClient.project.findFirst())!
    await prismaClient.note.createMany({
      data: [
        {
          title: 'Note #1',
          content: Prisma.JsonNull,
          projectId: project.id,
        },
        {
          title: 'Note #2',
          content: Prisma.JsonNull,
          projectId: project.id,
        },
      ],
    })
    const note = (await prismaClient.note.findFirst({
      select: noteSelect,
    }))!
    const res = await req
      .put(`/api/projects/${project.id}/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Note #2' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Note #2',
        msg: 'This title has already been used by one of your notes',
        path: 'title',
        location: 'body',
      },
    ])
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const note = await prismaClient.note.create({
      select: noteSelect,
      data: {
        title: 'Note #1',
        content: Prisma.JsonNull,
        projectId: project.id,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Note #2',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...note,
      title: 'Note #2',
      createdAt: note.createdAt.toISOString(),
    })
  })
})

describe('DELETE /projects/:projectId/notes/:noteId', () => {
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
    const note = await prismaClient.note.create({
      select: noteSelect,
      data: {
        title: 'Note #1',
        content: Prisma.JsonNull,
        projectId: project.id,
      },
    })
    const res = await req
      .get(`/api/projects/abc/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('deletes a note', async () => {
    const project = (await prismaClient.project.findFirst())!
    const note = await prismaClient.note.create({
      select: noteSelect,
      data: {
        title: 'Note #1',
        content: Prisma.JsonNull,
        projectId: project.id,
      },
    })
    const res = await req
      .delete(`/api/projects/${project.id}/notes/${note.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...note,
      createdAt: note.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid note id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .delete(`/api/projects/${project.id}/notes/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Note not found',
        path: 'noteId',
        location: 'params',
      },
    ])
  })
})
