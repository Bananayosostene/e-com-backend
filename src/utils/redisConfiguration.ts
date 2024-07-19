import dotenv from 'dotenv'
import { createClient } from 'redis'
import logger from './logger'

dotenv.config()

const redisClient = createClient({
  url: process.env.REDIS_URL,
  pingInterval: 5000,
  socket: {
    connectTimeout: 20000,
  },
})

redisClient.on('error', (err) => {
  logger.log('error', `Redis client error: ${err}`)
})

redisClient.on('connect', () => {
  logger.log('info', 'Redis client connected')
})

redisClient.on('ready', () => {
  logger.log('info', 'Redis client ready')
})

redisClient.on('end', () => {
  logger.log('info', 'Redis client disconnected')
})

redisClient.connect().catch((err) => {
  logger.log('error', `Failed to connect to Redis: ${err}`)
})

export default redisClient
