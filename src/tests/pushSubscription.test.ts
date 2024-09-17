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

describe('POST /push-subscriptions', () => {
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

  it('creates a push subscription', async () => {
    const res = await req
      .post(`/api/push-subscriptions`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PUSH_SUBSCRIPTION)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body.entity).toMatchObject(PUSH_SUBSCRIPTION)
  })

  test('`endpoint` field in request body being required', async () => {
    const res = await req
      .post(`/api/push-subscriptions`)
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
    const res = await req
      .post(`/api/push-subscriptions`)
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
    const res = await req
      .post(`/api/push-subscriptions`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PUSH_SUBSCRIPTION)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body.entity).toMatchObject(PUSH_SUBSCRIPTION)
  })

  test('`expirationTime` field in request body following ISO 8601 standard', async () => {
    const res = await req
      .post(`/api/push-subscriptions`)
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
    const res = await req
      .post(`/api/push-subscriptions`)
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
    const res = await req
      .post(`/api/push-subscriptions`)
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
    const res = await req
      .post(`/api/push-subscriptions`)
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
    const res = await req
      .post(`/api/push-subscriptions`)
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
    const res = await req
      .post(`/api/push-subscriptions`)
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
