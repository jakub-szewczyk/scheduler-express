import supertest from 'supertest'
import { beforeAll, describe, expect, it } from 'vitest'
import app from '../app'

const TOKEN = process.env.BEARER_TOKEN

const req = supertest(app)

beforeAll(() => {
  // TODO: Seed database
})

describe('Project', () => {
  describe('GET /projects', () => {
    it('should return projects', async () => {
      const res = await req
        .get('/api/projects')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${TOKEN}`)
      expect(res.status).toEqual(200)
      // TODO:
      // Finish configuring testing setup.
      // Inspect why the test suit is running twice.
      expect(res.body).toEqual([])
    })
  })
})
