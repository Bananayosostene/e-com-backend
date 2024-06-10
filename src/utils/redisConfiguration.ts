import dotenv from 'dotenv'
import { createClient } from 'redis'
import { REDIS_PASSWORD, REDIS_HOST, REDIS_PORT } from '../config'
import logger from './logger'

dotenv.config()

const redisClient = createClient({
  password: REDIS_PASSWORD,
  socket: {
    host: REDIS_HOST,
    port: REDIS_PORT,
    connectTimeout: 10000,
  },
})

redisClient.connect().catch((err) => {
  logger.log('error', `Redis connection error: ${err}`)
})
export default redisClient
