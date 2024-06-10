import { Socket } from 'socket.io'
import { UserAttributes } from '../database/models/userModel'

export interface CustomSocket extends Socket {
  user: UserAttributes
}
