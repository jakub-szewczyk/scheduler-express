import supertest from 'supertest'
import { beforeEach, describe, expect, it } from 'vitest'
import app from '../app'
import { NOTIFICATION } from '../modules/notification'
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
