import { Schedule } from '@prisma/client'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import prismaClient from './client'
import { ordinals } from '../modules/common'
import { SCHEDULE, scheduleSelect } from '../modules/schedule'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('GET /projects/:projectId/schedules', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          createMany: {
            data: Array(100)
              .fill(null)
              .map((_, index, array) => ({
                title: `Schedule #${array.length - index}`,
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
      .get('/api/projects/abc/schedules')
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
      .get(`/api/projects/${project.id}/schedules`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules: Schedule[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(schedules).toHaveLength(10)
    schedules.forEach((schedule, index) => {
      expect(schedule).toHaveProperty('id')
      expect(schedule).toHaveProperty('createdAt')
      expect(schedule).toMatchObject({
        title: `Schedule #${100 - index}`,
        description: null,
      })
    })
  })

  it('returns 400 Bad Request when the page number is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
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
      .get(`/api/projects/${project.id}/schedules`)
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
      it(`returns ${ordinals(page + 1)} schedule page`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/schedules`)
          .query({ page })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const schedules: Schedule[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page,
          size: 10,
          total: 100,
        })
        expect(schedules).toHaveLength(10)
        schedules.forEach((schedule, index) => {
          expect(schedule).toHaveProperty('id')
          expect(schedule).toHaveProperty('createdAt')
          expect(schedule).toMatchObject({
            title: `Schedule #${100 - index - page * 10}`,
            description: null,
          })
        })
      })
    )

  it('returns 400 Bad Request when the page size is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
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
      .get(`/api/projects/${project.id}/schedules`)
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
      it(`returns ${size} ${size === 1 ? 'schedule' : 'schedules'}`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/schedules`)
          .query({ size })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const schedules: Schedule[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page: 0,
          size,
          total: 100,
        })
        expect(schedules).toHaveLength(size)
        schedules.forEach((schedule, index) => {
          expect(schedule).toHaveProperty('id')
          expect(schedule).toHaveProperty('createdAt')
          expect(schedule).toMatchObject({
            title: `Schedule #${100 - index}`,
            description: null,
          })
        })
      })
    )

  it('returns schedules filtered by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
      .query({
        title: 'schedule #10',
      })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules: Schedule[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 2,
    })
    expect(schedules).toHaveLength(2)
    schedules.forEach((schedule) => {
      expect(schedule).toHaveProperty('id')
      expect(schedule).toHaveProperty('createdAt')
    })
    expect(schedules[0]).toMatchObject({
      title: 'Schedule #100',
      description: null,
    })
    expect(schedules[1]).toMatchObject({
      title: 'Schedule #10',
      description: null,
    })
  })

  test('case insensitivity in schedule search by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res1 = await req
      .get(`/api/projects/${project.id}/schedules`)
      .query({ title: 'schedule #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules1: Schedule[] = res1.body.content
    expect(res1.status).toEqual(200)
    expect(res1.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(schedules1).toHaveLength(1)
    expect(schedules1[0]).toHaveProperty('id')
    expect(schedules1[0]).toHaveProperty('createdAt')
    expect(schedules1[0]).toMatchObject({
      title: 'Schedule #69',
      description: null,
    })
    const res2 = await req
      .get(`/api/projects/${project.id}/schedules`)
      .query({ title: 'Schedule #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules2: Schedule[] = res2.body.content
    expect(res2.status).toEqual(200)
    expect(res2.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(schedules1).toHaveLength(1)
    expect(schedules2[0]).toHaveProperty('id')
    expect(schedules2[0]).toHaveProperty('createdAt')
    expect(schedules2[0]).toMatchObject({
      title: 'Schedule #69',
      description: null,
    })
  })

  it('returns an empty schedules array if none are found', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
      .query({ title: 'schedule #420' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules: Schedule[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(schedules).toHaveLength(0)
  })

  it('returns schedules sorted by creation date in ascending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
      .query({ createdAt: 'ASC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules: Schedule[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(schedules).toHaveLength(10)
    schedules.forEach((schedule) => {
      expect(schedule).toHaveProperty('id')
      expect(schedule).toHaveProperty('createdAt')
    })
    schedules
      .slice(1)
      .forEach((schedule, index) =>
        expect(new Date(schedule.createdAt).getTime()).toBeGreaterThan(
          new Date(schedules[index].createdAt).getTime()
        )
      )
  })

  it('returns schedules sorted by creation date in descending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
      .query({ createdAt: 'DESC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules: Schedule[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(schedules).toHaveLength(10)
    schedules.forEach((schedule) => {
      expect(schedule).toHaveProperty('id')
      expect(schedule).toHaveProperty('createdAt')
    })
    schedules
      .slice(1)
      .forEach((schedule, index) =>
        expect(new Date(schedule.createdAt).getTime()).toBeLessThan(
          new Date(schedules[index].createdAt).getTime()
        )
      )
  })

  it('returns schedules sorted by creation date in descending order by default', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const schedules: Schedule[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(schedules).toHaveLength(10)
    schedules.forEach((schedule) => {
      expect(schedule).toHaveProperty('id')
      expect(schedule).toHaveProperty('createdAt')
    })
    schedules
      .slice(1)
      .forEach((schedule, index) =>
        expect(new Date(schedule.createdAt).getTime()).toBeLessThan(
          new Date(schedules[index].createdAt).getTime()
        )
      )
  })

  it("returns 400 Bad Request when the `createdAt` query param is not one of the following values: ['ASC', 'DESC']", async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules`)
      .query({ createdAt: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for sorting schedules by creation date',
        path: 'createdAt',
        location: 'query',
      },
    ])
  })
})

describe('GET /projects/:projectId/schedules/:scheduleId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          create: {
            title: 'Schedule #1',
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/abc/schedules/${schedule.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('returns a schedule by id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst({
      select: scheduleSelect,
    }))!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...schedule,
      createdAt: schedule.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })
})

describe('POST /projects/:projectId/schedules', () => {
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
      .post('/api/projects/abc/schedules')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(SCHEDULE)
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

  it('creates a schedule', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/schedules`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(SCHEDULE)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject(SCHEDULE)
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/schedules`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Schedule #1',
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Schedule #1',
    })
  })

  test('`title` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .post(`/api/projects/${project.id}/schedules`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: '' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your schedule a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the schedule title is already taken', async () => {
    const project = (await prismaClient.project.findFirst())!
    await prismaClient.schedule.create({
      data: {
        title: 'Schedule #1',
        projectId: project.id,
      },
    })
    const res = await req
      .post(`/api/projects/${project.id}/schedules`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Schedule #1' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Schedule #1',
        msg: 'This title has already been used by one of your schedules',
        path: 'title',
        location: 'body',
      },
    ])
  })
})

describe('PUT /projects/:projectId/schedules/:scheduleId', () => {
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
    const schedule = await prismaClient.schedule.create({
      select: scheduleSelect,
      data: {
        title: 'Schedule #1',
        projectId: project.id,
      },
    })
    const res = await req
      .get(`/api/projects/abc/schedules/${schedule.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })

  it('updates a schedule', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = await prismaClient.schedule.create({
      select: scheduleSelect,
      data: {
        title: 'Schedule #1',
        projectId: project.id,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}/schedules/${schedule.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Schedule #2',
        description: 'This is the second schedule',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...schedule,
      title: 'Schedule #2',
      description: 'This is the second schedule',
      createdAt: schedule.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .put(`/api/projects/${project.id}/schedules/abc`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Schedule #2',
        description: 'This is the second schedule',
      })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Schedule not found',
        path: 'scheduleId',
        location: 'params',
      },
    ])
  })

  test('`title` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = await prismaClient.schedule.create({
      select: scheduleSelect,
      data: {
        title: 'Schedule #1',
        projectId: project.id,
      },
    })
    const [res1, res2] = await Promise.all([
      req
        .put(`/api/projects/${project.id}/schedules/${schedule.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({}),
      req
        .put(`/api/projects/${project.id}/schedules/${schedule.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({ title: '' }),
    ])
    expect(res1.status).toEqual(400)
    expect(res1.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your schedule a unique title',
        path: 'title',
        location: 'body',
      },
    ])
    expect(res2.status).toEqual(400)
    expect(res2.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your schedule a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the schedule title is already taken', async () => {
    const project = (await prismaClient.project.findFirst())!
    await prismaClient.schedule.createMany({
      data: [
        {
          title: 'Schedule #1',
          projectId: project.id,
        },
        {
          title: 'Schedule #2',
          projectId: project.id,
        },
      ],
    })
    const schedule = (await prismaClient.schedule.findFirst({
      select: scheduleSelect,
    }))!
    const res = await req
      .put(`/api/projects/${project.id}/schedules/${schedule.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Schedule #2' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Schedule #2',
        msg: 'This title has already been used by one of your schedules',
        path: 'title',
        location: 'body',
      },
    ])
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = await prismaClient.schedule.create({
      select: scheduleSelect,
      data: {
        title: 'Schedule #1',
        projectId: project.id,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}/schedules/${schedule.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Schedule #2',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...schedule,
      title: 'Schedule #2',
      createdAt: schedule.createdAt.toISOString(),
    })
  })
})
