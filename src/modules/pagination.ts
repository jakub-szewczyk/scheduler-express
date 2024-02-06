import { Request } from 'express'

export const paginationParams = (
  req: Request<object, object, object, { page?: string; size?: string }>
) => ({
  page: req.query.page ? +req.query.page : 0,
  size: req.query.size ? +req.query.size : 10,
})
