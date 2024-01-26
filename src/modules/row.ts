import { Prisma, Row } from '@prisma/client'

export const ROWS: Prisma.RowCreateManyScheduleInput[] = [
  { day: 'Monday', index: 0 },
  { day: 'Tuesday', index: 1 },
  { day: 'Wednesday', index: 2 },
  { day: 'Thursday', index: 3 },
  { day: 'Friday', index: 4 },
]

export const rowsData = (rows: Pick<Row, 'day' | 'index'>[]) =>
  Prisma.validator<Prisma.RowCreateManyScheduleInput[]>()(rows)
