import { NextFunction, Request, Response } from 'express'
import { ValidationError, validationResult } from 'express-validator'

export const validationMiddleware = (
  req: Request,
  res: Response<ValidationError[]>,
  next: NextFunction
) => {
  const result = validationResult(req)
  if (!result.isEmpty()) return res.status(400).json(result.array())
  next()
}
