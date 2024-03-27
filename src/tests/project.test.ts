import { Project } from '@prisma/client'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { ordinals } from '../modules/common'
import prismaClient from './client'

const BEARER_TOKEN = `Bearer ${process.env.BEARER_TOKEN}`

const req = supertest(app)

describe('Project', () => {
  describe('GET /projects', () => {
    beforeEach(async () => {
      console.log('⏳[test]: seeding database...')
      await prismaClient.project.createMany({
        data: Array(100)
          .fill(null)
          .map((_, index, array) => ({
            name: `Project #${array.length - index}`,
            authorId: process.env.AUTHOR_ID!,
            createdAt: new Date(Date.now() - index * 1000000).toISOString(),
          })),
      })
      console.log('✅[test]: seeding finished')
    })

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

    test('`page`, `size`, `name` and `createdAt` query param being optional', async () => {
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

    it('returns 400 Bad Request when the page number is negative', async () => {
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

    it('returns 400 Bad Request when the page number is not an integer', async () => {
      const res = await req
        .get('/api/projects')
        .query({ page: 'abc' })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      expect(res.status).toEqual(400)
      expect(res.body).toEqual([
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

    it('returns 400 Bad Request when the page size is negative', async () => {
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

    it('returns 400 Bad Request when the page size is not an integer', async () => {
      const res = await req
        .get('/api/projects')
        .query({ size: 'abc' })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      expect(res.status).toEqual(400)
      expect(res.body).toEqual([
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

    it('returns projects filtered by name', async () => {
      const res = await req
        .get('/api/projects')
        .query({
          name: 'project #10',
        })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      const projects: Project[] = res.body.content
      expect(res.status).toEqual(200)
      expect(res.body).toMatchObject({
        page: 0,
        size: 10,
        total: 2,
      })
      expect(projects).toHaveLength(2)
      projects.forEach((project) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('createdAt')
      })
      expect(projects[0]).toMatchObject({
        name: 'Project #100',
        description: null,
      })
      expect(projects[1]).toMatchObject({
        name: 'Project #10',
        description: null,
      })
    })

    test('case insensitivity in project search by name', async () => {
      const res1 = await req
        .get('/api/projects')
        .query({
          name: 'project #69',
        })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      const projects1: Project[] = res1.body.content
      expect(res1.status).toEqual(200)
      expect(res1.body).toMatchObject({
        page: 0,
        size: 10,
        total: 1,
      })
      expect(projects1).toHaveLength(1)
      expect(projects1[0]).toHaveProperty('id')
      expect(projects1[0]).toHaveProperty('createdAt')
      expect(projects1[0]).toMatchObject({
        name: 'Project #69',
        description: null,
      })
      const res2 = await req
        .get('/api/projects')
        .query({
          name: 'Project #69',
        })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      const projects2: Project[] = res2.body.content
      expect(res2.status).toEqual(200)
      expect(res2.body).toMatchObject({
        page: 0,
        size: 10,
        total: 1,
      })
      expect(projects1).toHaveLength(1)
      expect(projects2[0]).toHaveProperty('id')
      expect(projects2[0]).toHaveProperty('createdAt')
      expect(projects2[0]).toMatchObject({
        name: 'Project #69',
        description: null,
      })
    })

    it('returns an empty projects array if none are found', async () => {
      const res = await req
        .get('/api/projects')
        .query({
          name: 'project #420',
        })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      const projects: Project[] = res.body.content
      expect(res.status).toEqual(200)
      expect(res.body).toMatchObject({
        page: 0,
        size: 10,
        total: 0,
      })
      expect(projects).toHaveLength(0)
    })

    it('returns projects sorted by creation date in ascending order', async () => {
      const res = await req
        .get('/api/projects')
        .query({
          createdAt: 'ASC',
        })
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
      projects.forEach((project) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('createdAt')
      })
      projects
        .slice(1)
        .forEach((project, index) =>
          expect(new Date(project.createdAt).getTime()).toBeGreaterThan(
            new Date(projects[index].createdAt).getTime()
          )
        )
    })

    it('returns projects sorted by creation date in descending order', async () => {
      const res = await req
        .get('/api/projects')
        .query({
          createdAt: 'DESC',
        })
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
      projects.forEach((project) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('createdAt')
      })
      projects
        .slice(1)
        .forEach((project, index) =>
          expect(new Date(project.createdAt).getTime()).toBeLessThan(
            new Date(projects[index].createdAt).getTime()
          )
        )
    })

    it('returns projects sorted by creation date in descending order by default', async () => {
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
      projects.forEach((project) => {
        expect(project).toHaveProperty('id')
        expect(project).toHaveProperty('createdAt')
      })
      projects
        .slice(1)
        .forEach((project, index) =>
          expect(new Date(project.createdAt).getTime()).toBeLessThan(
            new Date(projects[index].createdAt).getTime()
          )
        )
    })

    it("returns 400 Bad Request when the `createdAt` query param is not one of the following values: ['ASC', 'DESC']", async () => {
      const res = await req
        .get('/api/projects')
        .query({ createdAt: 'abc' })
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
      expect(res.status).toEqual(400)
      expect(res.body).toEqual([
        {
          type: 'field',
          value: 'abc',
          msg: 'Invalid value was provided for sorting projects by creation date',
          path: 'createdAt',
          location: 'query',
        },
      ])
    })
  })
})
