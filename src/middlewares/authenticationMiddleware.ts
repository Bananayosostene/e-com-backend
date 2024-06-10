import { Response, Request, NextFunction } from 'express'
import { decodeToken } from '../utils/jwt'
import { getUserById } from '../services/userServices'
import { UserAttributes } from '../database/models/userModel'

declare global {
  namespace Express {
    interface Request {
      user?: UserAttributes
    }
  }
}

const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: 'Please Login' })
    }
    const token = req.headers.authorization.split(' ')[1]

    if (!token) {
      return res.status(401).json({ message: 'no access token found' })
    }

    const payload = await decodeToken(token)
    const user = await getUserById(payload.id)
      if (!user) {
        return res.status(401).json({ message: 'User not found' })
      }

      if(user.status === 'inactive'){
        return res.status(401).json({ message: 'User is disabled' });
      }

    req.user = user
    res.locals.decoded = user
    next()
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Internal server down', error: error.message })
  }
}

export default isAuthenticated

export const checkPermission =
  (permissionRole: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const userInfo = req.user

    const existingUser = await getUserById(userInfo.id)
    if (existingUser && existingUser.userRole === permissionRole) {
      return next()
    }
    return res.status(401).json({ code: 401, message: 'Unauthorized' })
  }

export const excludePermission =
  (excludeRole: string) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    const existingUser = await getUserById(user.id)
    if (existingUser && existingUser.userRole !== excludeRole) {
      return next()
    }
    return res.status(401).json({ code: 401, message: 'Unauthorized' })
  }
