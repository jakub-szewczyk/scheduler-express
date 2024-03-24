import supertest from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import { seed } from '../../prisma/seed'
import app from '../app'
import { PrismaClient } from '@prisma/client'

const prismaClient = new PrismaClient()

const TOKEN = process.env.BEARER_TOKEN

const req = supertest(app)

beforeAll(async () => {
  try {
    // FIXME
    await seed()
    await prismaClient.$disconnect()
  } catch (error) {
    console.error(error)
    await prismaClient.$disconnect()
    process.exit(1)
  }
})

describe('Project', () => {
  describe('GET /projects', () => {
    it('should return projects', async () => {
      const res = await req
        .get('/api/projects')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${TOKEN}`)
      expect(res.status).toEqual(200)
      // TODO
      expect(res.body).toEqual([])
    })
  })
})
