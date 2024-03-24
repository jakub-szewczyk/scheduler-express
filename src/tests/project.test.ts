import { PrismaClient, Project } from '@prisma/client'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import supertest from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import app from '../app'
import { ordinals } from '../modules/common'

const execAsync = promisify(exec)

const AUTHOR_ID = process.env.AUTHOR_ID

const BEARER_TOKEN = `Bearer ${process.env.BEARER_TOKEN}`

const prismaClient = new PrismaClient()

const req = supertest(app)

beforeAll(async () => {
  try {
    console.log('⏳[test]: seeding database...')
    await execAsync(`npm run seed:test -- -a ${AUTHOR_ID}`)
    console.log('✅[test]: seeding finished')
  } catch (error) {
    console.error(error)
    await prismaClient.$disconnect()
    process.exit(1)
  }
})

describe('Project', () => {
  describe('GET /projects', () => {
    it('returns default projects', async () => {
      const res = await req
        .get('/api/projects')
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      const projects: Project[] = res.body.content
      expect(res.status).toEqual(200)
      expect(res.body).toMatchObject({
        page: 0,
        size: 10,
        total: 100,
      })
      expect(projects).toHaveLength(10)
      projects.forEach((project, index) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('createdAt')
        expect(project).toMatchObject({
          name: `Project #${100 - index}`,
          description: null,
        })
      })
    })

    it('returns 400 Bad Request when page number is negative', async () => {
      const res = await req
        .get('/api/projects')
        .query({ page: -1 })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      expect(res.status).toEqual(400)
      expect(res.body).toEqual([
        {
          type: 'field',
          value: '-1',
          msg: 'Page number must be a non-negative integer',
          path: 'page',
          location: 'query',
        },
      ])
    })

    Array(10)
      .fill(null)
      .forEach((_, page) =>
        it(`returns ${ordinals(page + 1)} project page`, async () => {
          const res = await req
            .get('/api/projects')
            .query({ page })
            .set('Accept', 'application/json')
            .set('Authorization', BEARER_TOKEN)
          const projects: Project[] = res.body.content
          expect(res.status).toEqual(200)
          expect(res.body).toMatchObject({
            page,
            size: 10,
            total: 100,
          })
          expect(projects).toHaveLength(10)
          projects.forEach((project, index) => {
            expect(project).toHaveProperty('id')
            expect(project).toHaveProperty('createdAt')
            expect(project).toMatchObject({
              name: `Project #${100 - index - page * 10}`,
              description: null,
            })
          })
        })
      )

    it('returns 400 Bad Request when page size is negative', async () => {
      const res = await req
        .get('/api/projects')
        .query({ size: -1 })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      expect(res.status).toEqual(400)
      expect(res.body).toEqual([
        {
          type: 'field',
          value: '-1',
          msg: 'Page size must be a non-negative integer',
          path: 'size',
          location: 'query',
        },
      ])
    })

    Array(101)
      .fill(null)
      .forEach((_, size) =>
        it(`returns ${size} ${size === 1 ? 'project' : 'projects'}`, async () => {
          const res = await req
            .get('/api/projects')
            .query({
              size,
            })
            .set('Accept', 'application/json')
            .set('Authorization', BEARER_TOKEN)
          const projects: Project[] = res.body.content
          expect(res.status).toEqual(200)
          expect(res.body).toMatchObject({
            page: 0,
            size,
            total: 100,
          })
          expect(projects).toHaveLength(size)
          projects.forEach((project, index) => {
            expect(project).toHaveProperty('id')
            expect(project).toHaveProperty('createdAt')
            expect(project).toMatchObject({
              name: `Project #${100 - index}`,
              description: null,
            })
          })
        })
      )

    // TODO: Write more tests
  })
})
