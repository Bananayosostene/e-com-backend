import { Request, Response, NextFunction } from 'express'

export interface ErrorType extends Error {
  statusCode?: number
}

export const ErrorHandler = (
  err: ErrorType,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errStatus = err.statusCode || 500
  const errMsg = err.message || 'Internal Server Error'
  res.status(errStatus).json({
    code: errStatus,
    message: errMsg,
    error: err,
  })
}

/**
 * Handles unregistered routes.
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<Response>} Promise that resolves to an Express response
 */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json('Route does not exist')
}
