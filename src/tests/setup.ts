import { beforeEach } from 'vitest'
import prismaClient from './client'

beforeEach(async () => {
  console.log('⏳[test]: purging database...')
  await prismaClient.project.deleteMany()
  console.log('✅[test]: database purged')
})
