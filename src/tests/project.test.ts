import { PrismaClient, Project } from '@prisma/client'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import supertest from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import app from '../app'

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
    it('returns default content', async () => {
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

    it('returns second page', async () => {
      const res = await req
        .get('/api/projects?page=1')
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      const projects: Project[] = res.body.content
      expect(res.status).toEqual(200)
      expect(res.body).toMatchObject({
        page: 1,
        size: 10,
        total: 100,
      })
      expect(projects).toHaveLength(10)
      projects.forEach((project, index) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('createdAt')
        expect(project).toMatchObject({
          name: `Project #${90 - index}`,
          description: null,
        })
      })
    })

    it('returns fourth page', async () => {
      const res = await req
        .get('/api/projects?page=3')
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      const projects: Project[] = res.body.content
      expect(res.status).toEqual(200)
      expect(res.body).toMatchObject({
        page: 3,
        size: 10,
        total: 100,
      })
      expect(projects).toHaveLength(10)
      projects.forEach((project, index) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('createdAt')
        expect(project).toMatchObject({
          name: `Project #${70 - index}`,
          description: null,
        })
      })
    })

    // TODO: Write more tests
  })
})
