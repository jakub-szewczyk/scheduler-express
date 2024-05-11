import { omit } from 'ramda'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { EVENT } from '../modules/event'
import { NOTIFICATION } from '../modules/notification'
import { PUSH_SUBSCRIPTION } from '../modules/pushSubscription'
import prismaClient from './client'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('POST /projects/:projectId/schedules/:scheduleId/events/:eventId/notification/push-subscriptions', () => {
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
                  create: NOTIFICATION,
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
      .post(
        `/api/projects/abc/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PUSH_SUBSCRIPTION)
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
      {
        type: 'field',
        value: event.id,
        msg: 'A notification for the specified event has not yet been created',
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
        `/api/projects/${project.id}/schedules/abc/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PUSH_SUBSCRIPTION)
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
      {
        type: 'field',
        value: event.id,
        msg: 'A notification for the specified event has not yet been created',
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
        `/api/projects/${project.id}/schedules/${schedule.id}/events/abc/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PUSH_SUBSCRIPTION)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Event not found',
        path: 'eventId',
        location: 'params',
      },
      {
        type: 'field',
        value: 'abc',
        msg: 'A notification for the specified event has not yet been created',
        path: 'eventId',
        location: 'params',
      },
    ])
  })

  it('creates a push subscription', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PUSH_SUBSCRIPTION)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body.entity).toMatchObject(PUSH_SUBSCRIPTION)
  })

  test('`endpoint` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(omit(['endpoint'], PUSH_SUBSCRIPTION))
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'Push subscription endpoint is missing',
        path: 'endpoint',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Push subscription endpoint must be a valid url',
        path: 'endpoint',
        location: 'body',
      },
    ])
  })

  test('`endpoint` field in request body being a valid url', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...omit(['endpoint'], PUSH_SUBSCRIPTION), endpoint: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Push subscription endpoint must be a valid url',
        path: 'endpoint',
        location: 'body',
      },
    ])
  })

  test('`expirationTime` field in request body being optional', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PUSH_SUBSCRIPTION)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body.entity).toMatchObject(PUSH_SUBSCRIPTION)
  })

  test('`expirationTime` field in request body following ISO 8601 standard', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...PUSH_SUBSCRIPTION, expirationTime: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Push subscription expiration time must follow the ISO 8601 standard.',
        path: 'expirationTime',
        location: 'body',
      },
    ])
  })

  test('`keys` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(omit(['keys'], PUSH_SUBSCRIPTION))
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'Missing push subscription keys',
        path: 'keys',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Invalid push subscription keys object',
        path: 'keys',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Missing push subscription p256dh key',
        path: 'keys.p256dh',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Missing push subscription auth key',
        path: 'keys.auth',
        location: 'body',
      },
    ])
  })

  test('`keys` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(omit(['keys'], PUSH_SUBSCRIPTION))
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'Missing push subscription keys',
        path: 'keys',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Invalid push subscription keys object',
        path: 'keys',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Missing push subscription p256dh key',
        path: 'keys.p256dh',
        location: 'body',
      },
      {
        type: 'field',
        msg: 'Missing push subscription auth key',
        path: 'keys.auth',
        location: 'body',
      },
    ])
  })

  test('`keys` field in request body being an object', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ ...PUSH_SUBSCRIPTION, keys: 'abc' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Invalid push subscription keys object',
        path: 'keys',
        location: 'body',
      },
    ])
  })

  test('`keys.p256dh` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        ...PUSH_SUBSCRIPTION,
        keys: {
          auth: PUSH_SUBSCRIPTION.keys.auth,
        },
      })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'Missing push subscription p256dh key',
        path: 'keys.p256dh',
        location: 'body',
      },
    ])
  })

  test('`keys.auth` field in request body being required', async () => {
    const project = (await prismaClient.project.findFirst())!
    const schedule = (await prismaClient.schedule.findFirst())!
    const event = (await prismaClient.event.findFirst())!
    const res = await req
      .post(
        `/api/projects/${project.id}/schedules/${schedule.id}/events/${event.id}/notification/push-subscriptions`
      )
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        ...PUSH_SUBSCRIPTION,
        keys: {
          p256dh: PUSH_SUBSCRIPTION.keys.p256dh,
        },
      })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        msg: 'Missing push subscription auth key',
        path: 'keys.auth',
        location: 'body',
      },
    ])
  })
})
