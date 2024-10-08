import { omit } from 'ramda'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { EVENT } from '../modules/event'
import { NOTIFICATION, notificationSelect } from '../modules/notification'
import prismaClient from './client'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('GET /projects/:projectId/schedules/:scheduleId/events/:eventId/notification', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          create: {
            title: 'Schedule #1',
            events: {
              create: {
                title: 'Event #1',
                startsAt: '2024-04-02T13:07:37.603Z',
                endsAt: '2024-04-03T03:51:13.040Z',
                notification: {
                  create: { ...NOTIFICATION, authorId: AUTHOR_ID },
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
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .get(
        `/api/projects/abc/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toBe(null)
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .get(
        `/api/projects/${project.id}/schedules/abc/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toBe(null)
  })

  it('returns 404 Not Found in case of invalid event id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .get(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/abc/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toBe(null)
  })

  it('returns a notification', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .get(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toMatchObject({
      ...NOTIFICATION,
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })
})

describe('POST /projects/:projectId/schedules/:scheduleId/events/:eventId/notification', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          create: {
            title: 'Schedule #1',
            events: {
              create: EVENT,
            },
          },
        },
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/abc/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
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
        value: schedule.id,
        msg: 'Schedule not found',
        path: 'scheduleId',
        location: 'params',
      },
      {
        type: 'field',
        value: event.id,
        msg: 'Event not found',
        path: 'eventId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/abc/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Schedule not found',
        path: 'scheduleId',
        location: 'params',
      },
      {
        type: 'field',
        value: event.id,
        msg: 'Event not found',
        path: 'eventId',
        location: 'params',
      },
    ])
  })

  it('returns 404 Not Found in case of invalid event id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/abc/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Event not found',
        path: 'eventId',
        location: 'params',
      },
    ])
  })

  it('creates a notification', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...NOTIFICATION,
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })

  it('fails to create a notification for a given event as it already has one', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    await prismaClient.notification.create({
      data: {
        ...NOTIFICATION,
        authorId: AUTHOR_ID,
        eventId: event.id,
      },
    })
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: event.id,
        msg: 'A notification for the specified event has already been created',
        path: 'eventId',
        location: 'params',
      },
    ])
  })

  test('`title` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...omit(['title'], NOTIFICATION),
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...omit(['description'], NOTIFICATION),
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })

  test('`startsAt` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(omit(['startsAt'], NOTIFICATION))
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'You have to assign a start date to your notification',
        path: 'startsAt',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Start date must follow the ISO 8601 standard',
        path: 'startsAt',
        location: 'body',
      },
    ])
  })

  test('`startsAt` field in request body following ISO 8601 standard', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...NOTIFICATION, startsAt: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Start date must follow the ISO 8601 standard',
        path: 'startsAt',
        location: 'body',
      },
    ])
  })

  it("fails to create a notification if its start time is greater than the event's start time", async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...NOTIFICATION, startsAt: '2024-04-02T14:25:55.184Z' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '2024-04-02T14:25:55.184Z',
        msg: "Notification's start time cannot exceed the start time of the event",
        path: 'startsAt',
        location: 'body',
      },
    ])
  })

  test('`isActive` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(omit(['isActive'], NOTIFICATION))
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...NOTIFICATION,
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })

  test('`isActive` field in request body being a boolean value', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...NOTIFICATION, isActive: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for setting the initial active state',
        path: 'isActive',
        location: 'body',
      },
    ])
  })
})

describe('PUT /projects/:projectId/schedules/:scheduleId/events/:eventId/notification', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          create: {
            title: 'Schedule #1',
            events: {
              create: {
                ...EVENT,
                notification: {
                  create: { ...NOTIFICATION, authorId: AUTHOR_ID },
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
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/abc/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Project not found',
        path: 'projectId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'Schedule not found',
        path: 'scheduleId',
        type: 'field',
        value: schedule.id,
      },
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
    ])
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/abc/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Schedule not found',
        path: 'scheduleId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
    ])
  })

  it('returns 404 Not Found in case of invalid event id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/abc/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: 'abc',
      },
    ])
  })

  it('updates a notification', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Notification #420',
        startsAt: '2024-04-02T12:25:54.183Z',
        isActive: false,
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Notification #420',
      description: null,
      startsAt: '2024-04-02T12:25:54.183Z',
      isActive: false,
    })
  })

  it('fails to update a notification for a given event as it does not have one', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = await prismaClient.event.create({
      data: {
        ...EVENT,
        title: 'Notification #2',
        scheduleId: schedule.id,
      },
    })
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: event.id,
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        location: 'params',
      },
    ])
  })

  test('`title` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...omit(['title'], NOTIFICATION),
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })

  test('`description` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(NOTIFICATION)
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...omit(['description'], NOTIFICATION),
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })

  test('`startsAt` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(omit(['startsAt'], NOTIFICATION))
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'You have to assign a start date to your notification',
        path: 'startsAt',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Start date must follow the ISO 8601 standard',
        path: 'startsAt',
        location: 'body',
      },
    ])
  })

  test('`startsAt` field in request body following ISO 8601 standard', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...NOTIFICATION, startsAt: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Start date must follow the ISO 8601 standard',
        path: 'startsAt',
        location: 'body',
      },
    ])
  })

  it("fails to update a notification if its start time is greater than the event's start time", async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...NOTIFICATION, startsAt: '2024-04-02T14:25:55.184Z' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '2024-04-02T14:25:55.184Z',
        msg: "Notification's start time cannot exceed the start time of the event",
        path: 'startsAt',
        location: 'body',
      },
    ])
  })

  test('`isActive` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(omit(['isActive'], NOTIFICATION))
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...NOTIFICATION,
      startsAt: NOTIFICATION.startsAt.toISOString(),
    })
  })

  test('`isActive` field in request body being a boolean value', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .put(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...NOTIFICATION, isActive: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for setting the initial active state',
        path: 'isActive',
        location: 'body',
      },
    ])
  })
})

describe('PATCH /projects/:projectId/schedules/:scheduleId/events/:eventId/notification/is-active', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          create: {
            title: 'Schedule #1',
            events: {
              create: {
                ...EVENT,
                notification: {
                  create: { ...NOTIFICATION, authorId: AUTHOR_ID },
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
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .patch(
        `/api/projects/abc/schedules/${schedule.id}/events/${event.id}/notification/is-active`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ isActive: false })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Project not found',
        path: 'projectId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'Schedule not found',
        path: 'scheduleId',
        type: 'field',
        value: schedule.id,
      },
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
    ])
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .patch(
        `/api/projects/${project.id}/schedules/abc/events/${event.id}/notification/is-active`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ isActive: false })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Schedule not found',
        path: 'scheduleId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
    ])
  })

  it('returns 404 Not Found in case of invalid event id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .patch(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/abc/notification/is-active`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ isActive: false })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: 'abc',
      },
    ])
  })

  it("updates notification's status", async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .patch(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/is-active`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ isActive: false })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      ...NOTIFICATION,
      startsAt: NOTIFICATION.startsAt.toISOString(),
      isActive: false,
    })
  })

  it('fails to update a notification for a given event as it does not have one', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = await prismaClient.event.create({
      data: {
        ...EVENT,
        title: 'Notification #2',
        scheduleId: schedule.id,
      },
    })
    const res = await req
      .patch(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/is-active`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ isActive: false })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: event.id,
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        location: 'params',
      },
    ])
  })

  test('`isActive` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .patch(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/is-active`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({})
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'Invalid value was provided for setting the initial active state',
        path: 'isActive',
        location: 'body',
      },
    ])
  })

  test('`isActive` field in request body being a boolean value', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .patch(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/is-active`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ isActive: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid value was provided for setting the initial active state',
        path: 'isActive',
        location: 'body',
      },
    ])
  })
})

describe('DELETE /projects/:projectId/schedules/:scheduleId/events/:eventId/notification', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
        schedules: {
          create: {
            title: 'Schedule #1',
            events: {
              create: {
                ...EVENT,
                notification: {
                  create: { ...NOTIFICATION, authorId: AUTHOR_ID },
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
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .delete(
        `/api/projects/abc/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Project not found',
        path: 'projectId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'Schedule not found',
        path: 'scheduleId',
        type: 'field',
        value: schedule.id,
      },
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
    ])
  })

  it('returns 404 Not Found in case of invalid schedule id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .delete(
        `/api/projects/${project.id}/schedules/abc/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Schedule not found',
        path: 'scheduleId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: event.id,
      },
    ])
  })

  it('returns 404 Not Found in case of invalid event id', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const res = await req
      .delete(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/abc/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        location: 'params',
        msg: 'Event not found',
        path: 'eventId',
        type: 'field',
        value: 'abc',
      },
      {
        location: 'params',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        type: 'field',
        value: 'abc',
      },
    ])
  })

  it('deletes a notification', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const notification = (await prismaClient.notification.findFirst({
      select: notificationSelect,
    }))!
    const res = await req
      .delete(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...notification,
      createdAt: notification.createdAt.toISOString(),
      startsAt: notification.startsAt.toISOString(),
    })
  })

  it('fails to delete a notification for a given event as it does not have one', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = await prismaClient.event.create({
      data: {
        ...EVENT,
        title: 'Notification #2',
        scheduleId: schedule.id,
      },
    })
    const res = await req
      .delete(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: event.id,
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        location: 'params',
      },
    ])
  })
})
