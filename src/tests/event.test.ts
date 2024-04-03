import { Event } from '@prisma/client'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import prismaClient from './client'
import { ordinals } from '../modules/common'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('GET /projects/:projectId/schedules/:scheduleId/events', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          create: {
            id: '7a6ea58e-4e88-4e94-9eeb-800527aa88b6',
            title: 'Schedule #1',
            events: {
              createMany: {
                data: Array(100)
                  .fill(null)
                  .map((_, index, array) => ({
                    title: `Event #${array.length - index}`,
                    createdAt: new Date(
                      Date.now() - index * 1000000
                    ).toISOString(),
                    startsAt: '2024-04-02T13:07:37.603Z',
                    endsAt: '2024-04-03T03:51:13.040Z',
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
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/abc/schedules/${schedule.id}/events`)
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
        msg: 'Schedule not found',
        path: 'scheduleId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/abc/events`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
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

  test('`page`, `size`, `title`, `createdAt`, `startsAt` and `endsAt` query param being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event, index) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
      expect(event).toMatchObject({
        title: `Event #${100 - index}`,
        description: null,
        startsAt: '2024-04-02T13:07:37.603Z',
        endsAt: '2024-04-03T03:51:13.040Z',
      })
    })
  })

  it('returns 400 Bad Request when the page number is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
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
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
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
      it(`returns ${ordinals(page + 1)} event page`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const schedule = (await prismaClient.schedule.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
          .query({ page })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const events: Event[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page,
          size: 10,
          total: 100,
        })
        expect(events).toHaveLength(10)
        events.forEach((event, index) => {
          expect(event).toHaveProperty('id')
          expect(event).toHaveProperty('createdAt')
          expect(event).toMatchObject({
            title: `Event #${100 - index - page * 10}`,
            description: null,
            startsAt: '2024-04-02T13:07:37.603Z',
            endsAt: '2024-04-03T03:51:13.040Z',
          })
        })
      })
    )

  it('returns 400 Bad Request when the page size is negative', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
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
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
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
      it(`returns ${size} ${size === 1 ? 'event' : 'events'}`, async () => {
        const project = (await prismaClient.project.findFirst())!
        const schedule = (await prismaClient.schedule.findFirst())!
        const res = await req
          .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
          .query({ size })
          .set('Accept', 'application/json')
          .set('Authorization', BEARER_TOKEN)
        const events: Event[] = res.body.content
        expect(res.status).toEqual(200)
        expect(res.body).toMatchObject({
          page: 0,
          size,
          total: 100,
        })
        expect(events).toHaveLength(size)
        events.forEach((event, index) => {
          expect(event).toHaveProperty('id')
          expect(event).toHaveProperty('createdAt')
          expect(event).toMatchObject({
            title: `Event #${100 - index}`,
            description: null,
            startsAt: '2024-04-02T13:07:37.603Z',
            endsAt: '2024-04-03T03:51:13.040Z',
          })
        })
      })
    )

  it('returns events filtered by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({
        title: 'event #10',
      })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 2,
    })
    expect(events).toHaveLength(2)
    events.forEach((event) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
      expect(event.startsAt).toEqual('2024-04-02T13:07:37.603Z')
      expect(event.endsAt).toEqual('2024-04-03T03:51:13.040Z')
    })
    expect(events[0]).toMatchObject({
      title: 'Event #100',
      description: null,
      startsAt: '2024-04-02T13:07:37.603Z',
      endsAt: '2024-04-03T03:51:13.040Z',
    })
    expect(events[1]).toMatchObject({
      title: 'Event #10',
      description: null,
      startsAt: '2024-04-02T13:07:37.603Z',
      endsAt: '2024-04-03T03:51:13.040Z',
    })
  })

  test('case insensitivity in event search by title', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res1 = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ title: 'event #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events1: Event[] = res1.body.content
    expect(res1.status).toEqual(200)
    expect(res1.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(events1).toHaveLength(1)
    expect(events1[0]).toHaveProperty('id')
    expect(events1[0]).toHaveProperty('createdAt')
    expect(events1[0]).toMatchObject({
      title: 'Event #69',
      description: null,
      startsAt: '2024-04-02T13:07:37.603Z',
      endsAt: '2024-04-03T03:51:13.040Z',
    })
    const res2 = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ title: 'Event #69' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events2: Event[] = res2.body.content
    expect(res2.status).toEqual(200)
    expect(res2.body).toMatchObject({
      page: 0,
      size: 10,
      total: 1,
    })
    expect(events1).toHaveLength(1)
    expect(events2[0]).toHaveProperty('id')
    expect(events2[0]).toHaveProperty('createdAt')
    expect(events2[0]).toMatchObject({
      title: 'Event #69',
      description: null,
      startsAt: '2024-04-02T13:07:37.603Z',
      endsAt: '2024-04-03T03:51:13.040Z',
    })
  })

  it('returns an empty events array if none are found', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ title: 'event #420' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(events).toHaveLength(0)
  })

  it('returns events sorted by creation date in ascending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ createdAt: 'ASC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
    })
    events
      .slice(1)
      .forEach((event, index) =>
        expect(new Date(event.createdAt).getTime()).toBeGreaterThan(
          new Date(events[index].createdAt).getTime()
        )
      )
  })

  it('returns events sorted by creation date in descending order', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ createdAt: 'DESC' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
    })
    events
      .slice(1)
      .forEach((event, index) =>
        expect(new Date(event.createdAt).getTime()).toBeLessThan(
          new Date(events[index].createdAt).getTime()
        )
      )
  })

  it('returns events sorted by creation date in descending order by default', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
    })
    events
      .slice(1)
      .forEach((event, index) =>
        expect(new Date(event.createdAt).getTime()).toBeLessThan(
          new Date(events[index].createdAt).getTime()
        )
      )
  })

  it("returns 400 Bad Request when the `createdAt` query param is not one of the following values: ['ASC', 'DESC']", async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ createdAt: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for sorting events by creation date',
        path: 'createdAt',
        location: 'query',
      },
    ])
  })

  test('`startAt` query param being an ISO 8601 compliant date string', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ startAt: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Start date must follow the ISO 8601 standard',
        path: 'startAt',
        location: 'query',
      },
    ])
  })

  test('`endAt` query param being an ISO 8601 compliant date string', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ endAt: 'abc' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'End date must follow the ISO 8601 standard',
        path: 'endAt',
        location: 'query',
      },
    ])
  })

  it('returns events starting exactly at a given date', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ startAt: '2024-04-02T13:07:37.603Z' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event, index) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
      expect(event).toMatchObject({
        title: `Event #${100 - index}`,
        description: null,
        startsAt: '2024-04-02T13:07:37.603Z',
        endsAt: '2024-04-03T03:51:13.040Z',
      })
    })
  })

  it('returns events starting after a given date', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ startAt: '2024-04-01T13:07:37.603Z' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event, index) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
      expect(event).toMatchObject({
        title: `Event #${100 - index}`,
        description: null,
        startsAt: '2024-04-02T13:07:37.603Z',
        endsAt: '2024-04-03T03:51:13.040Z',
      })
    })
  })

  it('returns no events starting after a given date', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ startAt: '2024-04-03T13:07:37.603Z' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(events).toHaveLength(0)
  })

  it('returns events ending exactly at a given date', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ endAt: '2024-04-03T03:51:13.040Z' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event, index) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
      expect(event).toMatchObject({
        title: `Event #${100 - index}`,
        description: null,
        startsAt: '2024-04-02T13:07:37.603Z',
        endsAt: '2024-04-03T03:51:13.040Z',
      })
    })
  })

  it('returns events ending before a given date', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ endAt: '2024-04-04T03:51:13.040Z' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 100,
    })
    expect(events).toHaveLength(10)
    events.forEach((event, index) => {
      expect(event).toHaveProperty('id')
      expect(event).toHaveProperty('createdAt')
      expect(event).toMatchObject({
        title: `Event #${100 - index}`,
        description: null,
        startsAt: '2024-04-02T13:07:37.603Z',
        endsAt: '2024-04-03T03:51:13.040Z',
      })
    })
  })

  it('returns no events ending before a given date', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(`/api/projects/${project.id}/schedules/${schedule.id}/events`)
      .query({ endAt: '2024-04-02T03:51:13.040Z' })
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    const events: Event[] = res.body.content
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      page: 0,
      size: 10,
      total: 0,
    })
    expect(events).toHaveLength(0)
  })
})
