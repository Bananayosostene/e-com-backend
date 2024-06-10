import { Socket } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'
import jwt from 'jsonwebtoken'

import { UserAttributes } from '../database/models/userModel'

interface JwtPayload extends UserAttributes {
  iat?: number
  exp?: number
}

const socketAuthMiddleware = (
  socket: Socket,
  next: (err?: ExtendedError) => void,
) => {
  const token = socket.handshake.auth.token
  if (!token) {
    const err = new Error('Authentication error') as ExtendedError
    err.data = { message: 'No token provided' }
    return next(err)
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: any, decoded: any) => {
      if (err || typeof decoded !== 'object') {
        const error = new Error('Authentication error') as ExtendedError
        error.data = { message: 'Failed to authenticate token' }
        return next(error)
      }
      socket.data.user = decoded as JwtPayload
      next()
    },
  )
}

export default socketAuthMiddleware
