import { Project } from '@prisma/client'
import supertest from 'supertest'
import { beforeEach, describe, expect, it, test } from 'vitest'
import app from '../app'
import { ordinals } from '../modules/common'
import { PROJECT, projectSelect } from '../modules/project'
import prismaClient from './client'

const AUTHOR_ID = process.env.AUTHOR_ID

if (!AUTHOR_ID) throw new Error('Missing `AUTHOR_ID` in .env.test')

const JWT_TOKEN = process.env.JWT_TOKEN

if (!JWT_TOKEN) throw new Error('Missing `JWT_TOKEN` in .env.test')

const BEARER_TOKEN = `Bearer ${JWT_TOKEN}`

const req = supertest(app)

describe('GET /projects', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.createMany({
      data: Array(100)
        .fill(null)
        .map((_, index, array) => ({
          title: `Project #${array.length - index}`,
          authorId: AUTHOR_ID,
          createdAt: new Date(Date.now() - index * 1000000).toISOString(),
        })),
    })
    console.log('✅[test]: seeding finished')
  })

  test('`page`, `size`, `title` and `createdAt` query param being optional', async () => {
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
        title: `Project #${100 - index}`,
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
    const res = await req
      .get('/api/projects')
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
            title: `Project #${100 - index - page * 10}`,
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
    const res = await req
      .get('/api/projects')
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
      it(`returns ${size} ${size === 1 ? 'project' : 'projects'}`, async () => {
        const res = await req
          .get('/api/projects')
          .query({ size })
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
            title: `Project #${100 - index}`,
            description: null,
          })
        })
      })
    )

  it('returns projects filtered by title', async () => {
    const res = await req
      .get('/api/projects')
      .query({ title: 'project #10' })
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
      title: 'Project #100',
      description: null,
    })
    expect(projects[1]).toMatchObject({
      title: 'Project #10',
      description: null,
    })
  })

  test('case insensitivity in project search by title', async () => {
    const res1 = await req
      .get('/api/projects')
      .query({ title: 'project #69' })
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
      title: 'Project #69',
      description: null,
    })
    const res2 = await req
      .get('/api/projects')
      .query({ title: 'Project #69' })
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
      title: 'Project #69',
      description: null,
    })
  })

  it('returns an empty projects array if none are found', async () => {
    const res = await req
      .get('/api/projects')
      .query({ title: 'project #420' })
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
      .query({ createdAt: 'ASC' })
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
      .query({ createdAt: 'DESC' })
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
    expect(res.body).toStrictEqual([
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

describe('GET /projects/:projectId', () => {
  beforeEach(async () => {
    console.log('⏳[test]: seeding database...')
    await prismaClient.project.create({
      data: {
        ...PROJECT,
        authorId: AUTHOR_ID,
      },
    })
    console.log('✅[test]: seeding finished')
  })

  it('returns a project by id', async () => {
    const project = (await prismaClient.project.findFirst({
      select: projectSelect,
    }))!
    const res = await req
      .get(`/api/projects/${project.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...project,
      createdAt: project.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const res = await req
      .get('/api/projects/abc')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual({})
  })
})

describe('POST /projects', () => {
  it('creates a project', async () => {
    const res = await req
      .post('/api/projects')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send(PROJECT)
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject(PROJECT)
  })

  test('`description` field in request body being optional', async () => {
    const res = await req
      .post('/api/projects')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Project #1',
      })
    expect(res.status).toEqual(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body).toHaveProperty('createdAt')
    expect(res.body).toMatchObject({
      title: 'Project #1',
    })
  })

  test('`title` field in request body being required', async () => {
    const res = await req
      .post('/api/projects')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: '' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your project a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the project title is already taken', async () => {
    await prismaClient.project.create({
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    const res = await req
      .post('/api/projects')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Project #1' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Project #1',
        msg: 'This title has already been used by one of your projects',
        path: 'title',
        location: 'body',
      },
    ])
  })
})

describe('PUT /projects/:projectId', () => {
  it('updates a project', async () => {
    const project = await prismaClient.project.create({
      select: projectSelect,
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Project #2',
        description: 'This is the second project',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toStrictEqual({
      ...project,
      title: 'Project #2',
      description: 'This is the second project',
      createdAt: project.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const res = await req
      .put('/api/projects/abc')
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Project #2',
        description: 'This is the second project',
      })
    expect(res.status).toEqual(404)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'abc',
        msg: 'Project not found',
        path: 'projectId',
        location: 'params',
      },
    ])
  })

  test('`title` field in request body being required', async () => {
    const project = await prismaClient.project.create({
      select: projectSelect,
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    const [res1, res2] = await Promise.all([
      req
        .put(`/api/projects/${project.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({}),
      req
        .put(`/api/projects/${project.id}`)
        .set('Accept', 'application/json')
        .set('Authorization', BEARER_TOKEN)
        .send({ title: '' }),
    ])
    expect(res1.status).toEqual(400)
    expect(res1.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your project a unique title',
        path: 'title',
        location: 'body',
      },
    ])
    expect(res2.status).toEqual(400)
    expect(res2.body).toStrictEqual([
      {
        type: 'field',
        value: '',
        msg: 'You have to give your project a unique title',
        path: 'title',
        location: 'body',
      },
    ])
  })

  it('returns 400 Bad Request when the project title is already taken', async () => {
    await prismaClient.project.createMany({
      data: [
        {
          title: 'Project #1',
          authorId: AUTHOR_ID,
        },
        {
          title: 'Project #2',
          authorId: AUTHOR_ID,
        },
      ],
    })
    const project = (await prismaClient.project.findFirst({
      select: projectSelect,
    }))!
    const res = await req
      .put(`/api/projects/${project.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({ title: 'Project #2' })
    expect(res.status).toEqual(400)
    expect(res.body).toStrictEqual([
      {
        type: 'field',
        value: 'Project #2',
        msg: 'This title has already been used by one of your projects',
        path: 'title',
        location: 'body',
      },
    ])
  })

  test('`description` field in request body being optional', async () => {
    const project = await prismaClient.project.create({
      select: projectSelect,
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    const res = await req
      .put(`/api/projects/${project.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
      .send({
        title: 'Project #2',
      })
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...project,
      title: 'Project #2',
      createdAt: project.createdAt.toISOString(),
    })
  })
})

describe('DELETE /projects/:projectId', () => {
  it('deletes a project', async () => {
    const project = await prismaClient.project.create({
      select: projectSelect,
      data: {
        title: 'Project #1',
        authorId: AUTHOR_ID,
      },
    })
    const res = await req
      .delete(`/api/projects/${project.id}`)
      .set('Accept', 'application/json')
      .set('Authorization', BEARER_TOKEN)
    expect(res.status).toEqual(200)
    expect(res.body).toMatchObject({
      ...project,
      createdAt: project.createdAt.toISOString(),
    })
  })

  it('returns 404 Not Found in case of invalid project id', async () => {
    const res = await req
      .delete('/api/projects/abc')
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
    ])
  })
})
